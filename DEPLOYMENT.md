# FireWatch 2.0 Deployment

## Scope

This guide covers local and containerized deployment only. No public deployment is included. The backend loads configured Parquet files into memory during startup, so use one worker by default.

## Windows PowerShell

Create and activate an environment:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Synthetic development mode:

```powershell
$env:DATA_SOURCE_MODE = "synthetic"
$env:MOCK_DATA_MODE = "false"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level info
```

Real mode requires the configured real files:

```powershell
$env:DATA_SOURCE_MODE = "real"
$env:MOCK_DATA_MODE = "false"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info
```

Use `python run.py` for the same non-reload startup behavior. For development auto-reload, invoke Uvicorn explicitly with `--reload`; it is intentionally not enabled by `run.py`.

Verify:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
Invoke-WebRequest http://127.0.0.1:8000/docs
pytest -q
python -m compileall -q app scripts tests
```

## Docker

Docker was unavailable in the validation environment, so these commands are documented but not claimed as executed.

The image installs `requirements-runtime.txt`, which intentionally excludes pytest and HTTPX test tooling. Local development and CI continue to use `requirements.txt`.

Build without datasets or secrets in the image:

```powershell
docker build -t firewatch-backend:local .
```

Synthetic container:

```powershell
docker run --rm -p 8000:8000 `
  -e DATA_SOURCE_MODE=synthetic `
  -e MOCK_DATA_MODE=false `
  firewatch-backend:local
```

Real container with a runtime-mounted project directory:

```powershell
docker run --rm -p 8000:8000 `
  -e DATA_SOURCE_MODE=real `
  -e MOCK_DATA_MODE=false `
  -e HARMONIZED_DATA_PATH=/datasets/data/firewatch/cell_month_harmonized.parquet `
  -e RAW_DETECTIONS_DATA_PATH=/datasets/data/Dataset/firewatch_2.0/data/raw_detections/firewatch_raw_detections_clean.parquet `
  -e REAL_AGGREGATION_DATA_PATH=/datasets/data/firewatch/real_monthly_aggregation.parquet `
  -v "${PWD}:/datasets:ro" `
  firewatch-backend:local
```

The container runs as non-root user `appuser`. Dataset volumes are read-only in the example. Do not mount `.env` or private credentials into the image. Keep the default worker count at one because every worker loads its own DataFrames.

## Configuration

- `DATA_SOURCE_MODE`: `synthetic` by default or explicit `real`.
- `MOCK_DATA_MODE`: explicit development fallback flag; not used to silently switch real mode.
- `HARMONIZED_DATA_PATH`: configured harmonized dataset path.
- `RAW_DETECTIONS_DATA_PATH`: raw FIRMS Parquet/CSV path.
- `REAL_AGGREGATION_DATA_PATH`: validated descriptive aggregation path.
- `CORS_ORIGINS`: comma-separated explicit allowlist.
- `HOST`: server bind host, default `0.0.0.0`.
- `PORT`: server port, default `8000`.
- `LOG_LEVEL`: logging level, default `INFO`.

## Operations

- Startup loads and validates datasets once.
- `/health` reports active mode and dataset availability without exposing filesystem paths.
- Stop with Ctrl+C or the container stop command; Uvicorn performs graceful ASGI shutdown.
- Restart the process after changing environment variables or mounted datasets.
- Do not use multiple workers until memory usage has been measured for the deployment host.

## Limitations

The available real data is not a continuous 25-year climatology. Observation effort, MODIS/VIIRS calibration, LFAI, calibrated probabilities, and credible intervals are unavailable. Real mode therefore supports validated data status and raw FIRMS export, while harmonized analytics return HTTP 422.

The `/reliability` endpoint is informational and does not act as an authorization or blocking gate for synthetic analytics. Its month check measures months containing detection records, not observation opportunity, because observation-effort metadata is unavailable.
