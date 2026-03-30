from google.cloud import datastore

client = datastore.Client()
KIND = "Review"


def get_all_reviews():
    query = client.query(kind=KIND)
    reviews = []
    for entity in query.fetch():
        review = dict(entity)
        review["id"] = entity.key.id
        reviews.append(review)
    return reviews


def get_review_for_game(game_id: int):
    query = client.query(kind=KIND)
    query.add_filter("game_id", "=", int(game_id))
    results = list(query.fetch(limit=1))

    if results:
        review = dict(results[0])
        review["id"] = results[0].key.id
        return review
    return None


def create_review(game_id, review_data):
    average_score = calculate_rating(review_data)

    key = client.key(KIND)
    new_review = datastore.Entity(key=key)

    data_to_save = {
        "game_id": int(game_id),
        **review_data,
        "rating": average_score
    }
    new_review.update(data_to_save)
    client.put(new_review)

    saved_review = dict(new_review)
    saved_review["id"] = new_review.key.id
    return saved_review


def update_review(game_id, review_data):
    query = client.query(kind=KIND)
    query.add_filter("game_id", "=", int(game_id))
    results = list(query.fetch(limit=1))

    if results:
        entity = results[0]
        average_score = calculate_rating(review_data)

        data_to_save = {
            "game_id": int(game_id),
            **review_data,
            "rating": average_score
        }
        entity.update(data_to_save)
        client.put(entity)

        updated_review = dict(entity)
        updated_review["id"] = entity.key.id
        return updated_review

    return None


def delete_review(game_id):
    query = client.query(kind=KIND)
    query.add_filter("game_id", "=", int(game_id))
    results = list(query.fetch())

    if results:
        keys_to_delete = [entity.key for entity in results]
        client.delete_multi(keys_to_delete)
        return True
    return False


# ----------------- VALIDATION -----------------
def is_duplicate_review(game_id):
    query = client.query(kind=KIND)
    query.add_filter("game_id", "=", int(game_id))
    results = list(query.fetch(limit=1))
    return len(results) > 0


# ----------------- UTILS -----------------
def calculate_rating(review_data):
    score_fields = ["graphics", "mechanics", "story", "sound"]
    total = sum(review_data[field] for field in score_fields)
    return round(total / len(score_fields), 2)