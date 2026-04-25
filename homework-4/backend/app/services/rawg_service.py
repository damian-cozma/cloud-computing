import os
import requests
from dotenv import load_dotenv

load_dotenv()

RAWG_API_KEY = os.getenv("RAWG_API_KEY")
RAWG_BASE_URL = "https://api.rawg.io/api"

def search_games_rawg(query: str):
    url = f"{RAWG_BASE_URL}/games"
    params = {
        "key": RAWG_API_KEY,
        "search": query,
        "page_size": 10
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()

    results = []
    for game in data.get("results", []):
        results.append({
            "rawg_id": game["id"],
            "name": game["name"],
            "released": game.get("released"),
            "rating": game.get("rating"),
            "background_image": game.get("background_image")
        })

    return results


def get_game_details_rawg(rawg_id: int):
    url = f"{RAWG_BASE_URL}/games/{rawg_id}"
    params = {
        "key": RAWG_API_KEY
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    game = response.json()

    return {
        "rawg_id": game["id"],
        "name": game["name"],
        "released": game.get("released"),
        "rating": game.get("rating"),
        "metacritic": game.get("metacritic"),
        "background_image": game.get("background_image"),
        "platforms": [
            p["platform"]["name"]
            for p in game.get("platforms", [])
            if "platform" in p and "name" in p["platform"]
        ],
        "genres": [
            g["name"] for g in game.get("genres", [])
        ]
    }