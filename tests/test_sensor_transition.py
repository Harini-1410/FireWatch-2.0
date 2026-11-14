import pandas as pd

from app.services.sensor_service import build_transition


def test_sensor_transition_includes_markers_and_nulls(client, params):
    params["year_start"] = 2010
    response = client.get("/sensor-transition", params=params)
    assert response.status_code == 200
    body = response.json()
    assert len(body["transition_markers"]) == 2
    assert all(marker["label"].startswith("Observed ") for marker in body["transition_markers"])
    assert all("retired" not in marker["label"].lower() for marker in body["transition_markers"])
    assert body["viirs"][0]["value"] is None
    assert body["harmonized"][0]["interval_low"] is None
    assert body["harmonized"][120]["interval_low"] is not None


def test_real_aggregation_markers_are_observed_platform_availability_only():
    frame = pd.read_parquet("data/firewatch/real_monthly_aggregation.parquet")
    result = build_transition(frame, -90, 90, -180, 180, 2012, 2026)
    labels = [marker["label"] for marker in result["transition_markers"]]
    assert labels
    assert all(label.startswith("Observed ") for label in labels)
    assert all("retired" not in label.lower() for label in labels)
    assert all(point["value"] is None for point in result["modis"])
    assert all(point["value"] is None for point in result["viirs"])
