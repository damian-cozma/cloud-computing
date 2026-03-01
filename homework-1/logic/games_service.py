import json

GAMES_FILE = "storage/games.json"

def read_games():
    try:
        with open(GAMES_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def find_game_by_id(game_id):
    games = read_games()
    for game in games:
        if game["id"] == game_id:
            return game
    return None

def create_game(game_data):
    games = read_games()
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
    games = read_games()

    updated_list = list(filter(lambda game: game["id"] != game_id, games))

    if len(updated_list) != len(games):
        with open(GAMES_FILE, "w") as f:
            json.dump(updated_list, f, indent=4)
            return True
    else:
        return False

def update_game(game_id, new_data):
    games = read_games()

    for i, game in enumerate(games):
        if game["id"] == game_id:
            games[i] = {
                "id": game_id,
                **new_data
            }

            with open(GAMES_FILE, "w") as f:
                json.dump(games, f, indent=4)

            return games[i]

    return None