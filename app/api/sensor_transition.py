from fastapi import APIRouter, Depends, Query

from app.api.common import require_harmonized, validate_bounds
from app.schemas.sensor import SensorTransitionResponse
from app.services.sensor_service import build_transition

router = APIRouter()


@router.get("/sensor-transition", response_model=SensorTransitionResponse, tags=["sensor transition"])
def sensor_transition(lat_min: float = Query(...), lat_max: float = Query(...), lon_min: float = Query(...), lon_max: float = Query(...), year_start: int = Query(...), year_end: int = Query(...), frame=Depends(require_harmonized)):
    validate_bounds(lat_min, lat_max, lon_min, lon_max, year_start, year_end)
    return build_transition(frame, lat_min, lat_max, lon_min, lon_max, year_start, year_end)
