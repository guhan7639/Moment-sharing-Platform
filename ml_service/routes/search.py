from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.face_utils import get_face_data_async, compare_embeddings
from database import get_collection
import logging
import time
import cv2
import numpy as np
import traceback

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/face-match")
async def face_match(file: UploadFile = File(...)):
    """
    Standardized Face Match endpoint with async processing and consistent responses.
    """
    start_time = time.time()
    logger.info(f"--- [DEBUG] Request received for /face-match. File: {file.filename} ---")
    
    try:
        content = await file.read()
        if len(content) == 0:
            return {"success": False, "error": "Empty file uploaded"}

        # Use temp file for DeepFace compatibility if needed, but we use numpy array
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {"success": False, "error": "Invalid image format"}
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Call the async face detection wrapper
        faces, error = await get_face_data_async(rgb_image)
        
        if error:
            logger.warning(f"Face detection issue: {error}")
            return {"success": False, "error": error}

        if not faces:
            return {"success": False, "error": "No face detected"}

        target_embedding = faces[0]["embedding"]
        
        # Database Match
        collection = get_collection("face_embeddings")
        cursor = collection.find({}, {"image_name": 1, "embedding": 1})
        stored_data = list(cursor)
        
        if not stored_data:
            return {"success": True, "message": "No faces in database", "matches": []}
            
        known_embeddings = [item["embedding"] for item in stored_data]
        metadata = [{"image_name": item["image_name"], "id": str(item["_id"])} for item in stored_data]
        
        match_results = compare_embeddings(target_embedding, known_embeddings, threshold=0.4)
        
        found_matches = []
        for match in match_results:
            idx = match["index"]
            found_matches.append({
                "image_name": metadata[idx]["image_name"],
                "similarity_score": match["similarity"],
                "distance": match["distance"]
            })
            
        processing_time = time.time() - start_time
        logger.info(f"Matched success in {processing_time:.4f}s. Found {len(found_matches)} matches")
        
        return {
            "success": True,
            "processing_time": processing_time,
            "matches": found_matches
        }

    except Exception as e:
        logger.error(f"Error in /face-match: {str(e)}")
        return {"success": False, "error": "Internal server error", "details": str(e)}

@router.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    """
    Extracts a single face embedding from an uploaded image.
    Async and standardized.
    """
    start_time = time.time()
    logger.info(f"--- [DEBUG] Request received for /extract-embedding. File: {file.filename} ---")
    try:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {"success": False, "error": "Invalid image format"}
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        faces, error = await get_face_data_async(rgb_image)
        
        if error:
            return {"success": False, "error": error}
            
        if not faces:
            return {"success": False, "error": "No face detected"}

        processing_time = time.time() - start_time
        logger.info(f"Embedding extracted in {processing_time:.4f}s")
        return {
            "success": True, 
            "embedding": faces[0]["embedding"], 
            "faces_detected": len(faces),
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"Error in /extract-embedding: {str(e)}")
        return {"success": False, "error": "Internal server error", "details": str(e)}

@router.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    Processes image and returns multiple face detections with bounding boxes.
    """
    start_time = time.time()
    logger.info(f"--- [DEBUG] Request received for /process-image. File: {file.filename} ---")
    try:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {"success": False, "error": "Invalid image format"}
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        faces, error = await get_face_data_async(rgb_image)
        
        if error:
            return {"success": False, "error": error}
            
        processing_time = time.time() - start_time
        logger.info(f"Processed {len(faces)} faces in {processing_time:.4f}s")
        return {
            "success": True,
            "faces": faces,
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"Error in /process-image: {str(e)}")
        return {"success": False, "error": "Internal server error", "details": str(e)}

@router.post("/search")
async def search_face(file: UploadFile = File(...)):
    """
    Search endpoint that finds matches against all stored face embeddings.
    """
    start_time = time.time()
    logger.info(f"--- [DEBUG] Request received for /search. File: {file.filename} ---")
    try:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {"success": False, "error": "Invalid image format"}
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        faces, error = await get_face_data_async(rgb_image)
        
        if error:
            return {"success": False, "error": error}
            
        if not faces:
            return {"success": False, "error": "No face detected"}
            
        target_embedding = faces[0]["embedding"]
        
        collection = get_collection("face_embeddings")
        cursor = collection.find({}, {"image_name": 1, "embedding": 1})
        stored_data = list(cursor)
        
        if not stored_data:
            return {"success": True, "message": "No faces in database", "matches": []}
            
        known_embeddings = [item["embedding"] for item in stored_data]
        metadata = [{"image_name": item["image_name"], "id": str(item["_id"])} for item in stored_data]
        
        match_results = compare_embeddings(target_embedding, known_embeddings, threshold=0.4)
        found_matches = []
        for match in match_results:
            idx = match["index"]
            found_matches.append({
                "image_name": metadata[idx]["image_name"], 
                "similarity_score": match["similarity"], 
                "distance": match["distance"]
            })
            
        processing_time = time.time() - start_time
        logger.info(f"Found {len(found_matches)} matches in {processing_time:.4f}s")
        return {
            "success": True,
            "matches_found": len(found_matches), 
            "matches": found_matches,
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Error in /search: {str(e)}")
        return {"success": False, "error": "Internal server error", "details": str(e)}

