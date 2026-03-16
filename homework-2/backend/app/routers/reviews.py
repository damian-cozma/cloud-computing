from fastapi import APIRouter, HTTPException, status
from ..schemas.review import ReviewCreate, ReviewResponse
from ..services.games_service import get_game_by_id
from ..services.reviews_service import (
    get_all_reviews,
    get_review_for_game,
    is_duplicate_review,
    create_review,
    update_review,
    delete_review
)

router = APIRouter(tags=["reviews"])


@router.get("/reviews", status_code=status.HTTP_200_OK)
def get_reviews():
    return get_all_reviews()


@router.get("/games/{game_id}/review", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
def get_game_review(game_id: int):
    game = get_game_by_id(game_id)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    review = get_review_for_game(game_id)

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You haven't reviewed this game yet."
        )

    return review


@router.post("/games/{game_id}/review", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_review(game_id: int, review: ReviewCreate):
    game = get_game_by_id(game_id)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    if is_duplicate_review(game_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Review already exists for this game."
        )

    return create_review(game_id, review.model_dump())

@router.put("/games/{game_id}/review", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
def edit_review(game_id: int, review: ReviewCreate):
    game = get_game_by_id(game_id)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    updated_review = update_review(game_id, review.model_dump())

    if updated_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You haven't reviewed this game yet."
        )

    return updated_review

@router.delete("/games/{game_id}/review", status_code=status.HTTP_200_OK)
def remove_review(game_id: int):
    game = get_game_by_id(game_id)

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    deleted = delete_review(game_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You haven't reviewed this game yet."
        )

    return {"message": "Review deleted successfully"}