from pydantic import BaseModel, field_validator, ConfigDict

class ReviewCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str
    graphics: int
    mechanics: int
    story: int
    sound: int

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Field 'text' must be a non-empty string.")
        return value

    @field_validator("graphics", "mechanics", "story", "sound")
    @classmethod
    def validate_score(cls, value: int) -> int:
        if value < 1 or value > 10:
            raise ValueError("Scores must be between 1 and 10.")
        return value


class ReviewResponse(BaseModel):
    id: int
    game_id: int
    text: str
    graphics: int
    mechanics: int
    story: int
    sound: int
    rating: float