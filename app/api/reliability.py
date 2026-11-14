from fastapi import APIRouter, Depends, Query

from app.api.common import require_harmonized, validate_bounds
from app.schemas.reliability import ReliabilityResponse
from app.services.reliability_service import build_reliability

router = APIRouter()


@router.get("/reliability", response_model=ReliabilityResponse, tags=["reliability"])
def reliability(lat_min: float = Query(...), lat_max: float = Query(...), lon_min: float = Query(...), lon_max: float = Query(...), year_start: int = Query(...), year_end: int = Query(...), frame=Depends(require_harmonized)):
    validate_bounds(lat_min, lat_max, lon_min, lon_max, year_start, year_end)
    return build_reliability(frame, lat_min, lat_max, lon_min, lon_max, year_start, year_end)
