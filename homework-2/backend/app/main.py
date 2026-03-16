from fastapi import FastAPI
from app.routers import games, reviews

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI works!"}

app.include_router(games.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")