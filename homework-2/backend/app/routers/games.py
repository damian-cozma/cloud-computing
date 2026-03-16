from fastapi import APIRouter, HTTPException
from starlette import status
from ..services.games_service import (
    get_all_games,
    get_game_by_id,
    delete_game,
    create_game,
    update_game,
)
from ..schemas.game import GameCreate, GameResponse

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/", status_code=status.HTTP_200_OK)
def get_games():
    return get_all_games()

@router.get("/{game_id}", status_code=status.HTTP_200_OK)
def get_game(game_id: int):
    game = get_game_by_id(game_id)

    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    return game

@router.post("/", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
def add_game(game: GameCreate):
    created_game = create_game(game.model_dump())

    if created_game is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Game already exists"
        )

    return created_game

@router.delete("/{game_id}", status_code=status.HTTP_200_OK)
def remove_game(game_id: int):
    was_deleted = delete_game(game_id)

    if not was_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    return {"message": "Game deleted successfully"}

@router.put("/{game_id}", response_model=GameResponse, status_code=status.HTTP_200_OK)
def edit_game(game_id: int, game: GameCreate):
    updated_game = update_game(game_id, game.model_dump())

    if updated_game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    return updated_game