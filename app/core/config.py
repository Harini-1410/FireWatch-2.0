from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    harmonized_data_path: Path
    raw_detections_data_path: Path
    mock_data_mode: bool
    cors_origins: list[str]
    harmonized_source_label: str
    harmonized_source_kind: str = "synthetic"
    data_source_mode: str = "synthetic"
    real_aggregation_data_path: Path = Path("data/firewatch/real_monthly_aggregation.parquet")
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            harmonized_data_path=Path(os.getenv("HARMONIZED_DATA_PATH", "data/firewatch/cell_month_harmonized.parquet")),
            raw_detections_data_path=Path(os.getenv("RAW_DETECTIONS_DATA_PATH", "data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet")),
            mock_data_mode=os.getenv("MOCK_DATA_MODE", "false").lower() in {"1", "true", "yes", "on"},
            cors_origins=_csv(os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")),
            harmonized_source_label=os.getenv("HARMONIZED_SOURCE_LABEL", "synthetic prototype dataset"),
            harmonized_source_kind=os.getenv("HARMONIZED_SOURCE_KIND", "synthetic").lower(),
            data_source_mode=os.getenv("DATA_SOURCE_MODE", "synthetic").lower(),
            real_aggregation_data_path=Path(os.getenv("REAL_AGGREGATION_DATA_PATH", "data/firewatch/real_monthly_aggregation.parquet")),
            host=os.getenv("HOST", "0.0.0.0"),
            port=int(os.getenv("PORT", "8000")),
            log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
        )

    def validate(self) -> None:
        if self.data_source_mode not in {"synthetic", "real"}:
            raise ValueError("DATA_SOURCE_MODE must be 'synthetic' or 'real'")
        if self.harmonized_source_kind not in {"synthetic", "real"}:
            raise ValueError("HARMONIZED_SOURCE_KIND must be 'synthetic' or 'real'")
        if not 1 <= self.port <= 65535:
            raise ValueError("PORT must be between 1 and 65535")
        if self.log_level not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ValueError("LOG_LEVEL must be DEBUG, INFO, WARNING, ERROR, or CRITICAL")


settings = Settings.from_env()
