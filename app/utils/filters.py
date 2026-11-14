from __future__ import annotations

import pandas as pd


def filter_harmonized(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> pd.DataFrame:
    return frame.loc[
        frame["lat"].between(lat_min, lat_max)
        & frame["lon"].between(lon_min, lon_max)
        & frame["year"].between(year_start, year_end)
    ].copy()


def filter_raw(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> pd.DataFrame:
    years = frame["acquisition_utc"].dt.year
    return frame.loc[
        frame["latitude"].between(lat_min, lat_max)
        & frame["longitude"].between(lon_min, lon_max)
        & years.between(year_start, year_end)
    ].copy()
