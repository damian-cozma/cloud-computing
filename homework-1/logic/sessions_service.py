import json
import re

SESSIONS_FILE = "storage/sessions.json"

def get_sessions_for_game(game_id):
    try:
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
            return [s for s in sessions if s["game_id"] == game_id]
    except FileNotFoundError:
        return []


def create_session(game_id, data):
    try:
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    except FileNotFoundError:
        sessions = []

    new_id = sessions[-1]["id"] + 1 if sessions else 1
    new_session = {
        "id": new_id,
        "game_id": game_id,
        "duration_minutes": data["duration_minutes"],
        "date": data["date"]
    }
    sessions.append(new_session)
    with open(SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=4)
    return new_session


def update_session(session_id, data):
    with open(SESSIONS_FILE, "r") as f:
        sessions = json.load(f)

    for s in sessions:
        if s["id"] == session_id:
            s["duration_minutes"] = data["duration_minutes"]
            s["date"] = data["date"]
            with open(SESSIONS_FILE, "w") as f:
                json.dump(sessions, f, indent=4)
            return s
    return None

def delete_sessions_for_game(game_id):
    try:
        with open(SESSIONS_FILE, "r") as f:
            sessions = json.load(f)
    except FileNotFoundError:
        return

    updated_sessions = [s for s in sessions if s["game_id"] != game_id]

    with open(SESSIONS_FILE, "w") as f:
        json.dump(updated_sessions, f, indent=4)

def delete_session(session_id):
    with open(SESSIONS_FILE, "r") as f:
        sessions = json.load(f)

    initial_len = len(sessions)
    sessions = [s for s in sessions if s["id"] != session_id]
    if len(sessions) < initial_len:
        with open(SESSIONS_FILE, "w") as f:
            json.dump(sessions, f, indent=4)
        return True
    return False

# ----------------- VALIDATION -----------------

def validate_session_data(data):
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object."

    required_fields = ["duration_minutes", "date"]

    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: '{field}'."

    if not isinstance(data["duration_minutes"], int) or data["duration_minutes"] <= 0:
        return False, "Field 'duration_minutes' must be a positive integer."

    if not isinstance(data["date"], str) or not re.match(r"^\d{4}-\d{2}-\d{2}$", data["date"]):
        return False, "Field 'date' must be a string in YYYY-MM-DD format."

    return True, None