import json
from pathlib import Path

REVIEWS_FILE = Path(__file__).resolve().parent.parent / "data" / "reviews.json"

def get_all_reviews():
    try:
        with open(REVIEWS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def get_review_for_game(game_id: int):
    reviews = get_all_reviews()

    for review in reviews:
        if review["game_id"] == game_id:
            return review
    return None

def create_review(game_id, review_data):
    reviews = get_all_reviews()

    if reviews:
        last_review = reviews[-1]
        current_id = last_review["id"] + 1
    else:
        current_id = 1

    average_score = calculate_rating(review_data)

    new_review = {
        "id": current_id,
        "game_id": game_id,
        **review_data,
        "rating": average_score
    }

    reviews.append(new_review)

    with open(REVIEWS_FILE, "w") as f:
        json.dump(reviews, f, indent=4)

    return new_review

def update_review(game_id, review_data):
    reviews = get_all_reviews()

    for i, review in enumerate(reviews):
        if review["game_id"] == game_id:
            average_score = calculate_rating(review_data)

            reviews[i] = {
                "id": review["id"],
                "game_id": game_id,
                **review_data,
                "rating": average_score
            }

            with open(REVIEWS_FILE, "w") as f:
                json.dump(reviews, f, indent=4)
            return reviews[i]

    return None

def delete_review(game_id):
    reviews = get_all_reviews()

    updated_list = list(filter(lambda review: review["game_id"] != game_id, reviews))

    if len(updated_list) != len(reviews):
        with open(REVIEWS_FILE, "w") as f:
            json.dump(updated_list, f, indent=4)
            return True
    else:
        return False

# ----------------- VALIDATION -----------------

def is_duplicate_review(game_id):
    reviews = get_all_reviews()
    for review in reviews:
        if review["game_id"] == game_id:
            return True

    return False

# ----------------- UTILS -----------------

def calculate_rating(review_data):
    score_fields = ["graphics", "mechanics", "story", "sound"]
    total = sum(review_data[field] for field in score_fields)
    return round(total / len(score_fields), 2)