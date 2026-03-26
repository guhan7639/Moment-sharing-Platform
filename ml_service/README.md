# Face Recognition ML Service

A FastAPI-based backend service for face encoding and matching using the `face_recognition` library and MongoDB.

## Features
- **Upload API**: Detects a face in an image, generates a 128-d embedding, and stores it in MongoDB.
- **Match API**: Compares an uploaded image with all stored embeddings in the database and returns the top matches with similarity scores.
- **Optimized**: Uses NumPy for fast Euclidean distance calculations.
- **Robust**: Handles common errors like "No face detected" or "Multiple faces detected".

## Prerequisites
- Python 3.8+
- MongoDB (Running locally or via URI)
- C++ Compiler (Required for `dlib`, which is a dependency of `face_recognition`)
  - **Windows**: Install "Desktop development with C++" via Visual Studio Installer.
  - **Linux**: `sudo apt install build-essential cmake libopenblas-dev liblapack-dev`

## Installation

1.  **Navigate to the service directory**:
    ```bash
    cd ml_service
    ```

2.  **Create a virtual environment** (Recommended):
    ```bash
    python -m venv venv
    venv\Scripts\activate  # Windows
    source venv/bin/activate  # Linux/Mac
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables**:
    Update the `.env` file with your MongoDB URI if different from the default.
    ```env
    MONGODB_URI=mongodb://localhost:27017/event_db
    PORT=8000
    DEBUG=True
    ```

## Running the Service

Start the FastAPI server:
```bash
python main.py
```
Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

### 1. Upload Face
- **Endpoint**: `POST /upload`
- **Body**: `file` (multipart/form-data)
- **Description**: Extracts face encoding and stores it in MongoDB.

### 2. Match Face
- **Endpoint**: `POST /match`
- **Body**: `file` (multipart/form-data)
- **Description**: Compares the face in the uploaded image against all faces in the database.

### 3. Health Check
- **Endpoint**: `GET /`
- **Description**: Returns server status.

## Directory Structure
```text
ml_service/
├── main.py          # Entry point
├── database.py      # MongoDB connection
├── .env             # Configuration
├── requirements.txt # Dependencies
├── models/          # Data models
├── routes/          # API endpoints (upload, match)
└── utils/           # Face processing logic (face_recognition, numpy)
```
