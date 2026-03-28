import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/event_db")

# Global client for reusing connections
client = MongoClient(MONGO_URI)

def get_database():
    """
    Returns a connection to the MongoDB database.
    """
    # Using 'get_database()' returns the database defined in MONGO_URI string or default
    db = client.get_database()
    return db

def get_collection(collection_name):
    """
    Returns a specific collection from the database.
    """
    db = get_database()
    return db[collection_name]

