import pandas as pd

from app.services.reliability_service import build_reliability


def test_reliability_reports_all_checks(client, params):
    response = client.get("/reliability", params=params)
    assert response.status_code == 200
    body = response.json()
    assert len(body["checks"]) == 4
    assert body["score"] == "Moderate"
    assert "area_size" in body["failed_checks"]
    assert {check["check"] for check in body["checks"]} == {"sensor_count", "baseline_length", "months_with_data", "area_size"}


def test_reliability_distinguishes_platforms_from_contributing_sensor_count():
    frame = pd.DataFrame([
        {"lat": 0, "lon": 0, "year": year, "month": month, "n_sensors": 2, "satellite": "Terra"}
        for year in range(2015, 2020) for month in range(1, 13)
    ])
    result = build_reliability(frame, -1, 1, -1, 1, 2015, 2019)
    sensor_check = next(check for check in result["checks"] if check["check"] == "sensor_count")
    months_check = next(check for check in result["checks"] if check["check"] == "months_with_data")
    assert sensor_check["passed"] is True
    assert "unique satellite platforms" in sensor_check["detail"]
    assert "observation effort unavailable" in months_check["detail"]


def test_reliability_threshold_boundaries():
    rows = [{"lat": 0, "lon": 0, "year": year, "month": month, "n_sensors": 1, "satellite": "Terra"} for year in range(2015, 2020) for month in range(1, 13)]
    full = build_reliability(pd.DataFrame(rows), -1, 1, -1, 1, 2015, 2019)
    assert next(check for check in full["checks"] if check["check"] == "baseline_length")["passed"] is True
    assert next(check for check in full["checks"] if check["check"] == "months_with_data")["passed"] is True
    sparse = pd.DataFrame(rows[:9])
    sparse_result = build_reliability(sparse, -1, 1, -1, 1, 2015, 2019)
    assert next(check for check in sparse_result["checks"] if check["check"] == "months_with_data")["passed"] is False
