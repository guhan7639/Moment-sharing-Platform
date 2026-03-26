from deepface import DeepFace
import numpy as np
import cv2
import os

def get_face_data(image_path):
    """
    Extracts face embeddings and bounding boxes using DeepFace.represent().
    Returns a list of face objects and an error message if any.
    """
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="VGG-Face",
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        if not results:
            return None, "No face detected"
            
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
            
        return faces, None
        
    except ValueError as ve:
        if "Face could not be detected" in str(ve):
            return None, "No face detected"
        return None, str(ve)
    except Exception as e:
        return None, f"DeepFace error: {str(e)}"

def get_face_embeddings(image_path):
    """
    Extracts face embeddings only.
    """
    faces, error = get_face_data(image_path)
    if error:
        return None, error
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
