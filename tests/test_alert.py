from datetime import date

import pandas as pd
import pytest

from app.services.alert_service import build_alert
from app.services.calendar_service import build_calendar


def test_alert_returns_percentile(client):
    response = client.get("/alert", params={"lat_min": -15, "lat_max": -5, "lon_min": -65, "lon_max": -50, "year": 2025, "month": 9})
    assert response.status_code == 200
    body = response.json()
    assert body["percentile"] >= 0
    assert "percentile of historical" in body["plain_language"]


def test_alert_rejects_invalid_month(client):
    response = client.get("/alert", params={"lat_min": -15, "lat_max": -5, "lon_min": -65, "lon_max": -50, "year": 2025, "month": 13})
    assert response.status_code == 400


def test_alert_rejects_incomplete_monthly_current_period(client):
    response = client.get("/alert", params={"lat_min": -15, "lat_max": -5, "lon_min": -65, "lon_max": -50, "year": 2026, "month": 11})
    assert response.status_code == 422
    assert "partial-month" in response.json()["detail"]


def alert_frame(year_counts, include_timestamps=False):
    rows = []
    for year, values in year_counts.items():
        for lat, count in zip((0, 1), values):
            row = {"year": year, "month": 1, "lat": lat, "lon": 0, "harmonized_count": count, "modis_count": count, "viirs_count": 0, "n_sensors": 2, "confidence": 0.9}
            if include_timestamps:
                row["acquisition_utc"] = pd.Timestamp(year=year, month=1, day=15, tz="UTC")
            rows.append(row)
    return pd.DataFrame(rows)


def test_alert_uses_area_totals_and_exact_historical_median():
    frame = alert_frame({2015: (10, 20), 2016: (20, 30), 2017: (30, 40), 2018: (40, 50)})
    result = build_alert(frame, -1, 2, -1, 1, 2018, 1)
    assert result["current_count"] == 90.0
    assert result["historical_median"] == 50.0
    assert result["percentile"] == 100.0
    assert result["status"] == "Unusual"


def test_calendar_and_alert_use_the_same_current_area_total():
    frame = alert_frame({2015: (10, 20), 2016: (20, 30), 2017: (30, 40)})
    calendar_result = build_calendar(frame, -1, 2, -1, 1, 2015, 2017)
    alert_result = build_alert(frame, -1, 2, -1, 1, 2017, 1)
    calendar_current = next(item for item in calendar_result if item["year"] == 2017)
    assert calendar_current["harmonized_count"] == alert_result["current_count"] == 70.0


def test_alert_future_observations_cannot_change_past_percentile():
    without_future = alert_frame({2015: (10, 0), 2016: (20, 0), 2017: (15, 0)})
    with_future = pd.concat([without_future, alert_frame({2025: (1000000, 0)})], ignore_index=True)
    expected = build_alert(without_future, -1, 2, -1, 1, 2017, 1)
    actual = build_alert(with_future, -1, 2, -1, 1, 2017, 1)
    assert actual["percentile"] == expected["percentile"] == 50.0
    assert actual["historical_median"] == expected["historical_median"] == 15.0


def test_alert_percentile_includes_ties():
    frame = alert_frame({2015: (10, 10), 2016: (20, 20), 2017: (20, 20)})
    result = build_alert(frame, -1, 2, -1, 1, 2017, 1)
    assert result["percentile"] == 100.0


def test_alert_requires_historical_observation():
    frame = alert_frame({2025: (10, 10)})
    with pytest.raises(LookupError, match="historical"):
        build_alert(frame, -1, 2, -1, 1, 2025, 1)


def test_alert_rejects_current_month_without_daily_timestamps():
    today = date.today()
    frame = alert_frame({today.year - 1: (10, 10), today.year: (20, 20)})
    frame["month"] = today.month
    with pytest.raises(ValueError, match="daily observation timestamps"):
        build_alert(frame, -1, 2, -1, 1, today.year, today.month)
