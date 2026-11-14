# FireWatch 2.0 Backend

FastAPI backend for NASA MODIS, VIIRS, and harmonized fire activity data. The application loads each dataset once during FastAPI startup and keeps the validated DataFrames in memory. It does not use a database.

## Windows setup

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

The repository currently discovers the source files at `data/firewatch/cell_month_harmonized.parquet` and `data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet`. These paths are the defaults in `.env.example`; override them with `HARMONIZED_DATA_PATH` and `RAW_DETECTIONS_DATA_PATH` when needed. Start the service with:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open Swagger at http://localhost:8000/docs. Run tests with `pytest -q`.

For deployment preparation, see [DEPLOYMENT.md](DEPLOYMENT.md). The production-oriented container runs one Uvicorn worker by default and mounts datasets at runtime; datasets and `.env` files are excluded from the image. `run.py` does not enable auto-reload. Use `uvicorn app.main:app --reload` explicitly for local development reload behavior.

## Configuration and data status

- `HARMONIZED_DATA_PATH`: monthly harmonized Parquet path, default `data/firewatch/cell_month_harmonized.parquet`.
- `RAW_DETECTIONS_DATA_PATH`: FIRMS detection Parquet or CSV path, default `data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet`.
- `HARMONIZED_SOURCE_LABEL`: health metadata label; defaults to `synthetic prototype dataset` for the currently supplied harmonized file.
- `DATA_SOURCE_MODE`: explicit API mode, either `synthetic` (default) or `real`. There is no implicit automatic switching.
- `REAL_AGGREGATION_DATA_PATH`: validated descriptive aggregation path, default `data/firewatch/real_monthly_aggregation.parquet`.
- `MOCK_DATA_MODE`: defaults to `false`. Set to `true` only for local development without NASA files. `/health` identifies mock sources explicitly.
- `CORS_ORIGINS`: comma-separated allowed origins. Defaults include ports 3000 and 5173 on localhost and 127.0.0.1.
- `HOST`: bind host, default `0.0.0.0`.
- `PORT`: bind port, default `8000`.
- `LOG_LEVEL`: `DEBUG`, `INFO`, `WARNING`, `ERROR`, or `CRITICAL`; default `INFO`.

The harmonized file must contain `year`, `month`, `lat`, `lon`, `harmonized_count`, `modis_count`, `viirs_count`, and `n_sensors`. Confidence is optional and is treated as unknown when absent. The raw file must contain `satellite`, `acquisition_utc`, `latitude`, `longitude`, `frp`, and `confidence_normalized`. `included_in_lfai` is optional; the supplied FIRMS file does not contain it, so exports leave that field blank rather than inferring a value. Invalid coordinates, timestamps, confidence values, and months are reported as unavailable; source records are not silently deduplicated.

The supplied harmonized file is explicitly synthetic prototype data covering 2015–2025 over a California grid. It must not be mixed with the real FIRMS detections or presented as NASA observations. The supplied raw FIRMS data covers Brazil in 2012 plus short South America NRT windows in November 2026, so it is not a continuous 25-year baseline.

## Data-source modes

`DATA_SOURCE_MODE=synthetic` preserves the existing prototype calendar, alert, transition, and reliability APIs. `DATA_SOURCE_MODE=real` loads the separate validated real aggregation and reports it through `/health`, but does not pass descriptive, uncalibrated detection counts into endpoints that require harmonized/LFAI data. In real mode, `/calendar`, `/alert`, `/sensor-transition`, and `/reliability` return HTTP 422 with an explicit unsupported-calculation message. `/export` continues to use the raw FIRMS detection dataset. The synthetic and real datasets are never combined.

The real aggregation is descriptive only. It has no observation-effort metadata, calibrated MODIS/VIIRS harmonization, LFAI values, calibrated probabilities, or credible intervals. Missing cell-month records are not zero-fire observations.

Reliability is an informational quality summary. It warns about short baselines, missing detection records, sensor metadata, and small areas; it does not block the synthetic analytics endpoints. In real mode, harmonized analytics remain blocked because the real data is not calibrated harmonized data.

## Future real harmonization recommendation

Do not generate a production harmonized file until a real LFAI specification is available. For the current raw data, a defensible prototype aggregation would use a fixed equal-area grid, preserve each detection's original coordinates, assign each detection to one cell using a documented spatial index, and group by UTC calendar month and satellite platform. Counts should be additive within each platform; MODIS and VIIRS detections should remain separate before any sensor calibration. Cross-sensor detections should not be deduplicated without a documented spatiotemporal event-matching rule. A 0.25-degree grid is a reasonable initial comparison scale for regional visualization, but the final resolution should be selected from native pixel size, study-area extent, and minimum monthly sample density. Aggregated uncertainty should use a documented statistical model, not an invented confidence value.

## API integration

Base URL: `http://localhost:8000`

Every geographic endpoint accepts `lat_min`, `lat_max`, `lon_min`, `lon_max`. Date-range endpoints also accept `year_start` and `year_end`. Invalid bounds and ranges return HTTP 400. Missing datasets return HTTP 503. Unsupported calculations return HTTP 422.

### Calendar

`GET /calendar?lat_min=-15&lat_max=-5&lon_min=-65&lon_max=-50&year_start=2000&year_end=2026`

Returns `bbox`, the selected years, and `grid` items containing `year`, `month`, counts, `anomaly_value`, `alert_status`, `confidence`, and `is_provisional`. Historical statistics are calculated separately for each calendar month. A zero historical median produces a null anomaly and low confidence.

### Alert

`GET /alert?lat_min=-15&lat_max=-5&lon_min=-65&lon_max=-50&year=2024&month=9`

Returns `status`, percentile, current count, historical median, and a generated plain-language explanation. A current incomplete month is rejected when only monthly aggregate data is available; daily harmonized data is required for a valid partial-month comparison.

### Sensor transition

`GET /sensor-transition?lat_min=-15&lat_max=-5&lon_min=-65&lon_max=-50&year_start=2000&year_end=2026`

Returns `modis`, `viirs`, and `harmonized` monthly series plus `transition_markers`. Values are null before sensor availability. Harmonized `interval_low` and `interval_high` use cell-level standard deviation as a documented proxy, not a Bayesian credible interval.

### Reliability

`GET /reliability?lat_min=-15&lat_max=-5&lon_min=-65&lon_max=-50&year_start=2000&year_end=2026`

Returns four named checks, `failed_checks`, an overall `score` (`High`, `Moderate`, or `Low`), and plain language.

### CSV export

`GET /export?lat_min=-15&lat_max=-5&lon_min=-65&lon_max=-50&year_start=2020&year_end=2026`

Use a browser download or JavaScript `fetch` followed by `response.blob()`. The response is `text/csv`, has `Content-Disposition: attachment; filename=firewatch_export.csv`, and contains only actual detection-level coordinates from the raw FIRMS dataset. The final line contains NASA FIRMS attribution. The endpoint returns 503 when detection-level data is unavailable; it never substitutes monthly grid-cell coordinates.

Example JavaScript:

```js
const params = new URLSearchParams({
  lat_min: "-15", lat_max: "-5", lon_min: "-65", lon_max: "-50",
  year_start: "2000", year_end: "2026"
});
const response = await fetch(`http://localhost:8000/export?${params}`);
if (!response.ok) throw new Error((await response.json()).detail);
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "firewatch_export.csv";
link.click();
URL.revokeObjectURL(url);
```

## Frontend and network access

For a frontend running on another computer, start Uvicorn bound to `0.0.0.0`, expose port 8000 on the development network, and use the backend computer's LAN address instead of `localhost`, for example `http://192.168.1.20:8000`. Add the frontend origin to `CORS_ORIGINS`, restart the backend, and call `/health` before integrating the data views.

## Project layout

- `app/main.py`: application, lifespan loading, CORS, root and health endpoints.
- `app/api/`: thin HTTP routes and parameter validation.
- `app/services/`: dataset loading, validation, calculations, and CSV export.
- `app/schemas/`: Pydantic response contracts.
- `app/utils/`: reusable filtering and statistics helpers.
- `tests/`: synthetic endpoint and unavailable-data tests.

Real source availability and aggregation validation are visible in `/health`. The backend is not a 25-year scientific climatology: the supplied real detections cover only Suomi-NPP during 2012 and short MODIS/VIIRS NRT windows in November 2026.
