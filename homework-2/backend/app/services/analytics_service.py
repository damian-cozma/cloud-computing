from .games_service import get_all_games
from .reviews_service import get_all_reviews
from .sessions_service import get_all_sessions

def get_leaderboard(platform_filter=None, sort_order="desc"):
    games = get_all_games()
    reviews = get_all_reviews()

    leaderboard = []

    for game in games:
        game_rating = 0

        for review in reviews:
            if review['game_id'] == game["id"]:
                game_rating = review['rating']
                break

        item = {
            "id": game["id"],
            "title": game["title"],
            "platform": game["platform"],
            "rating": game_rating
        }

        leaderboard.append(item)

    if platform_filter:
        leaderboard = [item for item in leaderboard if item["platform"].lower() == platform_filter.lower()]

    is_reverse = True if sort_order.lower() == "desc" else False
    leaderboard.sort(key=lambda x: x["rating"], reverse=is_reverse)

    return leaderboard

def get_statistics():
    games = get_all_games()
    reviews = get_all_reviews()
    sessions = get_all_sessions()

    total_games = len(games)
    total_reviews = len(reviews)
    sessions = get_all_sessions()

    total_minutes = sum(session.get("duration_minutes", 0) for session in sessions)
    total_hours = round(total_minutes / 60, 1)

    platforms_count = {}
    progress_count = {
        "Playing": 0,
        "Completed": 0,
        "Abandoned": 0
    }

    for game in games:
        platform = game["platform"]
        progress = game.get("progress")

        platforms_count[platform] = platforms_count.get(platform, 0) + 1

        if progress in progress_count:
            progress_count[progress] += 1

    favorite_platforms = []
    if platforms_count:
        max_count = max(platforms_count.values())
        favorite_platforms = [
            platform for platform, count in platforms_count.items()
            if count == max_count
        ]

    return {
        "total_games": total_games,
        "total_reviews": total_reviews,
        "favorite_platforms": favorite_platforms,
        "games_per_platform": platforms_count,
        "overall_progress": progress_count,
        "total_hours_played": total_hours
    }