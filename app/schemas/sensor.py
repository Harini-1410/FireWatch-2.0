from pydantic import BaseModel


class SensorPoint(BaseModel):
    label: str
    value: float | None


class HarmonizedPoint(SensorPoint):
    interval_low: float | None
    interval_high: float | None


class TransitionMarker(BaseModel):
    label: str
    year: int
    month: int


class SensorTransitionResponse(BaseModel):
    modis: list[SensorPoint]
    viirs: list[SensorPoint]
    harmonized: list[HarmonizedPoint]
    transition_markers: list[TransitionMarker]
