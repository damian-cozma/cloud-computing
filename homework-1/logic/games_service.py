import json

GAMES_FILE = "storage/games.json"

def read_games():
    try:
        with open(GAMES_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def read_game_by_id(game_id):
    games = read_games()
    for game in games:
        if game["id"] == game_id:
            return game
    return None