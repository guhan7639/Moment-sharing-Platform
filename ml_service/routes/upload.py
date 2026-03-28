from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from utils.face_utils import get_face_data_async
from database import get_collection
import logging
import time
import cv2
import numpy as np
import traceback


router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Uploads an image, extracts its face embedding, and stores it in the database.
    Async and standardized.
    """
    start_time = time.time()
    logger.info(f"--- [DEBUG] Request received for /upload. File: {file.filename} ---")
    try:
        content = await file.read()
        if len(content) == 0:
            return {"success": False, "error": "Empty file uploaded"}

        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {"success": False, "error": "Invalid image format"}
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Use the async face detection wrapper
        faces, error = await get_face_data_async(rgb_image)
        
        if error:
            logger.error(f"Detection error during upload: {error}")
            return {"success": False, "error": error}
            
        if not faces:
            return {"success": False, "error": "No face detected"}

        logger.info(f"Faces detected: {len(faces)}")
        
        # Store in MongoDB
        collection = get_collection("face_embeddings")
        document = {
            "image_name": file.filename,
            "embedding": faces[0]["embedding"],
            "timestamp": datetime.now(),
            "model": "VGG-Face"
        }
        
        result = collection.insert_one(document)
        processing_time = time.time() - start_time
        logger.info(f"Successfully stored embedding for {file.filename} in {processing_time:.4f}s")
        
        return {
            "success": True,
            "message": "Image uploaded and face encoded successfully",
            "id": str(result.inserted_id),
            "filename": file.filename,
            "faces_detected": len(faces),
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Error during upload: {str(e)}")
        return {"success": False, "error": "Internal server error", "details": str(e)}

