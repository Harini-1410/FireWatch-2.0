from pathlib import Path

import pytest

from app.core.config import Settings


def make_settings(**overrides):
    values = {
        "harmonized_data_path": Path("harmonized.parquet"),
        "raw_detections_data_path": Path("raw.parquet"),
        "mock_data_mode": False,
        "cors_origins": [],
        "harmonized_source_label": "test",
    }
    values.update(overrides)
    return Settings(**values)


def test_deployment_settings_validate():
    make_settings(host="127.0.0.1", port=8080, log_level="WARNING").validate()


@pytest.mark.parametrize("overrides", [{"port": 0}, {"port": 65536}, {"log_level": "NOPE"}, {"data_source_mode": "auto"}])
def test_invalid_deployment_settings_fail_safely(overrides):
    with pytest.raises(ValueError):
        make_settings(**overrides).validate()
