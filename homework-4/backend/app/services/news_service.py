import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_BASE_URL = "https://newsapi.org/v2"


def get_gaming_news():
    url = f"{NEWS_BASE_URL}/everything"

    params = {
        "q": '"video game" OR videogame OR gaming OR Steam OR PlayStation OR Xbox OR Nintendo',
        "searchIn": "title,description",
        "domains": "ign.com,gamespot.com,polygon.com,pcgamer.com,eurogamer.net,videogameschronicle.com",
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": 100,
        "apiKey": NEWS_API_KEY
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()

    news = []

    for article in data.get("articles", []):
        news.append({
            "title": article["title"],
            "source": article["source"]["name"],
            "url": article["url"],
            "image": article["urlToImage"],
            "published_at": article["publishedAt"]
        })

    return news