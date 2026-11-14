from fastapi import APIRouter, Depends, Query

from app.api.common import require_harmonized, validate_bounds
from app.schemas.calendar import CalendarResponse
from app.services.calendar_service import build_calendar

router = APIRouter()


@router.get("/calendar", response_model=CalendarResponse, tags=["calendar"])
def calendar(lat_min: float = Query(...), lat_max: float = Query(...), lon_min: float = Query(...), lon_max: float = Query(...), year_start: int = Query(...), year_end: int = Query(...), frame=Depends(require_harmonized)):
    validate_bounds(lat_min, lat_max, lon_min, lon_max, year_start, year_end)
    return {"bbox": {"lat_min": lat_min, "lat_max": lat_max, "lon_min": lon_min, "lon_max": lon_max}, "year_start": year_start, "year_end": year_end, "grid": build_calendar(frame, lat_min, lat_max, lon_min, lon_max, year_start, year_end)}
