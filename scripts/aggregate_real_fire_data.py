from __future__ import annotations

import argparse
import json
import os
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd
from pyproj import Transformer


GRID_SCHEME = "EPSG:6933_project_grid"
GRID_SIZE_METERS = 25_000
GRID_ORIGIN_X = 0
GRID_ORIGIN_Y = 0
FRP_TOLERANCE_ABSOLUTE = 1e-6
FRP_TOLERANCE_RELATIVE = 1e-12
REQUIRED_INPUT_COLUMNS = {
    "satellite", "acquisition_utc", "latitude", "longitude", "frp",
    "confidence_normalized", "source_file", "version",
}
OUTPUT_COLUMNS = [
    "cell_id", "lat", "lon", "year", "month", "date",
    "sensor_family", "instrument", "satellite", "source_product_id",
    "product_version", "detection_count", "has_detection_record",
    "observation_effort_available", "observation_effort_status",
    "coverage_status", "frp_sum", "frp_mean", "frp_median", "frp_max",
    "frp_p95", "confidence_values", "confidence_normalized_values",
    "confidence_normalized_mean", "confidence_normalized_median",
    "confidence_normalized_min", "confidence_normalized_max",
    "instrument_values", "source_file_count", "source_files",
    "source_product_ids", "product_versions",
    "same_day_spatial_colocation_candidate",
    "same_day_spatial_colocation_candidate_count", "grid_scheme",
    "grid_resolution_m", "projection_epsg", "grid_origin_x_m",
    "grid_origin_y_m", "harmonized_count", "harmonization_status",
    "ci_lower", "ci_upper", "uncertainty_status",
]


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Build the separate real FIRMS monthly aggregation.")
    parser.add_argument("--input", type=Path, default=root / "data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet")
    parser.add_argument("--output", type=Path, default=root / "data/firewatch/real_monthly_aggregation.parquet")
    parser.add_argument("--report", type=Path, default=root / "data/firewatch/real_monthly_aggregation_validation_report.md")
    return parser.parse_args()


def unique_values(series: pd.Series) -> list[str]:
    return [str(value) for value in pd.unique(series)]


def one_or_empty(series: pd.Series) -> str:
    values = unique_values(series)
    return values[0] if len(values) == 1 else "MIXED"


def sensor_family_from_source(source_file: pd.Series) -> pd.Series:
    source = source_file.astype("string")
    return source.str.upper().map(lambda value: "MODIS" if "MODIS" in value else "VIIRS" if "VIIRS" in value else pd.NA)


def add_grid_fields(frame: pd.DataFrame) -> pd.DataFrame:
    transformer = Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True)
    x, y = transformer.transform(frame["longitude"].to_numpy(), frame["latitude"].to_numpy())
    frame = frame.copy()
    frame["x_index"] = np.floor((x - GRID_ORIGIN_X) / GRID_SIZE_METERS).astype("int64")
    frame["y_index"] = np.floor((y - GRID_ORIGIN_Y) / GRID_SIZE_METERS).astype("int64")
    frame["cell_id"] = "ea25_" + frame["x_index"].astype(str) + "_" + frame["y_index"].astype(str)
    frame["cell_x_min"] = GRID_ORIGIN_X + frame["x_index"] * GRID_SIZE_METERS
    frame["cell_x_max"] = frame["cell_x_min"] + GRID_SIZE_METERS
    frame["cell_y_min"] = GRID_ORIGIN_Y + frame["y_index"] * GRID_SIZE_METERS
    frame["cell_y_max"] = frame["cell_y_min"] + GRID_SIZE_METERS
    inverse = Transformer.from_crs("EPSG:6933", "EPSG:4326", always_xy=True)
    frame["lon"], frame["lat"] = inverse.transform(
        frame["cell_x_min"] + GRID_SIZE_METERS / 2,
        frame["cell_y_min"] + GRID_SIZE_METERS / 2,
    )
    assigned = (
        (x >= frame["cell_x_min"]) & (x < frame["cell_x_max"])
        & (y >= frame["cell_y_min"]) & (y < frame["cell_y_max"])
    )
    if not bool(np.all(assigned)):
        raise ValueError("At least one valid detection was not assigned to exactly one grid cell")
    return frame


def validate_input(frame: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    missing = sorted(REQUIRED_INPUT_COLUMNS - set(frame.columns))
    if missing:
        raise ValueError(f"Input is missing required columns: {missing}")
    valid = (
        frame["satellite"].notna()
        & frame["acquisition_utc"].notna()
        & frame["latitude"].between(-90, 90)
        & frame["longitude"].between(-180, 180)
        & frame["frp"].notna()
        & (frame["frp"] >= 0)
        & frame["confidence_normalized"].notna()
        & frame["confidence_normalized"].between(0, 1)
        & frame["source_file"].notna()
        & frame["version"].notna()
    )
    accounting = {
        "input_records": len(frame),
        "valid_assigned_candidates": int(valid.sum()),
        "invalid_or_unassignable": int((~valid).sum()),
    }
    if accounting["input_records"] != accounting["valid_assigned_candidates"] + accounting["invalid_or_unassignable"]:
        raise ValueError("Input record accounting does not balance")
    valid_frame = frame.loc[valid].copy()
    valid_frame["source_product_id"] = valid_frame["source_file"].map(lambda value: Path(str(value)).stem)
    valid_frame["sensor_family"] = sensor_family_from_source(valid_frame["source_file"])
    valid_frame["year"] = valid_frame["acquisition_utc"].dt.year.astype("int32")
    valid_frame["month"] = valid_frame["acquisition_utc"].dt.month.astype("int8")
    valid_frame["date"] = valid_frame["acquisition_utc"].dt.strftime("%Y-%m-01")
    return valid_frame, accounting


def add_colocation_diagnostics(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    frame["utc_date"] = frame["acquisition_utc"].dt.date
    frame["lat01"] = np.floor(frame["latitude"] * 100).astype("int64")
    frame["lon01"] = np.floor(frame["longitude"] * 100).astype("int64")
    diagnostic_key = ["utc_date", "lat01", "lon01"]
    platform_counts = frame.groupby(diagnostic_key, observed=True)["satellite"].transform("nunique")
    frame["same_day_spatial_colocation_candidate"] = platform_counts >= 2
    frame["colocation_group_key"] = frame[diagnostic_key].astype(str).agg("|".join, axis=1)
    candidate_counts = frame.loc[frame["same_day_spatial_colocation_candidate"]].groupby("colocation_group_key").size()
    frame["same_day_spatial_colocation_candidate_count"] = frame["colocation_group_key"].map(candidate_counts).fillna(0).astype("int32")
    return frame


def aggregate(frame: pd.DataFrame) -> pd.DataFrame:
    frame = add_grid_fields(add_colocation_diagnostics(frame))
    identity = ["cell_id", "year", "month", "satellite", "source_product_id", "version"]
    grouped = frame.groupby(identity, observed=True, sort=True)
    result = grouped.agg(
        lat=("lat", "first"), lon=("lon", "first"), date=("date", "first"),
        sensor_family=("sensor_family", one_or_empty), instrument=("instrument", one_or_empty),
        detection_count=("frp", "size"), has_detection_record=("frp", lambda values: True),
        frp_sum=("frp", "sum"), frp_mean=("frp", "mean"), frp_median=("frp", "median"),
        frp_max=("frp", "max"), frp_p95=("frp", lambda values: float(values.quantile(0.95))),
        confidence_values=("confidence", unique_values),
        confidence_normalized_values=("confidence_normalized", lambda values: [float(value) for value in values]),
        confidence_normalized_mean=("confidence_normalized", "mean"),
        confidence_normalized_median=("confidence_normalized", "median"),
        confidence_normalized_min=("confidence_normalized", "min"),
        confidence_normalized_max=("confidence_normalized", "max"),
        instrument_values=("instrument", unique_values),
        source_file_count=("source_file", "nunique"), source_files=("source_file", unique_values),
        source_product_ids=("source_product_id", unique_values), product_versions=("version", unique_values),
        same_day_spatial_colocation_candidate=("same_day_spatial_colocation_candidate", "any"),
        same_day_spatial_colocation_candidate_count=("same_day_spatial_colocation_candidate_count", "sum"),
    ).reset_index()
    result = result.rename(columns={"version": "product_version"})
    result["observation_effort_available"] = False
    result["observation_effort_status"] = "not_provided"
    result["coverage_status"] = "observed_detection"
    result["grid_scheme"] = GRID_SCHEME
    result["grid_resolution_m"] = GRID_SIZE_METERS
    result["projection_epsg"] = 6933
    result["grid_origin_x_m"] = GRID_ORIGIN_X
    result["grid_origin_y_m"] = GRID_ORIGIN_Y
    result["harmonized_count"] = pd.NA
    result["harmonization_status"] = "not_calibrated"
    result["ci_lower"] = pd.NA
    result["ci_upper"] = pd.NA
    result["uncertainty_status"] = "not_estimated"
    return result[OUTPUT_COLUMNS]


def validate_output(output: pd.DataFrame, valid_input: pd.DataFrame, accounting: dict) -> dict:
    missing = sorted(set(OUTPUT_COLUMNS) - set(output.columns))
    if missing:
        raise ValueError(f"Output is missing required columns: {missing}")
    identity = ["cell_id", "year", "month", "satellite", "source_product_id", "product_version"]
    duplicate_keys = int(output.duplicated(identity).sum())
    if duplicate_keys:
        raise ValueError(f"Output contains {duplicate_keys} duplicate aggregation keys")
    if len(output) == 0 or not output["has_detection_record"].all():
        raise ValueError("Output contains invalid detection-record presence values")
    if output["observation_effort_available"].any():
        raise ValueError("Observation effort was incorrectly inferred")
    if output["harmonized_count"].notna().any() or output["ci_lower"].notna().any() or output["ci_upper"].notna().any():
        raise ValueError("Output contains prohibited fabricated harmonization or uncertainty values")
    per_platform = {}
    for platform, source in valid_input.groupby("satellite"):
        grouped_rows = output.loc[output["satellite"] == platform]
        input_count = len(source)
        output_count = int(grouped_rows["detection_count"].sum())
        input_frp = float(source["frp"].sum())
        output_frp = float(grouped_rows["frp_sum"].sum())
        frp_difference = input_frp - output_frp
        tolerance = max(FRP_TOLERANCE_ABSOLUTE, abs(input_frp) * FRP_TOLERANCE_RELATIVE)
        if input_count != output_count:
            raise ValueError(f"Record conservation failed for {platform}: {input_count} != {output_count}")
        if abs(frp_difference) > tolerance:
            raise ValueError(f"FRP conservation failed for {platform}: difference {frp_difference} > tolerance {tolerance}")
        per_platform[str(platform)] = {
            "input_records": input_count, "grouped_records": output_count,
            "record_difference": input_count - output_count,
            "input_frp_sum": input_frp, "grouped_frp_sum": output_frp,
            "frp_difference": frp_difference, "frp_tolerance": tolerance,
        }
    source_files = set(valid_input["source_file"].astype(str))
    output_lineage = {file_name for values in output["source_files"] for file_name in values}
    if source_files != output_lineage:
        raise ValueError(f"Source-file lineage mismatch: input={source_files - output_lineage}, output={output_lineage - source_files}")
    if (output["source_file_count"] != output["source_files"].map(len)).any():
        raise ValueError("Source-file count does not match source-file lineage")
    return {
        "input_accounting": accounting,
        "output_rows": len(output),
        "unique_aggregation_keys": int(len(output)),
        "per_platform": per_platform,
        "source_files": sorted(source_files),
        "source_file_count": len(source_files),
    }


def write_report(path: Path, input_path: Path, output_path: Path, output: pd.DataFrame, validation: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    platform_lines = []
    for platform, values in validation["per_platform"].items():
        platform_lines.append(
            f"| {platform} | {values['input_records']} | {values['grouped_records']} | {values['record_difference']} | "
            f"{values['input_frp_sum']:.12f} | {values['grouped_frp_sum']:.12f} | {values['frp_difference']:.12g} | {values['frp_tolerance']:.12g} |"
        )
    report = "\n".join([
        "# Real FIRMS Monthly Aggregation Validation Report",
        "",
        "## Status",
        "",
        "Validation passed. The output was published only after all mandatory checks succeeded.",
        "",
        "## Provenance",
        "",
        f"- Input: `{input_path}`",
        f"- Output: `{output_path}`",
        f"- Input file count: `{validation['source_file_count']}`",
        f"- Source files: `{json.dumps(validation['source_files'])}`",
        f"- Grid: `{GRID_SCHEME}`",
        f"- Projection: `EPSG:6933`",
        f"- Grid origin: `({GRID_ORIGIN_X}, {GRID_ORIGIN_Y})` metres",
        f"- Cell size: `{GRID_SIZE_METERS}` metres",
        "- Binning: `floor((x - x0) / 25000)`, `floor((y - y0) / 25000)`",
        "- Cell ID: `ea25_{x_index}_{y_index}`",
        "- Observation effort: unavailable; not inferred",
        "- Cross-sensor matching: diagnostic same-day 0.01-degree co-location flags only",
        "",
        "## Accounting",
        "",
        f"- Input records: `{validation['input_accounting']['input_records']}`",
        f"- Valid assigned candidates: `{validation['input_accounting']['valid_assigned_candidates']}`",
        f"- Invalid or unassignable: `{validation['input_accounting']['invalid_or_unassignable']}`",
        f"- Output rows: `{validation['output_rows']}`",
        f"- Unique aggregation keys: `{validation['unique_aggregation_keys']}`",
        "",
        "## Per-Platform Conservation",
        "",
        "| Satellite | Input Records | Grouped Records | Record Difference | Input FRP Sum | Grouped FRP Sum | FRP Difference | Tolerance |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
        *platform_lines,
        "",
        "## Output Schema",
        "",
        *[f"- `{column}`" for column in OUTPUT_COLUMNS],
        "",
        "## Scientific Restrictions",
        "",
        "- `harmonized_count`, LFAI values, calibrated probabilities, and confidence intervals were not generated.",
        "- Missing detection records were not interpreted as zero fires.",
        "- Original raw records and the synthetic harmonized dataset were not modified.",
    ])
    path.write_text(report, encoding="utf-8")


def run(input_path: Path, output_path: Path, report_path: Path) -> dict:
    raw = pd.read_parquet(input_path)
    raw["acquisition_utc"] = pd.to_datetime(raw["acquisition_utc"], errors="coerce", utc=True)
    valid_input, accounting = validate_input(raw)
    output = aggregate(valid_input)
    validation = validate_output(output, valid_input, accounting)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    output_fd, output_temp_name = tempfile.mkstemp(prefix="real_monthly_aggregation_", suffix=".parquet.tmp", dir=output_path.parent)
    report_fd, report_temp_name = tempfile.mkstemp(prefix="real_monthly_aggregation_report_", suffix=".md.tmp", dir=report_path.parent)
    os.close(output_fd)
    os.close(report_fd)
    output_temp = Path(output_temp_name)
    report_temp = Path(report_temp_name)
    try:
        output.to_parquet(output_temp, index=False)
        reloaded = pd.read_parquet(output_temp)
        reloaded_validation = validate_output(reloaded, valid_input, accounting)
        write_report(report_temp, input_path, output_path, reloaded, reloaded_validation)
        os.replace(output_temp, output_path)
        os.replace(report_temp, report_path)
    except Exception:
        output_temp.unlink(missing_ok=True)
        report_temp.unlink(missing_ok=True)
        raise
    return validation


if __name__ == "__main__":
    arguments = parse_args()
    result = run(arguments.input, arguments.output, arguments.report)
    print(json.dumps(result, indent=2, default=str))