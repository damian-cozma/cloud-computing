from typing import Literal

from fastapi import APIRouter, HTTPException, status
from ..services.analytics_service import get_leaderboard, get_statistics

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/leaderboard", response_model=list[dict], status_code=status.HTTP_200_OK)
def leaderboard(platform: str | None = None, sort: Literal["asc", "desc"] = "desc"):
    data = get_leaderboard(platform_filter=platform, sort_order=sort)

    return data

@router.get("/statistics", status_code=status.HTTP_200_OK)
def statistics():
    stats = get_statistics()

    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No games found"
        )

    return stats