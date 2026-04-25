from azure.cosmos.exceptions import CosmosResourceNotFoundError
from ..db.cosmos import games_container
from ..services.reviews_service import delete_review
from ..services.sessions_service import delete_sessions_for_game


def _to_api_game(game: dict) -> dict:
    return {
        **game,
        "id": int(game["id"])
    }


def get_all_games():
    games = list(games_container.read_all_items())

    return [
        _to_api_game(game)
        for game in games
    ]


def get_game_by_id(game_id):
    try:
        game = games_container.read_item(
            item=str(game_id),
            partition_key=str(game_id)
        )
        return _to_api_game(game)
    except CosmosResourceNotFoundError:
        return None


def create_game(game_data):
    if is_duplicate_game(game_data["title"], game_data["platform"]):
        return None

    games = get_all_games()

    if games:
        current_id = max(game["id"] for game in games) + 1
    else:
        current_id = 1

    new_game = {
        "id": str(current_id),
        "title": game_data["title"],
        "platform": game_data["platform"],
        "progress": game_data["progress"],
        "rawg_id": game_data.get("rawg_id")
    }

    created_game = games_container.create_item(body=new_game)

    return _to_api_game(created_game)


def delete_game(game_id):
    existing_game = get_game_by_id(game_id)

    if not existing_game:
        return False

    delete_review(game_id)
    delete_sessions_for_game(game_id)

    games_container.delete_item(
        item=str(game_id),
        partition_key=str(game_id)
    )

    return True


def update_game(game_id, game_data):
    existing_game = get_game_by_id(game_id)

    if not existing_game:
        return None

    updated_game = {
        "id": str(game_id),
        "title": game_data["title"],
        "platform": game_data["platform"],
        "progress": game_data["progress"],
        "rawg_id": game_data.get("rawg_id")
    }

    result = games_container.upsert_item(body=updated_game)

    return _to_api_game(result)


# ----------------- VALIDATION -----------------

def is_duplicate_game(title, platform):
    games = get_all_games()

    for game in games:
        if (
            game["title"].lower() == title.lower()
            and game["platform"].lower() == platform.lower()
        ):
            return True

    return False


def is_duplicate_game_for_update(game_id: int, title: str, platform: str) -> bool:
    games = get_all_games()

    for game in games:
        if (
            game["id"] != game_id
            and game["title"].lower() == title.lower()
            and game["platform"].lower() == platform.lower()
        ):
            return True

    return False