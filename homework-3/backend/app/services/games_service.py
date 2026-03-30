from google.cloud import datastore
from ..services.reviews_service import delete_review
from ..services.sessions_service import delete_sessions_for_game
from .storage_service import upload_image_to_gcs

client = datastore.Client()
KIND = "Game"


def get_all_games():
    query = client.query(kind=KIND)
    games = []
    for entity in query.fetch():
        game = dict(entity)
        game["id"] = entity.key.id

        if "background_image" in game and game["background_image"]:
            if "covers/" in game["background_image"] and "thumbnails/" not in game["background_image"]:
                game["background_image"] = game["background_image"].replace("covers/", "thumbnails/covers/")

        games.append(game)
    return games


def get_game_by_id(game_id):
    key = client.key(KIND, int(game_id))
    entity = client.get(key)

    if entity:
        game = dict(entity)
        game["id"] = entity.key.id
        return game
    return None


def create_game(game_data):
    if is_duplicate_game(game_data["title"], game_data["platform"]):
        return None

    new_image_url = upload_image_to_gcs(game_data.get("background_image"), game_data.get("rawg_id"))

    game_data["background_image"] = new_image_url
    # ----------------------------------------

    key = client.key(KIND)
    new_game_entity = datastore.Entity(key=key)
    new_game_entity.update(game_data)

    client.put(new_game_entity)

    saved_game = dict(new_game_entity)
    saved_game["id"] = new_game_entity.key.id
    return saved_game

def delete_game(game_id):
    key = client.key(KIND, int(game_id))
    if not client.get(key):
        return False

    client.delete(key)

    delete_review(game_id)
    delete_sessions_for_game(game_id)
    return True


def update_game(game_id, game_data):
    key = client.key(KIND, int(game_id))
    game_entity = client.get(key)

    if game_entity:
        game_entity.update(game_data)
        client.put(game_entity)

        updated_game = dict(game_entity)
        updated_game["id"] = game_entity.key.id
        return updated_game

    return None


# ----------------- VALIDATION -----------------

def is_duplicate_game(title, platform):
    games = get_all_games()
    for game in games:
        if game["title"].lower() == title.lower() and game["platform"].lower() == platform.lower():
            return True
    return False


def is_duplicate_game_for_update(game_id: int, title: str, platform: str) -> bool:
    games = get_all_games()
    for game in games:
        if game["id"] != game_id and \
                game["title"].lower() == title.lower() and \
                game["platform"].lower() == platform.lower():
            return True
    return False