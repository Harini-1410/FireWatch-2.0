from fastapi import HTTPException, Request


def validate_bounds(lat_min: float, lat_max: float, lon_min: float, lon_max: float, year_start: int, year_end: int) -> None:
    if not -90 <= lat_min <= 90 or not -90 <= lat_max <= 90 or lat_min > lat_max:
        raise HTTPException(400, "Invalid latitude bounding box")
    if not -180 <= lon_min <= 180 or not -180 <= lon_max <= 180 or lon_min > lon_max:
        raise HTTPException(400, "Invalid longitude bounding box")
    if year_start > year_end:
        raise HTTPException(400, "year_start must be less than or equal to year_end")
    if year_start < 1900 or year_end > 2100:
        raise HTTPException(400, "Year values must be between 1900 and 2100")


def require_harmonized(request: Request):
    if request.app.state.store.data_source_mode == "real":
        raise HTTPException(422, "This analytics endpoint requires calibrated harmonized data; the active real dataset is descriptive only")
    state = request.app.state.store.harmonized
    if not state.available or state.dataframe is None:
        raise HTTPException(503, state.error or "Harmonized dataset is unavailable")
    return state.dataframe


def require_raw(request: Request):
    state = request.app.state.store.raw
    if not state.available or state.dataframe is None:
        raise HTTPException(503, state.error or "Detection-level dataset is unavailable; export requires raw NASA FIRMS detections")
    return state.dataframe
