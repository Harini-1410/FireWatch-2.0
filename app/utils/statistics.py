from __future__ import annotations

import numpy as np


def anomaly(value: float, median: float, standard_deviation: float) -> float | None:
    if median == 0 or standard_deviation == 0 or np.isnan(standard_deviation):
        return None
    return float((value - median) / standard_deviation)


def alert_status(value: float | None) -> str:
    if value is None:
        return "Normal"
    if value > 1.5:
        return "Unusual"
    if value > 0.5:
        return "Elevated"
    return "Normal"
