import os
from azure.cosmos import CosmosClient
from dotenv import load_dotenv

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE = os.getenv("COSMOS_DATABASE", "game-tracker-db")

if not COSMOS_ENDPOINT:
    raise RuntimeError("COSMOS_ENDPOINT is missing from environment variables.")

if not COSMOS_KEY:
    raise RuntimeError("COSMOS_KEY is missing from environment variables.")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)

games_container = database.get_container_client("games")
reviews_container = database.get_container_client("reviews")
sessions_container = database.get_container_client("sessions")
analytics_events_container = database.get_container_client("analytics_events")