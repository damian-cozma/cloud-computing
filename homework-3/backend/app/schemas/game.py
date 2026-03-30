from pydantic import BaseModel, field_validator, ConfigDict
from typing import Literal

class GameCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    platform: str
    progress: Literal["Playing", "Completed", "Abandoned"]
    rawg_id: int | None = None
    background_image: str | None = None

    @field_validator("title", "platform")
    @classmethod
    def must_not_be_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field must be a non-empty string.")
        return value


class GameResponse(BaseModel):
    id: int
    title: str
    platform: str
    progress: Literal["Playing", "Completed", "Abandoned"]
    rawg_id: int | None = None
    background_image: str | None = None