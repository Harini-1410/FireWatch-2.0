import pandas as pd

from app.services.data_validation import SCHEMA_CONTRACTS, validate_raw
from app.services.data_validation import validate_harmonized


def test_raw_validation_rejects_missing_negative_and_invalid_values():
    frame = pd.DataFrame([
        {
            "satellite": "Terra",
            "acquisition_utc": "not-a-date",
            "latitude": 91,
            "longitude": 0,
            "frp": -1,
            "confidence_normalized": None,
        }
    ])
    result = validate_raw(frame)
    assert result.valid is False
    assert any("invalid acquisition timestamps" in warning for warning in result.warnings)
    assert any("invalid geographic coordinates" in warning for warning in result.warnings)
    assert any("missing or negative FRP" in warning for warning in result.warnings)
    assert any("missing normalized confidence" in warning for warning in result.warnings)


def test_harmonized_validation_allows_missing_optional_columns_with_warnings():
    frame = pd.DataFrame([{
        "year": 2020, "month": 1, "lat": 0, "lon": 0,
        "harmonized_count": 1, "modis_count": 1, "viirs_count": 0, "n_sensors": 1,
    }])
    result = validate_harmonized(frame)
    assert result.valid is True
    assert "optional harmonized column unavailable: confidence" in result.warnings
    assert "optional harmonized column unavailable: satellite" in result.warnings


def test_harmonized_validation_rejects_missing_required_columns():
    frame = pd.DataFrame([{"year": 2020, "month": 1, "lat": 0, "lon": 0}])
    result = validate_harmonized(frame)
    assert result.valid is False
    assert "harmonized_count" in result.missing_columns


def test_schema_contracts_declare_all_configured_dataset_types():
    assert set(SCHEMA_CONTRACTS) == {"harmonized", "raw_detections", "real_aggregation"}
    assert "confidence" in SCHEMA_CONTRACTS["harmonized"]["optional"]
    assert "included_in_lfai" in SCHEMA_CONTRACTS["raw_detections"]["optional"]
    assert "source_product_id" in SCHEMA_CONTRACTS["real_aggregation"]["required"]