from fastapi import APIRouter, HTTPException
import requests

from ..services.news_service import get_gaming_news

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/")
def gaming_news():
    try:
        return get_gaming_news()

    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e))

    except requests.RequestException:
        raise HTTPException(status_code=503, detail="News service unavailable")