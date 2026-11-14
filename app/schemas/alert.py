from pydantic import BaseModel


class AlertResponse(BaseModel):
    year: int
    month: int
    status: str
    percentile: float
    plain_language: str
    current_count: float
    historical_median: float
