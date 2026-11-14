import os

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app
from app.services.data_loader import DataStore


def test_missing_raw_dataset_returns_503(monkeypatch):
    with TestClient(app) as client:
        app.state.store = DataStore.load(Settings(harmonized_data_path=os.path.abspath("missing.parquet"), raw_detections_data_path=os.path.abspath("missing-raw.parquet"), mock_data_mode=False, cors_origins=[], harmonized_source_label="test", data_source_mode="real"))
        response = client.get("/export", params={"lat_min": -15, "lat_max": -5, "lon_min": -65, "lon_max": -50, "year_start": 2020, "year_end": 2026})
    assert response.status_code == 503
