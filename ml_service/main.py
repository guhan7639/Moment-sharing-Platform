import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.search import router as search_router
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("ml_service.log")
    ]
)
logger = logging.getLogger("ml_service")

# Initialize FastAPI app
app = FastAPI(
    title="Face Recognition ML Service (DeepFace)",
    description="Python backend for face encoding and search using DeepFace",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload_router, tags=["Upload"])
app.include_router(search_router, tags=["Search"])

@app.get("/")
async def root():
    return {"message": "Face Recognition ML Service (DeepFace) is running"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    logger.info(f"Starting ML Service (DeepFace) on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=debug)
