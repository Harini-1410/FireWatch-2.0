from pydantic import BaseModel


class BBox(BaseModel):
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float


class CalendarItem(BaseModel):
    year: int
    month: int
    harmonized_count: float
    modis_count: float
    viirs_count: float
    anomaly_value: float | None
    alert_status: str
    confidence: str
    is_provisional: bool


class CalendarResponse(BaseModel):
    bbox: BBox
    year_start: int
    year_end: int
    grid: list[CalendarItem]
