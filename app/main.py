from __future__ import annotations

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.alert import router as alert_router
from app.api.calendar import router as calendar_router
from app.api.export import router as export_router
from app.api.reliability import router as reliability_router
from app.api.sensor_transition import router as sensor_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.services.data_loader import DataStore

configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FireWatch backend in %s data-source mode", settings.data_source_mode)
    app.state.store = DataStore.load(settings)
    try:
        yield
    finally:
        logger.info("Shutting down FireWatch backend")


app = FastAPI(title="FireWatch 2.0 Backend", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(calendar_router)
app.include_router(alert_router)
app.include_router(sensor_router)
app.include_router(reliability_router)
app.include_router(export_router)


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception):
    logger.exception("Unhandled application error for %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/", tags=["system"])
def root():
    return {"name": "FireWatch 2.0 Backend", "docs": "/docs"}


@app.get("/health", tags=["system"])
def health():
    store = app.state.store
    return {
        "status": "ok",
        "mock_mode": store.mock_mode,
        "data_source_mode": store.data_source_mode,
        "datasets": {
            "harmonized": {
                "available": store.harmonized.available,
                "source": store.harmonized.source,
                "label": store.harmonized_source_label,
                "rows": len(store.harmonized.dataframe) if store.harmonized.dataframe is not None else 0,
                "warnings": store.harmonized.validation.warnings if store.harmonized.validation else [],
            },
            "raw_detections": {
                "available": store.raw.available,
                "source": store.raw.source,
                "rows": len(store.raw.dataframe) if store.raw.dataframe is not None else 0,
                "warnings": store.raw.validation.warnings if store.raw.validation else [],
            },
            "real_aggregation": {
                "available": store.real_aggregation.available if store.real_aggregation else False,
                "source": store.real_aggregation.source if store.real_aggregation else "unavailable",
                "rows": len(store.real_aggregation.dataframe) if store.real_aggregation and store.real_aggregation.dataframe is not None else 0,
                "warnings": store.real_aggregation.validation.warnings if store.real_aggregation and store.real_aggregation.validation else [],
            },
        },
    }
