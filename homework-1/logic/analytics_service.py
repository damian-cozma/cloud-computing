from .games_service import get_all_games
from .reviews_service import get_all_reviews


def get_leaderboard():
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

    leaderboard.sort(key=lambda x: x["rating"], reverse=True)

    return leaderboard

def get_statistics():
    games = get_all_games()
    reviews = get_all_reviews()

    if not games:
        return None

    total_games = len(games)
    total_reviews = len(reviews)

    platforms_count = {}

    progress_count = {
        "Playing": 0,
        "Completed": 0,
        "Abandoned": 0
    }

    for game in games:
        platform = game["platform"]
        progress = game.get("progress")

        if platform in platforms_count:
            platforms_count[platform] += 1
        else:
            platforms_count[platform] = 1

        if progress in progress_count:
            progress_count[progress] += 1

    max_count = max(platforms_count.values())

    favorite_platforms = [platform
                          for platform, count in platforms_count.items()
                          if count == max_count]

    return {
        "total_games": total_games,
        "total_reviews": total_reviews,
        "favorite_platforms": favorite_platforms,
        "games_per_platform": platforms_count,
        "overall_progress": progress_count
    }