from ..db.cosmos import sessions_container
from .event_publisher import publish_event

def _to_api_session(session: dict) -> dict:
    return {
        **session,
        "id": int(session["id"]),
        "game_id": int(session["game_id"])
    }


def get_all_sessions():
    sessions = list(sessions_container.read_all_items())

    return [
        _to_api_session(session)
        for session in sessions
    ]


def get_sessions_for_game(game_id):
    query = "SELECT * FROM c WHERE c.game_id = @game_id"
    parameters = [
        {"name": "@game_id", "value": str(game_id)}
    ]

    sessions = list(
        sessions_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        )
    )

    return [
        _to_api_session(session)
        for session in sessions
    ]


def create_session(game_id, data):
    sessions = get_all_sessions()

    if sessions:
        current_id = max(session["id"] for session in sessions) + 1
    else:
        current_id = 1

    new_session = {
        "id": str(current_id),
        "game_id": str(game_id),
        "duration_minutes": data["duration_minutes"],
        "date": data["date"].isoformat()
    }

    created_session = sessions_container.create_item(body=new_session)

    try:
        publish_event(
            "session.created",
            {
                "session_id": current_id,
                "game_id": game_id,
                "duration_minutes": data["duration_minutes"]
            }
        )
    except Exception as e:
        print(f"Failed to publish event: {e}")

    return _to_api_session(created_session)


def update_session(session_id, data):
    query = "SELECT * FROM c WHERE c.id = @id"
    parameters = [
        {"name": "@id", "value": str(session_id)}
    ]

    sessions = list(
        sessions_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        )
    )

    if not sessions:
        return None

    existing = sessions[0]

    updated_session = {
        "id": str(session_id),
        "game_id": existing["game_id"],
        "duration_minutes": data["duration_minutes"],
        "date": data["date"].isoformat()
    }

    result = sessions_container.upsert_item(body=updated_session)

    return _to_api_session(result)


def delete_sessions_for_game(game_id):
    sessions = get_sessions_for_game(game_id)

    for session in sessions:
        sessions_container.delete_item(
            item=str(session["id"]),
            partition_key=str(game_id)
        )


def delete_session(session_id):
    query = "SELECT * FROM c WHERE c.id = @id"
    parameters = [
        {"name": "@id", "value": str(session_id)}
    ]

    sessions = list(
        sessions_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        )
    )

    if not sessions:
        return False

    existing = sessions[0]

    sessions_container.delete_item(
        item=str(session_id),
        partition_key=existing["game_id"]
    )

    return True