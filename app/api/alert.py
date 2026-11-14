from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.common import require_harmonized, validate_bounds
from app.schemas.alert import AlertResponse
from app.services.alert_service import build_alert

router = APIRouter()


@router.get("/alert", response_model=AlertResponse, tags=["alert"])
def alert(lat_min: float = Query(...), lat_max: float = Query(...), lon_min: float = Query(...), lon_max: float = Query(...), year: int = Query(...), month: int = Query(...), frame=Depends(require_harmonized)):
    if not 1 <= month <= 12:
        raise HTTPException(400, "month must be between 1 and 12")
    validate_bounds(lat_min, lat_max, lon_min, lon_max, year, year)
    try:
        return build_alert(frame, lat_min, lat_max, lon_min, lon_max, year, month)
    except LookupError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
