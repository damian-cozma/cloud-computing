from azure.cosmos.exceptions import CosmosResourceNotFoundError
from ..db.cosmos import reviews_container


def _to_api_review(review: dict) -> dict:
    return {
        **review,
        "id": int(review["id"]),
        "game_id": int(review["game_id"])
    }


def get_all_reviews():
    reviews = list(reviews_container.read_all_items())

    return [
        _to_api_review(review)
        for review in reviews
    ]


def get_review_for_game(game_id: int):
    query = "SELECT * FROM c WHERE c.game_id = @game_id"
    parameters = [
        {"name": "@game_id", "value": str(game_id)}
    ]

    reviews = list(
        reviews_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        )
    )

    if not reviews:
        return None

    return _to_api_review(reviews[0])


def create_review(game_id, review_data):
    if is_duplicate_review(game_id):
        return None

    reviews = get_all_reviews()

    if reviews:
        current_id = max(review["id"] for review in reviews) + 1
    else:
        current_id = 1

    average_score = calculate_rating(review_data)

    new_review = {
        "id": str(current_id),
        "game_id": str(game_id),
        "text": review_data["text"],
        "graphics": review_data["graphics"],
        "mechanics": review_data["mechanics"],
        "story": review_data["story"],
        "sound": review_data["sound"],
        "rating": average_score
    }

    created_review = reviews_container.create_item(body=new_review)

    return _to_api_review(created_review)


def update_review(game_id, review_data):
    existing_review = get_review_for_game(game_id)

    if not existing_review:
        return None

    average_score = calculate_rating(review_data)

    updated_review = {
        "id": str(existing_review["id"]),
        "game_id": str(game_id),
        "text": review_data["text"],
        "graphics": review_data["graphics"],
        "mechanics": review_data["mechanics"],
        "story": review_data["story"],
        "sound": review_data["sound"],
        "rating": average_score
    }

    result = reviews_container.upsert_item(body=updated_review)

    return _to_api_review(result)


def delete_review(game_id):
    existing_review = get_review_for_game(game_id)

    if not existing_review:
        return False

    reviews_container.delete_item(
        item=str(existing_review["id"]),
        partition_key=str(game_id)
    )

    return True


# ----------------- VALIDATION -----------------

def is_duplicate_review(game_id):
    review = get_review_for_game(game_id)
    return review is not None


# ----------------- UTILS -----------------

def calculate_rating(review_data):
    score_fields = ["graphics", "mechanics", "story", "sound"]
    total = sum(review_data[field] for field in score_fields)
    return round(total / len(score_fields), 2)