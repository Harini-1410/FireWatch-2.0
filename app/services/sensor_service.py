from __future__ import annotations

import pandas as pd


def build_transition(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> dict:
    """Return descriptive monthly series and observed-availability markers only."""
    selected = frame.loc[frame["lat"].between(lat_min, lat_max) & frame["lon"].between(lon_min, lon_max) & frame["year"].between(year_start, year_end)].copy()
    dates = pd.period_range(f"{year_start}-01", f"{year_end}-12", freq="M")
    grouped = selected.groupby(["year", "month"])
    modis, viirs, harmonized = [], [], []
    for period in dates:
        year, month = period.year, period.month
        label = f"{year:04d}-{month:02d}"
        modis_value = _sum(grouped, year, month, "modis_count")
        viirs_value = _sum(grouped, year, month, "viirs_count")
        value = _sum(grouped, year, month, "harmonized_count")
        std = _std(selected, year, month, "harmonized_count")
        harmonized.append({"label": label, "value": value, "interval_low": max(0.0, value - std) if value is not None else None, "interval_high": value + std if value is not None else None})
        modis.append({"label": label, "value": modis_value})
        viirs.append({"label": label, "value": viirs_value})
    return {"modis": modis, "viirs": viirs, "harmonized": harmonized, "transition_markers": _observed_availability_markers(selected)}


def _sum(grouped, year: int, month: int, column: str) -> float | None:
    if column not in grouped.obj.columns:
        return None
    try:
        values = grouped.get_group((year, month))[column]
    except KeyError:
        return None
    return float(values.sum())


def _std(frame: pd.DataFrame, year: int, month: int, column: str) -> float:
    values = frame.loc[(frame["year"] == year) & (frame["month"] == month), column]
    return float(values.std(ddof=0)) if len(values) > 1 else 0.0


def _observed_availability_markers(frame: pd.DataFrame) -> list[dict]:
    markers: list[dict] = []
    if "satellite" in frame.columns:
        observed = frame.dropna(subset=["satellite"])
        for satellite, values in observed.groupby("satellite"):
            first = values.sort_values(["year", "month"]).iloc[0]
            markers.append({"label": f"Observed {satellite} availability", "year": int(first["year"]), "month": int(first["month"])})
        return sorted(markers, key=lambda marker: (marker["year"], marker["month"], marker["label"]))
    for column, label in (("modis_count", "MODIS"), ("viirs_count", "VIIRS")):
        if column not in frame.columns:
            continue
        observed = frame.loc[frame[column].notna()]
        if not observed.empty:
            first = observed.sort_values(["year", "month"]).iloc[0]
            markers.append({"label": f"Observed {label} series availability", "year": int(first["year"]), "month": int(first["month"])})
    return sorted(markers, key=lambda marker: (marker["year"], marker["month"], marker["label"]))
