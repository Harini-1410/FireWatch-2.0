from pydantic import BaseModel


class ReliabilityCheck(BaseModel):
    check: str
    passed: bool
    detail: str


class ReliabilityResponse(BaseModel):
    score: str
    checks: list[ReliabilityCheck]
    failed_checks: list[str]
    plain_language: str
