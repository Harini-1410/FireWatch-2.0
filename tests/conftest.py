import os

os.environ["MOCK_DATA_MODE"] = "true"

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
import app.main as main_module
from app.main import app


@pytest.fixture
def client():
    original_settings = main_module.settings
    main_module.settings = Settings(
        harmonized_data_path="missing-harmonized.parquet",
        raw_detections_data_path="missing-raw.parquet",
        mock_data_mode=True,
        cors_origins=[],
        harmonized_source_label="synthetic test fixture",
    )
    with TestClient(app) as test_client:
        yield test_client
    main_module.settings = original_settings


@pytest.fixture
def params():
    return {"lat_min": -15, "lat_max": -5, "lon_min": -65, "lon_max": -50, "year_start": 2020, "year_end": 2026}
