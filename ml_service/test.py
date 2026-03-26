from deepface import DeepFace
import json

def verify_faces(img1_path, img2_path):
    print(f"Comparing {img1_path} and {img2_path}...")
    try:
        # Perform face verification
        result = DeepFace.verify(img1_path, img2_path)
        
        # Format the output as requested
        output = {
            "verified": result["verified"],
            "distance": result["distance"]
        }
        
        print(json.dumps(output, indent=4))
        return output
    except Exception as e:
        print(f"Error during verification: {str(e)}")
        return None

if __name__ == "__main__":
    img1 = "img1.jpg"
    img2 = "img2.jpg"
    verify_faces(img1, img2)
