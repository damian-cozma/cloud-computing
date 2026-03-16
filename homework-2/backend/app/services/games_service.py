import json
from pathlib import Path
from ..services.reviews_service import delete_review
from ..services.sessions_service import delete_sessions_for_game

GAMES_FILE = Path(__file__).resolve().parent.parent / "data" / "games.json"

def get_all_games():
    try:
        with open(GAMES_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def get_game_by_id(game_id):
    games = get_all_games()
    for game in games:
        if game["id"] == game_id:
            return game
    return None

def create_game(game_data):
    games = get_all_games()
    if games:
        last_game = games[-1]
        current_id = last_game["id"] + 1
    else:
        current_id = 1

    new_game = {
        "id": current_id,
        **game_data
    }

    games.append(new_game)

    with open(GAMES_FILE, "w") as f:
        json.dump(games, f, indent=4)

    return new_game

def delete_game(game_id):
    games = get_all_games()

    delete_review(game_id)
    updated_list = list(filter(lambda game: game["id"] != game_id, games))
    delete_sessions_for_game(game_id)

    if len(updated_list) != len(games):
        with open(GAMES_FILE, "w") as f:
            json.dump(updated_list, f, indent=4)
            return True
    else:
        return False

def update_game(game_id, game_data):
    games = get_all_games()

    for i, game in enumerate(games):
        if game["id"] == game_id:
            games[i] = {
                "id": game_id,
                **game_data
            }

            with open(GAMES_FILE, "w") as f:
                json.dump(games, f, indent=4)

            return games[i]

    return None

# ----------------- VALIDATION -----------------

def validate_game_data(data):
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object."

    allowed_fields = ["title", "platform", "progress"]

    for key in data.keys():
        if key not in allowed_fields:
            return False, f"Unexpected field: '{key}'"

    for field in allowed_fields:
        if field not in data:
            return False, f"Missing required field: '{field}'."

        if not isinstance(data[field], str) or not data[field].strip():
            return False, f"Field '{field}' must be a non-empty string."

    valid_progress_statuses = ["Playing", "Completed", "Abandoned"]

    if data["progress"] not in valid_progress_statuses:
        return False, f"Field 'progress' must be one of: {', '.join(valid_progress_statuses)}."

    return True, None

def is_duplicate_game(title, platform):
    games = get_all_games()
    for game in games:
        if game["title"].lower() == title.lower() and game["platform"].lower() == platform.lower():
            return True

    return False