const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Photo = require('../models/Photo');
const Event = require('../models/Event');

// --- 1. Proper Multer Setup ---
const uploadDir = path.join(__dirname, '../uploads/temp');
// Ensure temp directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Safe filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'selfie-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// --- 2. Helper Functions ---

// Euclidean Distance for face matching (Standard for FaceNet/dlib)
// Returns a value >= 0. Lower is better. 0.6 is a common strict threshold.
function getEuclideanDistance(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
        return Infinity;
    }
    let sum = 0;
    for (let i = 0; i < embedding1.length; i++) {
        sum += Math.pow(embedding1[i] - embedding2[i], 2);
    }
    return Math.sqrt(sum);
}

// --- 3. The Route ---
// NOTE: Ensure your frontend sends the file with the key 'image'
router.post('/:eventId', upload.single('image'), async (req, res) => {
    const { eventId } = req.params;
    let tempFilePath = null;

    console.log(`[FaceMatch] Process started for Event ID: ${eventId}`);

    try {
        // -- Validation --
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ success: false, error: 'Invalid Event ID format' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded. Ensure form-data key is "image".' });
        }
        tempFilePath = req.file.path;
        console.log(`[FaceMatch] Selfie uploaded to: ${tempFilePath}`);

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // -- Call Python Service --
        // Assumes Python service is running at localhost:8000 and has /extract-embedding endpoint
        const pythonUrl = process.env.PYTHON_ML_URL || 'http://localhost:8000/extract-embedding';
        console.log(`[FaceMatch] Sending to Python service: ${pythonUrl}`);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFilePath));

        let pythonRes;
        try {
            pythonRes = await axios.post(pythonUrl, formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000 // Increased timeout for heavy ML tasks if needed, but 30s is safe
            });

            // Check if Python service returned a logical error (success: false)
            if (pythonRes.data && pythonRes.data.success === false) {
                console.warn(`[FaceMatch] Python Service Error: ${pythonRes.data.error}`);
                return res.status(400).json({ 
                    success: false, 
                    error: pythonRes.data.error || 'Face recognition failed' 
                });
            }
        } catch (apiError) {
            console.error(`[FaceMatch] API Connection Error: ${apiError.message}`);
            const status = apiError.response?.status || 500;
            const message = apiError.response?.data?.error || apiError.message || 'Face recognition service error';
            return res.status(status).json({ success: false, error: message });
        }

        const targetEmbedding = pythonRes.data.embedding;

        // Validate Embedding from Python
        if (!Array.isArray(targetEmbedding) || targetEmbedding.length === 0) {
            console.error('[FaceMatch] Invalid embedding received from Python:', pythonRes.data);
            return res.status(400).json({ success: false, error: 'Could not extract face embedding from uploaded image.' });
        }

        console.log(`[FaceMatch] Target embedding extracted (Length: ${targetEmbedding.length})`);

        // -- Database Matching --
        const photos = await Photo.find({ eventId });
        console.log(`[FaceMatch] Checking against ${photos.length} photos in event`);

        const matches = [];
        const MATCH_THRESHOLD = 0.5; // Adjust based on your ML model (0.5 - 0.6 is typical)

        photos.forEach(photo => {
            if (photo.faces && Array.isArray(photo.faces)) {
                photo.faces.forEach(face => {
                    // MongoDB Fix: Ensure embedding is treated as array 
                    // (Handles cases where "tolist" issue might have stored objects/strings)
                    const dbEmbedding = face.embedding;

                    if (Array.isArray(dbEmbedding) && dbEmbedding.length > 0) {
                        const distance = getEuclideanDistance(targetEmbedding, dbEmbedding);

                        if (distance < MATCH_THRESHOLD) {
                            matches.push({
                                _id: photo._id,
                                imageUrl: photo.imageUrl,
                                distance: distance,
                                similarity_score: Math.max(0, (1 - distance) * 100),
                                uploadedAt: photo.uploadedAt
                            });
                        }
                    }
                });
            }
        });

        // Sort matches by similarity (lowest distance first)
        matches.sort((a, b) => a.distance - b.distance);

        console.log(`[FaceMatch] Found ${matches.length} matches`);
        res.status(200).json({ success: true, count: matches.length, matches });

    } catch (err) {
        console.error('[FaceMatch] CRITICAL ERROR:', err.message);
        // Return 500 but with a clear message
        res.status(500).json({ success: false, error: err.message });
    } finally {
        // -- Cleanup --
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error('[FaceMatch] Failed to delete temp file:', err);
            });
        }
    }
});

module.exports = router;
