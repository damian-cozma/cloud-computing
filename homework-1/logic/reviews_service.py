import json

REVIEWS_FILE = "storage/reviews.json"

def get_all_reviews():
    try:
        with open(REVIEWS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def get_review_for_game(game_id):
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

    score_fields = ["graphics", "mechanics", "story", "sound"]
    total_score = sum(review_data[field] for field in score_fields)
    average_score = round(total_score / len(review_data), 2)

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
            score_fields = ["graphics", "mechanics", "story", "sound"]
            total_score = sum(review_data[field] for field in score_fields)
            average_score = round(total_score / len(review_data), 2)

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

def validate_review_data(data):
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object."

    allowed_fields = ["text", "graphics", "mechanics", "story", "sound"]

    for key in data.keys():
        if key not in allowed_fields:
            return False, f"Unexpected field: '{key}'"

    for field in allowed_fields:
        if field not in data:
            return False, f"Missing required field: '{field}'."

    rating_fields = ["graphics", "mechanics", "story", "sound"]
    for field in rating_fields:
        if not isinstance(data[field], int) or not (1 <= data[field] <= 10):
            return False, f"Field {field} must be an integer between 1 and 10."

    if not isinstance(data["text"], str) or not data["text"].strip():
        return False, "Field 'text' must be a non-empty string."

    return True, None

def is_duplicate_review(game_id):
    reviews = get_all_reviews()
    for review in reviews:
        if review["game_id"] == game_id:
            return True

    return False