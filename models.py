from pydantic import BaseModel, Field
from typing import List


class IncidentRequest(BaseModel):
    raw_text: str

class IncidentSummary(BaseModel):
    Summary: str
    root_cause: str
    severity: str
    impact: str
    actions: List[str]
    thought_process: str