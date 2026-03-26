from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from utils.face_utils import get_face_embeddings
from database import get_collection
import logging
import os
import shutil
import tempfile
import cv2
import numpy as np
from deepface import DeepFace
import traceback

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Uploads an image, extracts its face embedding, and stores it in the database.
    """
    logger.info(f"--- [DEBUG] Request received for /upload. File: {file.filename} ---")
    try:
        # 1. Read file and decode
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            logger.error("Error: Image decoding failed")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # 2. Get face embeddings using DeepFace
        logger.info("Generating face encoding for upload using DeepFace (VGG-Face)...")
        results = DeepFace.represent(
            img_path=rgb_image, 
            model_name="VGG-Face",
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        if not results:
            logger.error("No face detected during upload")
            raise HTTPException(status_code=400, detail="No face detected")
            
        logger.info(f"Faces detected: {len(results)}")
        if len(results) > 1:
            logger.warning(f"Multiple faces detected in {file.filename}. Using the first one.")

        # 3. Store in MongoDB
        collection = get_collection("face_embeddings")
        document = {
            "image_name": file.filename,
            "embedding": results[0]["embedding"], # Using the first embedding found
            "timestamp": datetime.now(),
            "model": "VGG-Face"
        }
        
        result = collection.insert_one(document)
        logger.info(f"Successfully stored embedding for {file.filename}")
        
        return {
            "message": "Image uploaded and face encoded successfully using DeepFace",
            "id": str(result.inserted_id),
            "filename": file.filename,
            "faces_detected": len(results)
        }
        
    except ValueError as ve:
        if "Face could not be detected" in str(ve):
            logger.error("Face could not be detected during upload")
            raise HTTPException(status_code=400, detail="No face detected in the image.")
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        logger.error(f"Error during upload: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database or system error: {str(e)}")
