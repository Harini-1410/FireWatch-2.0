import pandas as pd
import pytest

from app.services.calendar_service import build_calendar
from app.utils.statistics import alert_status


def test_calendar_calculates_monthly_values(client, params):
    response = client.get("/calendar", params=params)
    assert response.status_code == 200
    body = response.json()
    assert len(body["grid"]) == 84
    assert body["grid"][0]["harmonized_count"] == 182
    assert body["grid"][0]["alert_status"] in {"Normal", "Elevated", "Unusual"}


def test_calendar_rejects_invalid_bounds(client, params):
    params["lat_min"], params["lat_max"] = 5, -5
    assert client.get("/calendar", params=params).status_code == 400


def test_calendar_rejects_invalid_date_range(client, params):
    params["year_start"], params["year_end"] = 2026, 2020
    assert client.get("/calendar", params=params).status_code == 400


def test_calendar_empty_selection_is_consistent(client, params):
    params["lat_min"], params["lat_max"] = 40, 41
    assert client.get("/calendar", params=params).json()["grid"] == []


def test_zero_historical_median_returns_null_anomaly():
    frame = pd.DataFrame([
        {"year": 2020, "month": 1, "lat": 0, "lon": 0, "harmonized_count": 0, "modis_count": 0, "viirs_count": 0, "n_sensors": 1, "confidence": 0.9},
        {"year": 2021, "month": 1, "lat": 0, "lon": 0, "harmonized_count": 0, "modis_count": 0, "viirs_count": 0, "n_sensors": 1, "confidence": 0.9},
        {"year": 2022, "month": 1, "lat": 0, "lon": 0, "harmonized_count": 10, "modis_count": 5, "viirs_count": 5, "n_sensors": 1, "confidence": 0.9},
    ])
    result = build_calendar(frame, -1, 1, -1, 1, 2020, 2022)
    assert result[-1]["anomaly_value"] is None
    assert result[-1]["confidence"] == "Low"


def calendar_frame(rows):
    return pd.DataFrame([
        {"year": year, "month": month, "lat": lat, "lon": lon, "harmonized_count": count, "modis_count": count, "viirs_count": 0, "n_sensors": 2, "confidence": 0.9}
        for year, month, lat, lon, count in rows
    ])


def test_calendar_uses_area_totals_and_excludes_current_year():
    frame = calendar_frame([
        (2020, 1, 0, 0, 4), (2020, 1, 1, 1, 6),
        (2021, 1, 0, 0, 14), (2021, 1, 1, 1, 16),
        (2022, 1, 0, 0, 24), (2022, 1, 1, 1, 26),
    ])
    result = build_calendar(frame, -1, 2, -1, 2, 2020, 2022)
    current = next(item for item in result if item["year"] == 2022)
    expected_median = 20.0
    expected_std = (200.0 ** 0.5)  # sample std of independent area totals 10 and 30
    expected_anomaly = (50.0 - expected_median) / expected_std
    assert current["harmonized_count"] == 50.0
    assert current["anomaly_value"] == pytest.approx(expected_anomaly)


def test_calendar_baselines_use_only_strictly_earlier_years():
    frame = calendar_frame([(year, 1, 0, 0, year - 2010) for year in range(2015, 2026)])
    result = build_calendar(frame, -1, 1, -1, 1, 2015, 2025)
    by_year = {item["year"]: item for item in result}
    for year in range(2015, 2026):
        earlier_values = pd.Series([past - 2010 for past in range(2015, year)])
        current_value = year - 2010
        if len(earlier_values) < 2 or earlier_values.std() == 0:
            expected = None
        else:
            expected = (current_value - earlier_values.median()) / earlier_values.std()
        if expected is None:
            assert by_year[year]["anomaly_value"] is None
        else:
            assert by_year[year]["anomaly_value"] == pytest.approx(expected)


def test_future_observations_cannot_change_past_anomaly():
    historical_and_current = calendar_frame([
        (2015, 1, 0, 0, 10),
        (2016, 1, 0, 0, 20),
        (2017, 1, 0, 0, 30),
        (2020, 1, 0, 0, 40),
    ])
    with_future = pd.concat([
        historical_and_current,
        calendar_frame([(2025, 1, 0, 0, 1000000)]),
    ], ignore_index=True)
    without_future = build_calendar(historical_and_current, -1, 1, -1, 1, 2015, 2020)
    with_future_result = build_calendar(with_future, -1, 1, -1, 1, 2015, 2025)
    expected_2020 = next(item for item in without_future if item["year"] == 2020)
    actual_2020 = next(item for item in with_future_result if item["year"] == 2020)
    assert actual_2020["anomaly_value"] == expected_2020["anomaly_value"]


def test_calendar_returns_null_for_missing_historical_month():
    frame = calendar_frame([(2020, 1, 0, 0, 10), (2021, 2, 0, 0, 20)])
    result = build_calendar(frame, -1, 1, -1, 1, 2020, 2021)
    assert next(item for item in result if item["month"] == 1)["anomaly_value"] is None
    assert next(item for item in result if item["month"] == 2)["anomaly_value"] is None


def test_calendar_returns_null_for_zero_standard_deviation():
    frame = calendar_frame([(2020, 1, 0, 0, 10), (2021, 1, 0, 0, 10), (2022, 1, 0, 0, 20)])
    result = build_calendar(frame, -1, 1, -1, 1, 2020, 2022)
    assert next(item for item in result if item["year"] == 2022)["anomaly_value"] is None


def test_calendar_handles_missing_confidence_as_low():
    frame = calendar_frame([(2020, 1, 0, 0, 10), (2021, 1, 0, 0, 20)]).drop(columns=["confidence"])
    result = build_calendar(frame, -1, 1, -1, 1, 2020, 2021)
    assert all(item["confidence"] == "Low" for item in result)


@pytest.mark.parametrize(
    ("value", "expected"),
    [(0.5, "Normal"), (0.500001, "Elevated"), (1.5, "Elevated"), (1.500001, "Unusual")],
)
def test_alert_classification_boundaries(value, expected):
    assert alert_status(value) == expected
