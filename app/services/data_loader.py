from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from app.core.config import Settings
from app.services.data_validation import ValidationResult, validate_harmonized, validate_raw, validate_real_aggregation

logger = logging.getLogger(__name__)


@dataclass
class DatasetState:
    dataframe: pd.DataFrame | None
    available: bool
    source: str
    error: str | None = None
    validation: ValidationResult | None = None


@dataclass
class DataStore:
    harmonized: DatasetState
    raw: DatasetState
    mock_mode: bool
    harmonized_source_label: str
    real_aggregation: DatasetState | None = None
    data_source_mode: str = "synthetic"

    @classmethod
    def load(cls, config: Settings) -> "DataStore":
        config.validate()
        if config.data_source_mode == "synthetic":
            harmonized = _mock_state(validate_harmonized, _mock_harmonized, "harmonized")
            raw = _mock_state(validate_raw, _mock_raw, "raw detections")
        else:
            harmonized = _load_one(config.harmonized_data_path, validate_harmonized, False, _mock_harmonized, "harmonized", config.harmonized_source_kind)
            raw = _load_one(config.raw_detections_data_path, validate_raw, False, _mock_raw, "raw detections")
        aggregation = (
            _load_one(config.real_aggregation_data_path, validate_real_aggregation, False, _mock_raw, "real aggregation", "derived")
            if config.data_source_mode == "real"
            else DatasetState(None, False, "inactive", error="Real aggregation is inactive in synthetic mode")
        )
        return cls(harmonized, raw, config.mock_data_mode, config.harmonized_source_label, aggregation, config.data_source_mode)


def _mock_state(validator, mock_factory, label: str) -> DatasetState:
    result = validator(mock_factory())
    logger.info("Loaded explicit synthetic %s fixture: %s rows", label, len(result.dataframe))
    return DatasetState(result.dataframe, True, "mock", validation=result)


def _load_one(path: Path, validator, mock_mode: bool, mock_factory, label: str, source_kind: str = "real") -> DatasetState:
    path = Path(path)
    if not path.exists():
        if mock_mode:
            logger.warning("%s dataset missing at %s; using explicitly enabled MOCK_DATA_MODE", label, path)
            result = validator(mock_factory())
            return DatasetState(result.dataframe, True, "mock", validation=result)
        message = f"{label} dataset not found at {path}"
        logger.error(message)
        return DatasetState(None, False, "unavailable", error=message)
    try:
        frame = pd.read_parquet(path) if path.suffix.lower() == ".parquet" else pd.read_csv(path)
        result = validator(frame)
        if result.missing_columns or not result.valid:
            message = f"{label} dataset failed schema validation: missing={result.missing_columns}, warnings={result.warnings}"
            logger.error(message)
            return DatasetState(None, False, "invalid", error=message, validation=result)
        logger.info("Loaded %s dataset: %s rows x %s columns; warnings=%s", label, len(result.dataframe), len(result.dataframe.columns), result.warnings)
        return DatasetState(result.dataframe, True, source_kind, validation=result)
    except Exception as exc:
        message = f"Unable to load {label} dataset: {exc}"
        logger.exception(message)
        return DatasetState(None, False, "invalid", error=message)


def _mock_harmonized() -> pd.DataFrame:
    rows = []
    for year in range(2020, 2027):
        for month in range(1, 13):
            rows.extend([
                {"year": year, "month": month, "lat": -10.0, "lon": -55.0, "harmonized_count": 100 + year - 2020 + month, "modis_count": 60, "viirs_count": 40, "n_sensors": 2, "confidence": 0.9, "acquisition_utc": pd.Timestamp(year=year, month=month, day=15, tz="UTC"), "satellite": "MODIS"},
                {"year": year, "month": month, "lat": -10.5, "lon": -55.5, "harmonized_count": 80 + month, "modis_count": 45, "viirs_count": 35, "n_sensors": 2, "confidence": 0.85, "acquisition_utc": pd.Timestamp(year=year, month=month, day=15, tz="UTC"), "satellite": "VIIRS"},
            ])
    return pd.DataFrame(rows)


def _mock_raw() -> pd.DataFrame:
    return pd.DataFrame([
        {"satellite": "VIIRS", "acquisition_utc": pd.Timestamp("2024-09-15", tz="UTC"), "latitude": -10.1, "longitude": -55.1, "frp": 12.5, "confidence_normalized": 0.9, "included_in_lfai": True},
    ])
