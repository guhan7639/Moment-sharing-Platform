import requests
import os

def test_face_match():
    url = "http://localhost:8000/face-match"
    image_path = "img1.jpg"
    
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return

    print(f"Testing /face-match with {image_path}...")
    try:
        with open(image_path, "rb") as f:
            files = {"file": (image_path, f, "image/jpeg")}
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        import json
        print(json.dumps(response.json(), indent=4))
        
    except Exception as e:
        print(f"Test failed: {str(e)}")

if __name__ == "__main__":
    # Wait a bit for server to be fully ready if needed
    test_face_match()
