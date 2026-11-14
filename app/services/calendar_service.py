from __future__ import annotations

from datetime import datetime, timezone

import pandas as pd

from app.utils.filters import filter_harmonized
from app.utils.statistics import alert_status, anomaly


def build_calendar(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> list[dict]:
    selected = filter_harmonized(frame, lat_min, lat_max, lon_min, lon_max, year_start, year_end)
    if selected.empty:
        return []
    if "confidence" not in selected:
        selected["confidence"] = pd.NA
    monthly = selected.groupby(["year", "month"], as_index=False).agg(
        harmonized_count=("harmonized_count", "sum"), modis_count=("modis_count", "sum"), viirs_count=("viirs_count", "sum"),
        n_sensors=("n_sensors", "max"), confidence=("confidence", "mean"),
    )
    timestamps = pd.to_datetime(frame.get("acquisition_utc"), errors="coerce", utc=True) if "acquisition_utc" in frame else pd.Series(dtype="datetime64[ns, UTC]")
    latest_observation = timestamps.max() if not timestamps.empty else pd.NaT
    result = []
    for row in monthly.itertuples(index=False):
        baseline = monthly.loc[(monthly["month"] == row.month) & (monthly["year"] < row.year), "harmonized_count"]
        historical_median = float(baseline.median()) if not baseline.empty else float("nan")
        historical_std = float(baseline.std()) if len(baseline) > 1 else float("nan")
        value_anomaly = anomaly(float(row.harmonized_count), historical_median, historical_std)
        has_confidence = pd.notna(row.confidence)
        high_confidence = row.n_sensors >= 2 and has_confidence and row.confidence > 0.7 and pd.notna(historical_median) and historical_median != 0
        provisional = False
        if pd.notna(latest_observation) and year_end >= latest_observation.year and row.year == latest_observation.year and row.month == latest_observation.month:
            provisional = (datetime.now(timezone.utc) - latest_observation.to_pydatetime()).days < 7
        result.append({"year": int(row.year), "month": int(row.month), "harmonized_count": float(row.harmonized_count), "modis_count": float(row.modis_count), "viirs_count": float(row.viirs_count), "anomaly_value": value_anomaly, "alert_status": alert_status(value_anomaly), "confidence": "High" if high_confidence else "Low", "is_provisional": provisional})
    return result
