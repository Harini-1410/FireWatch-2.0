from __future__ import annotations

import pandas as pd


def build_reliability(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> dict:
    selected = frame.loc[frame["lat"].between(lat_min, lat_max) & frame["lon"].between(lon_min, lon_max) & frame["year"].between(year_start, year_end)].copy()
    expected = (year_end - year_start) * 12 + 12
    named_sensors = int(selected["satellite"].dropna().nunique()) if "satellite" in selected else 0
    recorded_sensor_count = int(selected["n_sensors"].dropna().max()) if "n_sensors" in selected and selected["n_sensors"].notna().any() else 0
    active_sensors_available = named_sensors >= 1 or recorded_sensor_count >= 1
    years = selected["year"].nunique()
    covered_months = selected.loc[selected["n_sensors"] >= 1, ["year", "month"]].drop_duplicates().shape[0]
    coverage = covered_months / expected if expected else 0
    cells = selected[["lat", "lon"]].drop_duplicates().shape[0]
    sensor_detail = f"{named_sensors} unique satellite platforms found" if named_sensors else f"At least {recorded_sensor_count} contributing sensors recorded; platform names unavailable" if recorded_sensor_count >= 1 else "No sensor information found for this area"
    coverage_detail = f"{coverage:.0%} of requested months contain detection records; observation effort unavailable" if coverage >= 0.8 else "Many requested months have no detection records; observation effort unavailable"
    checks = [("sensor_count", active_sensors_available, sensor_detail), ("baseline_length", years >= 5, f"Baseline spans {years} years" if years >= 5 else "Baseline too short for reliable anomaly detection"), ("months_with_data", coverage >= 0.8, coverage_detail), ("area_size", cells >= 10, "At least 10 grid cells found" if cells >= 10 else "Area too small - results may be unreliable")]
    failed = [name for name, passed, _ in checks if not passed]
    score = "High" if not failed else "Moderate" if len(failed) == 1 else "Low"
    return {"score": score, "checks": [{"check": name, "passed": passed, "detail": detail} for name, passed, detail in checks], "failed_checks": failed, "plain_language": f"Data quality is {score.upper()} for this selected area."}
