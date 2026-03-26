from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import cv2
import os

app = Flask(__name__)

@app.route('/extract-embedding', methods=['POST'])
def extract_embedding():
    # 1. Validate Input
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 2. Process Image
        # Read file into numpy array
        file_bytes = np.frombuffer(file.read(), np.uint8)
        # Decode image using OpenCV
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Failed to decode image file'}), 400

        # Convert BGR (OpenCV default) to RGB (face_recognition requirement)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # 3. Detect Face & Extract Embedding
        # 'hog' is faster/CPU-friendly, 'cnn' is more accurate but requires GPU/CUDA
        boxes = face_recognition.face_locations(rgb_img, model='hog')

        if not boxes:
            return jsonify({'error': 'No face detected in the image'}), 400

        # Get encodings for the detected faces
        # We take the first face found (index 0)
        encodings = face_recognition.face_encodings(rgb_img, known_face_locations=boxes)

        if not encodings:
            return jsonify({'error': 'Could not extract features from face'}), 400

        # Return the embedding as a list (NumPy arrays are not JSON serializable)
        return jsonify({'embedding': encodings[0].tolist()})

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 8000 to match Node.js configuration
    app.run(host='0.0.0.0', port=8000)