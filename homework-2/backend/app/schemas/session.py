from pydantic import BaseModel, ConfigDict, Field
from datetime import date

class SessionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    duration_minutes: int = Field(..., gt=0)
    date: date

class SessionResponse(BaseModel):
    id: int
    game_id: int
    duration_minutes: int
    date: date

    model_config = ConfigDict(from_attributes=True)