from typing import Literal

from fastapi import APIRouter, HTTPException, status
from ..services.analytics_service import get_leaderboard, get_statistics
from ..schemas.analytics_schema import LeaderboardItem, StatisticsResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/leaderboard", response_model=list[LeaderboardItem], status_code=status.HTTP_200_OK)
def leaderboard(platform: str | None = None, sort: Literal["asc", "desc"] = "desc"):
    return get_leaderboard(platform_filter=platform, sort_order=sort)

@router.get("/statistics", response_model=StatisticsResponse, status_code=status.HTTP_200_OK)
def statistics():
    return get_statistics()