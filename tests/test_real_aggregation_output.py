from pathlib import Path

import numpy as np
import pandas as pd
from pyproj import Transformer


OUTPUT = Path("data/firewatch/real_monthly_aggregation.parquet")
RAW = Path("data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet")
KEY = ["cell_id", "year", "month", "satellite", "source_product_id", "product_version"]


def test_published_real_aggregation_has_valid_contract():
    assert OUTPUT.exists()
    raw = pd.read_parquet(RAW)
    output = pd.read_parquet(OUTPUT)
    assert len(output) == output[["cell_id", "year", "month", "satellite", "source_product_id", "product_version"]].drop_duplicates().shape[0]
    assert output.duplicated(KEY).sum() == 0
    assert output["observation_effort_available"].eq(False).all()
    assert output["has_detection_record"].eq(True).all()
    assert output["harmonized_count"].isna().all()
    assert output["ci_lower"].isna().all()
    assert output["ci_upper"].isna().all()
    assert set(output["source_files"].explode()) == set(raw["source_file"])
    transformer = Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True)
    x, y = transformer.transform(raw["longitude"].to_numpy(), raw["latitude"].to_numpy())
    raw = raw.assign(
        cell_id="ea25_" + np.floor(x / 25000).astype("int64").astype(str) + "_" + np.floor(y / 25000).astype("int64").astype(str),
        year=raw["acquisition_utc"].dt.year,
        month=raw["acquisition_utc"].dt.month,
        source_product_id=raw["source_file"].map(lambda value: Path(str(value)).stem),
        product_version=raw["version"],
    )
    group_key = ["cell_id", "year", "month", "satellite", "source_product_id", "product_version"]
    input_groups = raw.groupby(group_key, dropna=False).agg(detection_count=("frp", "size"), frp_sum=("frp", "sum")).reset_index().sort_values(group_key).reset_index(drop=True)
    output_groups = output[group_key + ["detection_count", "frp_sum"]].sort_values(group_key).reset_index(drop=True)
    pd.testing.assert_series_equal(input_groups["detection_count"], output_groups["detection_count"], check_names=False)
    np.testing.assert_allclose(input_groups["frp_sum"], output_groups["frp_sum"], rtol=1e-12, atol=1e-6)
    for satellite, source in raw.groupby("satellite"):
        grouped = output.loc[output["satellite"] == satellite]
        assert len(source) == grouped["detection_count"].sum()
        assert abs(source["frp"].sum() - grouped["frp_sum"].sum()) <= max(1e-6, abs(source["frp"].sum()) * 1e-12)
