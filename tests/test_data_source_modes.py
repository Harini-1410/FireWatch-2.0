from pathlib import Path

import app.main as main_module
from app.core.config import Settings
from app.main import app
from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]


def test_real_mode_reports_real_aggregation_and_blocks_harmonized_analytics():
    original = main_module.settings
    main_module.settings = Settings(
        harmonized_data_path=ROOT / "data/firewatch/cell_month_harmonized.parquet",
        raw_detections_data_path=ROOT / "data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet",
        mock_data_mode=False,
        cors_origins=[],
        harmonized_source_label="synthetic prototype dataset",
        data_source_mode="real",
        real_aggregation_data_path=ROOT / "data/firewatch/real_monthly_aggregation.parquet",
    )
    try:
        with TestClient(app) as client:
            health = client.get("/health")
            calendar = client.get("/calendar", params={"lat_min": -13, "lat_max": -12, "lon_min": -39, "lon_max": -38, "year_start": 2012, "year_end": 2012})
    finally:
        main_module.settings = original
    assert health.status_code == 200
    body = health.json()
    assert body["data_source_mode"] == "real"
    assert body["datasets"]["harmonized"]["source"] == "synthetic"
    assert body["datasets"]["raw_detections"]["source"] == "real"
    assert body["datasets"]["real_aggregation"]["available"] is True
    assert body["datasets"]["real_aggregation"]["rows"] > 0
    assert calendar.status_code == 422
    assert "calibrated harmonized" in calendar.json()["detail"]


def test_invalid_data_source_mode_fails_fast():
    settings = Settings(
        harmonized_data_path=Path("missing"),
        raw_detections_data_path=Path("missing"),
        mock_data_mode=False,
        cors_origins=[],
        harmonized_source_label="test",
        data_source_mode="automatic",
    )
    from app.services.data_loader import DataStore
    try:
        DataStore.load(settings)
    except ValueError as exc:
        assert "DATA_SOURCE_MODE" in str(exc)
    else:
        raise AssertionError("Invalid source mode should fail fast")


def test_synthetic_mode_does_not_load_real_aggregation():
    settings = Settings(
        harmonized_data_path=Path("missing-harmonized.parquet"),
        raw_detections_data_path=Path("missing-raw.parquet"),
        mock_data_mode=True,
        cors_origins=[],
        harmonized_source_label="test",
        data_source_mode="synthetic",
    )
    from app.services.data_loader import DataStore
    store = DataStore.load(settings)
    assert store.real_aggregation.source == "inactive"
    assert store.real_aggregation.dataframe is None
    assert store.harmonized.source == "mock"
    assert store.raw.source == "mock"
