from pydantic import BaseModel, field_validator, ConfigDict
import re


class SessionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    duration_minutes: int
    date: str

    @field_validator("duration_minutes")
    @classmethod
    def validate_duration(cls, value: int):
        if value <= 0:
            raise ValueError("duration_minutes must be a positive integer.")
        return value

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str):
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", value):
            raise ValueError("date must be in YYYY-MM-DD format.")
        return value


class SessionResponse(BaseModel):
    id: int
    game_id: int
    duration_minutes: int
    date: str