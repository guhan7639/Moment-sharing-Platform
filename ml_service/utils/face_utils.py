import asyncio
from concurrent.futures import ThreadPoolExecutor
from deepface import DeepFace
import numpy as np
import cv2
import os

# Global executor for running DeepFace in a separate thread
executor = ThreadPoolExecutor(max_workers=4)

def get_face_data(image_path):
    """
    Extracts face embeddings and bounding boxes using DeepFace.represent().
    This is a synchronous function that can be called via an executor.
    """
    try:
        # Default to VGG-Face as requested
        results = DeepFace.represent(
            img_path=image_path,
            model_name="VGG-Face",
            enforce_detection=False, # Relaxed detection to prevent crashes
            detector_backend="opencv"
        )
        
        if not results:
            return None, "No face detected"
            
        faces = []
        for res in results:
            # DeepFace returns a list of results even if only one face is detected
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
            
        return faces, None
        
    except Exception as e:
        return None, f"DeepFace error: {str(e)}"

async def get_face_data_async(image_path):
    """
    Async wrapper for get_face_data using a thread pool executor.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, get_face_data, image_path)


def get_face_embeddings(image_path):
    """
    Extracts face embeddings only.
    """
    faces, error = get_face_data(image_path)
    if error:
        return None, error
    if faces is None:
        return [], None
    return [f["embedding"] for f in faces], None


def compare_embeddings(target_embedding, stored_embeddings, threshold=0.4):
    """
    Compares a target embedding against a list of stored embeddings.
    """
    if not stored_embeddings:
        return []
        
    target_np = np.array(target_embedding)
    stored_np = np.array(stored_embeddings)
    
    results = []
    for i, stored in enumerate(stored_np):
        dot_product = np.dot(target_np, stored)
        norm_target = np.linalg.norm(target_np)
        norm_stored = np.linalg.norm(stored)
        
        cosine_similarity = dot_product / (norm_target * norm_stored)
        cosine_distance = 1 - cosine_similarity
        
        if cosine_distance <= threshold:
            similarity = round(cosine_similarity * 100, 2)
            results.append({
                "index": i,
                "distance": float(cosine_distance),
                "similarity": similarity
            })
            
    results.sort(key=lambda x: x["distance"])
    return results
