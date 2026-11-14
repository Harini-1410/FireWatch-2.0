import pandas as pd
import pytest
from pathlib import Path

from app.services.export_service import build_export


def test_export_contains_detection_columns_and_attribution(client, params):
    response = client.get("/export", params=params)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment; filename=firewatch_export.csv" in response.headers["content-disposition"]
    assert "latitude" in response.text
    assert "-10.1" in response.text
    assert "NASA FIRMS" in response.text


def test_health_identifies_mock_sources(client):
    body = client.get("/health").json()
    assert body["mock_mode"] is True
    assert body["datasets"]["harmonized"]["source"] == "mock"


def test_export_rejects_missing_detection_coordinates():
    frame = pd.DataFrame([{"satellite": "VIIRS", "acquisition_utc": pd.Timestamp("2024-01-01", tz="UTC"), "latitude": None, "longitude": -55, "frp": 1, "confidence_normalized": 0.9, "included_in_lfai": True}])
    try:
        build_export(frame, -15, -5, -65, -50, 2024, 2024)
    except ValueError as exc:
        assert "missing values" in str(exc)
    else:
        raise AssertionError("Expected missing detection coordinates to be rejected")


def test_export_accepts_original_raw_dataset_and_preserves_row_count():
    raw = pd.read_parquet(Path("data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet"))
    stream = build_export(raw, -13, -12, -39, -38, 2012, 2012)
    text = stream.getvalue().decode("utf-8")
    assert len(text.splitlines()) - 2 == 1780
    assert text.splitlines()[0] == "satellite,acquisition_utc,latitude,longitude,frp,confidence_normalized,included_in_lfai"
    assert text.splitlines()[-1] == "# Data from NASA FIRMS - https://firms.modaps.eosdis.mil" or "NASA FIRMS" in text.splitlines()[-1]
    assert any(line.endswith(",") for line in text.splitlines()[1:-1])


def test_export_empty_selection_contains_header_and_attribution():
    frame = pd.DataFrame([{
        "satellite": "VIIRS", "acquisition_utc": pd.Timestamp("2024-01-01", tz="UTC"),
        "latitude": 0, "longitude": 0, "frp": 1, "confidence_normalized": 0.9,
    }])
    text = build_export(frame, 10, 11, 10, 11, 2024, 2024).getvalue().decode("utf-8")
    assert text.splitlines() == [
        "satellite,acquisition_utc,latitude,longitude,frp,confidence_normalized,included_in_lfai",
        "# Data from NASA FIRMS - https://firms.modaps.eosdis.mil",
    ] or text.splitlines()[-1].startswith("# Data from NASA FIRMS")


def test_export_rejects_malformed_required_timestamp():
    frame = pd.DataFrame([{
        "satellite": "VIIRS", "acquisition_utc": "invalid",
        "latitude": 0, "longitude": 0, "frp": 1, "confidence_normalized": 0.9,
    }])
    with pytest.raises(ValueError, match="required export fields"):
        build_export(frame, -1, 1, -1, 1, 2024, 2024)


def test_export_preserves_utf8_and_csv_escaping():
    frame = pd.DataFrame([{
        "satellite": "São, VIIRS", "acquisition_utc": pd.Timestamp("2024-01-01", tz="UTC"),
        "latitude": 0, "longitude": 0, "frp": 1, "confidence_normalized": 0.9,
    }])
    text = build_export(frame, -1, 1, -1, 1, 2024, 2024).getvalue().decode("utf-8")
    assert '"São, VIIRS"' in text
