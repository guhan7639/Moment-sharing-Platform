import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/event_db")

def get_database():
    """
    Returns a connection to the MongoDB database.
    """
    client = MongoClient(MONGO_URI)
    # Using 'event_db' as requested or as found in .env
    db = client.get_database()
    return db

def get_collection(collection_name):
    """
    Returns a specific collection from the database.
    """
    db = get_database()
    return db[collection_name]
