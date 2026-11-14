from __future__ import annotations

import calendar
from datetime import date

import numpy as np
import pandas as pd


def build_alert(frame: pd.DataFrame, lat_min: float, lat_max: float, lon_min: float, lon_max: float, year: int, month: int) -> dict:
    """Compare an area-month total with strictly earlier same-month area totals."""
    selected = frame.loc[frame["lat"].between(lat_min, lat_max) & frame["lon"].between(lon_min, lon_max) & (frame["month"] == month)].copy()
    if selected.empty or not (selected["year"] == year).any():
        raise LookupError("No observation found for the requested area and month")
    if year == date.today().year and month == date.today().month:
        if "acquisition_utc" not in selected or not selected["acquisition_utc"].notna().any():
            raise ValueError("Accurate partial-month comparison is unavailable without daily observation timestamps")
        current_dates = selected.loc[selected["year"] == year, "acquisition_utc"].dt.date.nunique()
        if current_dates < calendar.monthrange(year, month)[1]:
            raise ValueError("Accurate partial-month comparison is unavailable for monthly aggregate data")
    current = float(selected.loc[selected["year"] == year, "harmonized_count"].sum())
    historical = selected.loc[selected["year"] < year].groupby("year")["harmonized_count"].sum()
    if historical.empty:
        raise LookupError("At least one historical observation is required")
    percentile = float((historical <= current).mean() * 100)
    status = "Unusual" if percentile >= 90 else "Elevated" if percentile >= 66 else "Normal"
    median = float(np.median(historical))
    return {"year": year, "month": month, "status": status, "percentile": round(percentile, 2), "plain_language": f"Fire activity in this area is in the {percentile:.1f}th percentile of historical observations for this calendar month.", "current_count": current, "historical_median": median}
