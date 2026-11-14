from __future__ import annotations

import io

import pandas as pd

from app.utils.filters import filter_raw

EXPORT_COLUMNS = ["satellite", "acquisition_utc", "latitude", "longitude", "frp", "confidence_normalized", "included_in_lfai"]
REQUIRED_EXPORT_COLUMNS = [column for column in EXPORT_COLUMNS if column != "included_in_lfai"]


def build_export(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> io.BytesIO:
    missing_columns = sorted(set(REQUIRED_EXPORT_COLUMNS) - set(frame.columns))
    if missing_columns:
        raise ValueError(f"Detection dataset is missing required export columns: {missing_columns}")
    working = frame.copy()
    working["acquisition_utc"] = pd.to_datetime(working["acquisition_utc"], errors="coerce", utc=True)
    for column in ("latitude", "longitude", "frp", "confidence_normalized"):
        working[column] = pd.to_numeric(working[column], errors="coerce")
    invalid_coordinates = ~working["latitude"].between(-90, 90) | ~working["longitude"].between(-180, 180)
    invalid_required = working[REQUIRED_EXPORT_COLUMNS].isna().any(axis=1) | invalid_coordinates | (working["frp"] < 0) | ~working["confidence_normalized"].between(0, 1)
    if invalid_required.any():
        raise ValueError("Detection dataset contains missing values in required export fields")
    if "included_in_lfai" not in working:
        working["included_in_lfai"] = pd.Series(pd.NA, index=working.index, dtype="boolean")
    selected = filter_raw(working, lat_min, lat_max, lon_min, lon_max, year_start, year_end)[EXPORT_COLUMNS].copy()
    selected["acquisition_utc"] = selected["acquisition_utc"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    output = io.StringIO()
    selected.to_csv(output, index=False)
    output.write("# Data from NASA FIRMS - https://firms.modaps.eosdis.nasa.gov\n")
    return io.BytesIO(output.getvalue().encode("utf-8"))
