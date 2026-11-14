from fastapi import APIRouter, Depends, Query
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.api.common import require_raw, validate_bounds
from app.services.export_service import build_export

router = APIRouter()


@router.get("/export", tags=["export"])
def export_csv(lat_min: float = Query(...), lat_max: float = Query(...), lon_min: float = Query(...), lon_max: float = Query(...), year_start: int = Query(...), year_end: int = Query(...), frame=Depends(require_raw)):
    validate_bounds(lat_min, lat_max, lon_min, lon_max, year_start, year_end)
    try:
        stream = build_export(frame, lat_min, lat_max, lon_min, lon_max, year_start, year_end)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    return StreamingResponse(stream, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=firewatch_export.csv"})
