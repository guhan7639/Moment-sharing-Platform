import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.search import router as search_router
from deepface import DeepFace
import logging
import time

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

@app.on_event("startup")
async def startup_event():
    logger.info("Preloading DeepFace model (VGG-Face)...")
    try:
        # Preload the model to avoid delay on first request
        DeepFace.build_model("VGG-Face")
        logger.info("Model preloaded successfully.")
    except Exception as e:
        logger.error(f"Failed to preload model: {str(e)}")

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(f"Request {request.method} {request.url.path} processed in {process_time:.4f}s")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error", "details": str(exc)}
    )


@app.get("/")
async def root():
    return {"message": "Face Recognition ML Service (DeepFace) is running"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    logger.info(f"Starting ML Service (DeepFace) on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=debug)
