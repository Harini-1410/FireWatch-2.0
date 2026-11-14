from pathlib import Path

from app.core.config import Settings
from app.services.calendar_service import build_calendar
from app.services.data_loader import DataStore
from app.services.reliability_service import build_reliability


def test_discovered_real_datasets_load_without_mock_mode():
    store = DataStore.load(Settings(
        harmonized_data_path=Path("data/firewatch/cell_month_harmonized.parquet"),
        raw_detections_data_path=Path("data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet"),
        mock_data_mode=False,
        cors_origins=[],
        harmonized_source_label="synthetic prototype dataset",
        data_source_mode="real",
    ))
    assert store.mock_mode is False
    assert store.harmonized.available is True
    assert store.harmonized.source == "synthetic"
    assert len(store.harmonized.dataframe) == 13200
    assert "optional harmonized column unavailable: confidence" in store.harmonized.validation.warnings
    assert "optional harmonized column unavailable: satellite" in store.harmonized.validation.warnings
    assert store.raw.available is True
    assert store.raw.source == "real"
    assert len(store.raw.dataframe) == 1663903
    assert "included_in_lfai is unavailable" in " ".join(store.raw.validation.warnings)
    assert store.raw.dataframe["included_in_lfai"].isna().all()
    assert store.real_aggregation.source == "derived"


def test_actual_harmonized_dataset_is_compatible_with_calendar_and_reliability():
    store = DataStore.load(Settings(
        harmonized_data_path=Path("data/firewatch/cell_month_harmonized.parquet"),
        raw_detections_data_path=Path("missing-raw.parquet"),
        mock_data_mode=False,
        cors_origins=[],
        harmonized_source_label="synthetic prototype dataset",
        data_source_mode="real",
    ))
    calendar = build_calendar(store.harmonized.dataframe, 32, 38, -120, -114, 2015, 2025)
    reliability = build_reliability(store.harmonized.dataframe, 32, 38, -120, -114, 2015, 2025)
    assert len(calendar) == 132
    assert bool(reliability["checks"][0]["passed"]) is True
    assert "platform names unavailable" in reliability["checks"][0]["detail"]
