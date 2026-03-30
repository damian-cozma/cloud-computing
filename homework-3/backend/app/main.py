from fastapi import FastAPI
from app.routers import external_news, external_games, games, reviews, analytics, sessions
from fastapi.middleware.cors import CORSMiddleware
import google.cloud.logging
import logging


client = google.cloud.logging.Client()
client.setup_logging()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    logging.info("Cineva a accesat ruta de Root.")
    return {"message": "FastAPI works!"}

@app.get("/api/force-error")
def force_error():
    logging.error("EROARE FORȚATĂ PENTRU TEST ALERTĂ")
    return {"status": "error_sent_to_cloud"}
# -----------------------------------------------------

app.include_router(games.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(external_games.router, prefix="/api")
app.include_router(external_news.router, prefix="/api")