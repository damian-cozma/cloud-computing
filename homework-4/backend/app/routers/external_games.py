from fastapi import APIRouter, HTTPException, Query
import requests

from ..services.rawg_service import search_games_rawg, get_game_details_rawg

router = APIRouter(prefix="/external/games", tags=["external-games"])


@router.get("/search")
def search_games(q: str = Query(..., min_length=1)):
    try:
        return search_games_rawg(q)
    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"RAWG API error: {str(e)}")
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="RAWG service unavailable")


@router.get("/{rawg_id}")
def get_game_details(rawg_id: int):
    try:
        return get_game_details_rawg(rawg_id)
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Game not found in RAWG")
        raise HTTPException(status_code=502, detail=f"RAWG API error: {str(e)}")
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="RAWG service unavailable")