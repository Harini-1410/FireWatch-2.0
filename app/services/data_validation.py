from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

import pandas as pd

HARMONIZED_REQUIRED = {
    "year", "month", "lat", "lon", "harmonized_count", "modis_count", "viirs_count", "n_sensors"
}
HARMONIZED_OPTIONAL = {"cell_id", "date", "confidence", "acquisition_utc", "satellite", "anomaly_value", "alert_status"}
RAW_REQUIRED = {"satellite", "acquisition_utc", "latitude", "longitude", "frp", "confidence_normalized"}
RAW_OPTIONAL = {
    "instrument", "acq_date", "acq_time", "acq_time_utc", "confidence", "included_in_lfai",
    "bright_ti4", "bright_ti5", "brightness", "bright_t31", "scan", "track", "daynight",
    "fire_type", "version", "source_file",
}
REAL_AGGREGATION_REQUIRED = {
    "cell_id", "lat", "lon", "year", "month", "satellite", "source_product_id",
    "product_version", "detection_count", "frp_sum", "has_detection_record",
    "observation_effort_available", "harmonized_count", "ci_lower", "ci_upper",
}
REAL_AGGREGATION_OPTIONAL = {
    "date", "sensor_family", "instrument", "frp_mean", "frp_median", "frp_max", "frp_p95",
    "confidence_values", "confidence_normalized_values", "confidence_normalized_mean",
    "confidence_normalized_median", "confidence_normalized_min", "confidence_normalized_max",
    "instrument_values", "source_file_count", "source_files", "source_product_ids",
    "product_versions", "same_day_spatial_colocation_candidate",
    "same_day_spatial_colocation_candidate_count", "grid_scheme", "grid_resolution_m",
    "projection_epsg", "grid_origin_x_m", "grid_origin_y_m", "harmonization_status",
    "uncertainty_status",
}

SCHEMA_CONTRACTS = {
    "harmonized": {"required": sorted(HARMONIZED_REQUIRED), "optional": sorted(HARMONIZED_OPTIONAL)},
    "raw_detections": {"required": sorted(RAW_REQUIRED), "optional": sorted(RAW_OPTIONAL)},
    "real_aggregation": {"required": sorted(REAL_AGGREGATION_REQUIRED), "optional": sorted(REAL_AGGREGATION_OPTIONAL)},
}


@dataclass
class ValidationResult:
    dataframe: pd.DataFrame
    valid: bool
    missing_columns: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def validate_harmonized(dataframe: pd.DataFrame) -> ValidationResult:
    result = _validate(dataframe, HARMONIZED_REQUIRED, harmonized=True)
    if not result.missing_columns:
        missing_optional = sorted(HARMONIZED_OPTIONAL - set(dataframe.columns))
        result.warnings.extend([f"optional harmonized column unavailable: {column}" for column in missing_optional])
    return result


def validate_raw(dataframe: pd.DataFrame) -> ValidationResult:
    return _validate(dataframe, RAW_REQUIRED, harmonized=False)


def validate_real_aggregation(dataframe: pd.DataFrame) -> ValidationResult:
    frame = dataframe.copy()
    missing = sorted(REAL_AGGREGATION_REQUIRED - set(frame.columns))
    warnings: list[str] = []
    if missing:
        return ValidationResult(frame, False, missing, warnings)
    key = ["cell_id", "year", "month", "satellite", "source_product_id", "product_version"]
    duplicate_keys = int(frame.duplicated(key).sum())
    if duplicate_keys:
        warnings.append(f"{duplicate_keys} duplicate aggregation keys detected")
    effort_inferred = bool(frame["observation_effort_available"].fillna(True).any())
    if effort_inferred:
        warnings.append("real aggregation contains inferred observation effort")
    prohibited_values = bool(frame["harmonized_count"].notna().any() or frame["ci_lower"].notna().any() or frame["ci_upper"].notna().any())
    if prohibited_values:
        warnings.append("real aggregation contains prohibited harmonized or uncertainty values")
    invalid_counts = pd.to_numeric(frame["detection_count"], errors="coerce").isna() | (pd.to_numeric(frame["detection_count"], errors="coerce") <= 0)
    if invalid_counts.any():
        warnings.append(f"{int(invalid_counts.sum())} rows have invalid detection counts")
    invalid_frp = pd.to_numeric(frame["frp_sum"], errors="coerce").isna() | (pd.to_numeric(frame["frp_sum"], errors="coerce") < 0)
    if invalid_frp.any():
        warnings.append(f"{int(invalid_frp.sum())} rows have invalid FRP sums")
    invalid_months = ~pd.to_numeric(frame["month"], errors="coerce").between(1, 12)
    if invalid_months.any():
        warnings.append(f"{int(invalid_months.sum())} rows have invalid month values")
    return ValidationResult(frame, not (duplicate_keys or effort_inferred or prohibited_values or bool(invalid_months.any()) or bool(invalid_counts.any()) or bool(invalid_frp.any())), [], warnings)


def _validate(dataframe: pd.DataFrame, required: Iterable[str], harmonized: bool) -> ValidationResult:
    frame = dataframe.copy()
    missing = sorted(set(required) - set(frame.columns))
    warnings: list[str] = []
    if missing:
        return ValidationResult(frame, False, missing, warnings)

    numeric_columns = ["year", "month", "lat", "lon", "harmonized_count", "modis_count", "viirs_count", "n_sensors"] if harmonized else ["latitude", "longitude", "frp", "confidence_normalized"]
    for column in numeric_columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    if harmonized:
        if "confidence" not in frame:
            frame["confidence"] = pd.NA
        invalid_months = frame["month"].notna() & ~frame["month"].between(1, 12)
        if invalid_months.any():
            warnings.append(f"{int(invalid_months.sum())} rows have invalid month values")
        invalid_confidence = frame["confidence"].notna() & ~frame["confidence"].between(0, 1)
        if invalid_confidence.any():
            warnings.append(f"{int(invalid_confidence.sum())} rows have confidence outside [0, 1]")
        if "acquisition_utc" in frame:
            frame["acquisition_utc"] = pd.to_datetime(frame["acquisition_utc"], errors="coerce", utc=True)
    else:
        frame["acquisition_utc"] = pd.to_datetime(frame["acquisition_utc"], errors="coerce", utc=True)
        invalid_frp = frame["frp"].isna() | (frame["frp"] < 0)
        if invalid_frp.any():
            warnings.append(f"{int(invalid_frp.sum())} rows have missing or negative FRP")
        missing_confidence = frame["confidence_normalized"].isna()
        if missing_confidence.any():
            warnings.append(f"{int(missing_confidence.sum())} rows have missing normalized confidence")
        invalid_confidence = frame["confidence_normalized"].notna() & ~frame["confidence_normalized"].between(0, 1)
        if invalid_confidence.any():
            warnings.append(f"{int(invalid_confidence.sum())} rows have confidence_normalized outside [0, 1]")
        invalid_coordinates = ~frame["latitude"].between(-90, 90) | ~frame["longitude"].between(-180, 180)
        if invalid_coordinates.any():
            warnings.append(f"{int(invalid_coordinates.sum())} rows have invalid geographic coordinates")
        if frame["acquisition_utc"].isna().any():
            warnings.append(f"{int(frame['acquisition_utc'].isna().sum())} rows have invalid acquisition timestamps")
        if "included_in_lfai" not in frame:
            frame["included_in_lfai"] = pd.Series(pd.NA, index=frame.index, dtype="boolean")
            warnings.append("included_in_lfai is unavailable in the source dataset and remains unknown")
        unexpected_satellites = sorted(set(frame["satellite"].dropna().astype(str)) - {"Terra", "Aqua", "Suomi-NPP", "NOAA-20", "NOAA-21"})
        if unexpected_satellites:
            warnings.append(f"unexpected satellite values: {unexpected_satellites}")
    duplicate_count = int(frame.duplicated().sum())
    if duplicate_count:
        warnings.append(f"{duplicate_count} duplicate rows detected; records were preserved")
    hard_failures = [
        warning for warning in warnings
        if "invalid month" in warning
        or "outside [0, 1]" in warning
        or "invalid geographic coordinates" in warning
        or "invalid acquisition timestamps" in warning
        or "missing or negative FRP" in warning
        or "missing normalized confidence" in warning
    ]
    return ValidationResult(frame, not hard_failures, [], warnings)
