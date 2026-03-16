from pydantic import BaseModel
from typing import Literal

class LeaderboardItem(BaseModel):
    id: int
    title: str
    platform: str
    rating: float

class ProgressStats(BaseModel):
    Playing: int
    Completed: int
    Abandoned: int

class StatisticsResponse(BaseModel):
    total_games: int
    total_reviews: int
    favorite_platforms: list[str]
    games_per_platform: dict[str, int]
    overall_progress: ProgressStats