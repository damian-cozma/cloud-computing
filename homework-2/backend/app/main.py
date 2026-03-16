from fastapi import FastAPI
from app.routers import games

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI works!"}

app.include_router(games.router, prefix="/api")