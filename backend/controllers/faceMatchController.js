const Photo = require('../models/Photo');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Euclidean distance between two vectors
const calculateDistance = (vec1, vec2) => {
    return Math.sqrt(
        vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0)
    );
};

const matchSelfie = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No selfie uploaded' });
        }

        const { eventId } = req.params;
        const selfiePath = req.file.path;

        // 1. Get embedding for the selfie
        const formData = new FormData();
        formData.append('file', fs.createReadStream(selfiePath));
        
        const mlRes = await axios.post(`${ML_SERVICE_URL}/process-image`, formData, {
            headers: { ...formData.getHeaders() }
        });

        const selfieFaces = mlRes.data.faces;
        if (!selfieFaces || selfieFaces.length === 0) {
            // Delete temp file
            fs.unlinkSync(selfiePath);
            return res.status(400).json({ message: 'No face detected in selfie' });
        }

        const selfieEmbedding = selfieFaces[0].embedding;

        // 2. Query photos for this event
        const photos = await Photo.find({ eventId });

        // 3. Find matches
        const matchedPhotos = [];
        const threshold = 0.6; // face_recognition default threshold

        photos.forEach(photo => {
            if (photo.faces && photo.faces.length > 0) {
                let bestMatch = { distance: 1.0, faceIndex: -1 };
                
                photo.faces.forEach((face, index) => {
                    const dist = calculateDistance(selfieEmbedding, face.embedding);
                    if (dist < bestMatch.distance) {
                        bestMatch = { distance: dist, faceIndex: index };
                    }
                });

                if (bestMatch.distance <= threshold) {
                    matchedPhotos.push({
                        ...photo.toObject(),
                        matchConfidence: (1 - bestMatch.distance).toFixed(2),
                        matchedFaceIndex: bestMatch.faceIndex
                    });
                }
            }
        });

        // Delete temp selfie
        fs.unlinkSync(selfiePath);

        res.json({
            count: matchedPhotos.length,
            photos: matchedPhotos
        });

    } catch (error) {
        console.error('Face Match Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        let message = 'Server error';
        if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
            message = 'ML Service Unavailable. Please ensure the Python service is running on port 8000.';
        }
        
        res.status(500).json({ message, error: error.message });
    }
};

module.exports = { matchSelfie };
