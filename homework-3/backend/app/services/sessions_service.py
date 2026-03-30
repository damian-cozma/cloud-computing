from google.cloud import datastore

client = datastore.Client()
KIND = "Session"


def get_all_sessions():
    query = client.query(kind=KIND)
    sessions = []
    for entity in query.fetch():
        session = dict(entity)
        session["id"] = entity.key.id
        sessions.append(session)
    return sessions


def get_sessions_for_game(game_id):
    query = client.query(kind=KIND)
    query.add_filter("game_id", "=", int(game_id))
    sessions = []

    for entity in query.fetch():
        session = dict(entity)
        session["id"] = entity.key.id
        sessions.append(session)
    return sessions


def create_session(game_id, data):
    key = client.key(KIND)
    new_session = datastore.Entity(key=key)

    date_val = data["date"].isoformat() if hasattr(data["date"], "isoformat") else data["date"]

    session_data = {
        "game_id": int(game_id),
        "duration_minutes": data["duration_minutes"],
        "date": date_val
    }

    new_session.update(session_data)
    client.put(new_session)

    saved_session = dict(new_session)
    saved_session["id"] = new_session.key.id
    return saved_session


def update_session(session_id, data):
    key = client.key(KIND, int(session_id))
    entity = client.get(key)

    if entity:
        date_val = data["date"].isoformat() if hasattr(data["date"], "isoformat") else data["date"]
        entity.update({
            "duration_minutes": data["duration_minutes"],
            "date": date_val
        })
        client.put(entity)

        updated_session = dict(entity)
        updated_session["id"] = entity.key.id
        return updated_session

    return None


def delete_sessions_for_game(game_id):
    query = client.query(kind=KIND)
    query.add_filter("game_id", "=", int(game_id))
    results = list(query.fetch())

    if results:
        keys_to_delete = [entity.key for entity in results]
        client.delete_multi(keys_to_delete)


def delete_session(session_id):
    key = client.key(KIND, int(session_id))
    if client.get(key):
        client.delete(key)
        return True
    return False