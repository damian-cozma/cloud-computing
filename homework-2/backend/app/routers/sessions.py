from fastapi import APIRouter, HTTPException, status
from ..services.games_service import get_game_by_id
from ..schemas.session import SessionCreate, SessionResponse
from ..services.sessions_service import delete_session, get_sessions_for_game, create_session, update_session

router = APIRouter(tags=["sessions"])


@router.get("/games/{game_id}/sessions", response_model=list[SessionResponse], status_code=status.HTTP_200_OK)
def get_game_sessions(game_id: int):
    game = get_game_by_id(game_id)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    return get_sessions_for_game(game_id)

@router.post("/games/{game_id}/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def add_session(game_id: int, session: SessionCreate):

    game = get_game_by_id(game_id)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    new_session = create_session(game_id, session.model_dump())

    return new_session

@router.put("/sessions/{session_id}", response_model=SessionResponse, status_code=status.HTTP_200_OK)
def edit_session(session_id: int, session: SessionCreate):
    updated_session = update_session(session_id, session.model_dump())

    if updated_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    return updated_session

@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
def remove_session(session_id: int):
    deleted = delete_session(session_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    return {"message": "Session deleted"}