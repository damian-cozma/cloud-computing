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
    if is_duplicate_game(game_data["title"], game_data["platform"]):
        return None

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
    updated_list = list(filter(lambda game: game["id"] != game_id, games))

    if len(updated_list) == len(games):
        return False

    delete_review(game_id)
    delete_sessions_for_game(game_id)

    with open(GAMES_FILE, "w") as f:
        json.dump(updated_list, f, indent=4)

    return True

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