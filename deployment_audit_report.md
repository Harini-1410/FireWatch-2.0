# Phase 6A Deployment Audit

## Baseline

- Python: 3.13.12
- FastAPI: 0.141.1
- Uvicorn: 0.52.3
- Pandas: 2.3.3
- NumPy: 2.3.5
- PyArrow: 19.0.1
- Pytest: 8.4.2
- Docker: unavailable during the audit
- Baseline tests: 20 passed, 1 Starlette/httpx deprecation warning
- Compilation: passed

## Findings

- The application loads DataFrames during FastAPI lifespan and retains them in memory.
- Real mode loads the raw FIRMS detections and validated real aggregation; synthetic mode loads only explicit synthetic fixtures.
- `run.py` used development reload unconditionally.
- No Dockerfile, `.dockerignore`, or deployment guide existed.
- Logging was fixed at INFO and had no explicit startup/shutdown messages.
- Configuration was environment-driven but had no configurable log level or host/port settings.
- Multiple workers would duplicate the large raw DataFrame in memory.
- The source dataset coverage is fragmented and is not a continuous scientific climatology.
- No authentication, rate limiting, or production reverse proxy is included.
- Docker was unavailable, so container build and runtime checks could not be performed.

## Deployment posture

The approved deployment target is a single-worker ASGI process with datasets mounted at runtime. Synthetic mode remains the default. Real mode must be selected explicitly with `DATA_SOURCE_MODE=real`; it never falls back to synthetic data.

The backend remains conditionally ready for local or controlled internal deployment. Scientific limitations are unchanged and are documented in `README.md` and `DEPLOYMENT.md`.
