from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.face_utils import get_face_data, compare_embeddings
from database import get_collection
import logging
import os
import shutil
import tempfile
import cv2
import numpy as np
from deepface import DeepFace
import json
import traceback

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/face-match")
async def face_match(file: UploadFile = File(...)):
    """
    Debugged Face Match endpoint with detailed logging and robust image processing.
    """
    logger.info("--- [DEBUG] Request received for /face-match ---")
    
    try:
        # 1. Validate file input
        logger.info(f"File received: {file.filename}")
        content = await file.read()
        file_size = len(content)
        logger.info(f"File size: {file_size} bytes")

        if file_size == 0:
            logger.error("Error: Empty file uploaded")
            return {"success": False, "error": "Empty file uploaded"}

        # 2. Image decoding using cv2
        logger.info("Attempting to decode image using cv2.imdecode...")
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            logger.error("Error: Image decoding failed (cv2.imdecode returned None)")
            return {"success": False, "error": "Invalid image format or corrupt file"}
        
        logger.info("Image decoded successfully")

        # 3. Convert BGR to RGB
        logger.info("Converting BGR to RGB...")
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # 4. Generate Face Embedding using DeepFace
        logger.info("Generating face encoding using DeepFace (VGG-Face)...")
        try:
            # Using DeepFace.represent to get embeddings
            results = DeepFace.represent(
                img_path=rgb_image, 
                model_name="VGG-Face",
                enforce_detection=True,
                detector_backend="opencv"
            )
            
            if not results or len(results) == 0:
                logger.error("Error: No face detected")
                return {"success": False, "error": "No face detected"}

            faces_count = len(results)
            logger.info(f"Faces detected: {faces_count}")
            logger.info("Encoding success")
            target_embedding = results[0]["embedding"]
            
        except ValueError as ve:
            if "Face could not be detected" in str(ve):
                logger.error("Error: No face detected by DeepFace")
                return {"success": False, "error": "No face detected in the image."}
            raise ve

        # 5. Database Match (1-vs-many)
        logger.info("Connecting to database for matching...")
        collection = get_collection("face_embeddings")
        cursor = collection.find({}, {"image_name": 1, "embedding": 1})
        
        stored_data = list(cursor)
        if not stored_data:
            logger.warning("No encodings found in database")
            return {"success": True, "message": "No faces in database to compare", "matches": []}
            
        logger.info(f"Checking against {len(stored_data)} stored faces...")
        known_embeddings = [item["embedding"] for item in stored_data]
        metadata = [{"image_name": item["image_name"], "id": str(item["_id"])} for item in stored_data]
        
        # Using a threshold of 0.4 for VGG-Face (Cosine Distance)
        match_results = compare_embeddings(target_embedding, known_embeddings, threshold=0.4)
        
        found_matches = []
        for match in match_results:
            idx = match["index"]
            found_matches.append({
                "image_name": metadata[idx]["image_name"],
                "similarity_score": match["similarity"],
                "distance": match["distance"]
            })
            
        logger.info(f"Found {len(found_matches)} matches")
        
        # User feedback: "if true print that photo or display the all photos in that event"
        # We return the matches including image_name so the frontend can display them.
        return {
            "success": True,
            "matches_found": len(found_matches),
            "matches": found_matches
        }

    except Exception as e:
        logger.error(f"CRITICAL ERROR in /face-match: {str(e)}")
        logger.error(traceback.format_exc())
        return {"success": False, "error": f"Internal server error: {str(e)}"}

@router.post("/extract-embedding")
async def extract_embedding(file: UploadFile = File(...)):
    """
    Extracts a single face embedding from an uploaded image.
    Used by the Node.js backend for face matching.
    """
    logger.info(f"--- [DEBUG] Request received for /extract-embedding. File: {file.filename} ---")
    try:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            logger.error("Error: Image decoding failed")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        logger.info("Generating embedding using DeepFace (VGG-Face)...")
        results = DeepFace.represent(
            img_path=rgb_image, 
            model_name="VGG-Face",
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        if not results:
            logger.warning("No face detected in /extract-embedding")
            raise HTTPException(status_code=400, detail="No face detected")
            
        logger.info(f"Successfully extracted embedding. Faces: {len(results)}")
        # Following existing logic: return the first embedding
        return {
            "success": True, 
            "embedding": results[0]["embedding"], 
            "faces_detected": len(results)
        }
    except ValueError as ve:
        if "Face could not be detected" in str(ve):
            logger.warning("No face detected by DeepFace")
            raise HTTPException(status_code=400, detail="No face detected")
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /extract-embedding: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    Processes image and returns multiple face detections with bounding boxes.
    Used during photo upload to store face data.
    """
    logger.info(f"--- [DEBUG] Request received for /process-image. File: {file.filename} ---")
    try:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            logger.error("Error: Image decoding failed")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        logger.info("Processing faces using DeepFace (VGG-Face)...")
        results = DeepFace.represent(
            img_path=rgb_image, 
            model_name="VGG-Face",
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        faces = []
        for res in results:
            area = res["facial_area"]
            faces.append({
                "embedding": res["embedding"],
                "box": {
                    "top": area["y"],
                    "left": area["x"],
                    "right": area["x"] + area["w"],
                    "bottom": area["y"] + area["h"]
                }
            })
            
        logger.info(f"Processed {len(faces)} faces")
        return {"faces": faces}
    except ValueError as ve:
        if "Face could not be detected" in str(ve):
            logger.warning("No face detected by DeepFace")
            return {"faces": []}
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /process-image: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_face(file: UploadFile = File(...)):
    """
    Search endpoint that finds matches against all stored face embeddings.
    """
    logger.info(f"--- [DEBUG] Request received for /search. File: {file.filename} ---")
    try:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            logger.error("Error: Image decoding failed")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        logger.info("Generating embedding for search...")
        results = DeepFace.represent(
            img_path=rgb_image, 
            model_name="VGG-Face",
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        if not results:
            logger.warning("No face detected in /search")
            raise HTTPException(status_code=400, detail="No face detected")
            
        target_embedding = results[0]["embedding"]
        
        logger.info("Connecting to database for search...")
        collection = get_collection("face_embeddings")
        cursor = collection.find({}, {"image_name": 1, "embedding": 1})
        stored_data = list(cursor)
        
        if not stored_data:
            return {"message": "No faces in database", "matches": []}
            
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
            
        logger.info(f"Found {len(found_matches)} matches in /search")
        return {"matches_found": len(found_matches), "matches": found_matches}
        
    except ValueError as ve:
        if "Face could not be detected" in str(ve):
            logger.warning("No face detected by DeepFace")
            raise HTTPException(status_code=400, detail="No face detected")
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /search: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
