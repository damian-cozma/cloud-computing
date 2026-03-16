from fastapi import APIRouter
from ..services.games_service import get_all_games

router = APIRouter()

@router.get("/games")
def get_games():
    return get_all_games()