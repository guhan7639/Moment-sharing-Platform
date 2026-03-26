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
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
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

// Euclidean Distance for face matching
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

// --- 3. The Main Route ---
router.post('/:eventId', upload.single('image'), async (req, res) => {
    const { eventId } = req.params;
    let tempFilePath = null;

    console.log(`\n[FaceMatch] Process started for Event ID: ${eventId}`);
    console.log(`[FaceMatch] Headers:`, req.headers['content-type']);

    try {
        // -- Validation --
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ success: false, error: 'Invalid Event ID format' });
        }

        if (!req.file) {
            console.error('[FaceMatch] Upload Error: req.file is missing!');
            console.log('[FaceMatch] req.body:', req.body);
            return res.status(400).json({ 
                success: false, 
                error: 'No image uploaded. Please ensure you are sending a file with the field name "image".' 
            });
        }

        tempFilePath = req.file.path;
        console.log(`[FaceMatch] Image received: ${req.file.originalname} -> ${tempFilePath}`);

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // -- Call Python Service --
        const pythonUrl = process.env.PYTHON_ML_URL || 'http://localhost:8000/extract-embedding';
        console.log(`[FaceMatch] Calling ML service at: ${pythonUrl}`);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFilePath));

        let pythonRes;
        try {
            pythonRes = await axios.post(pythonUrl, formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000 // 30s timeout for ML processing
            });
        } catch (apiError) {
            const errorMsg = apiError.response?.data?.detail || apiError.message;
            console.error(`[FaceMatch] ML Service Error: ${errorMsg}`);
            
            // Handle specific cases like "No face detected" from Python
            if (errorMsg === "No face detected") {
                return res.status(400).json({ success: false, error: "No face detected in the uploaded selfie. Please try again with a clearer photo." });
            }
            
            return res.status(502).json({ success: false, error: 'Face recognition service error: ' + errorMsg });
        }

        const targetEmbedding = pythonRes.data.embedding;

        // Validate Embedding from Python
        if (!Array.isArray(targetEmbedding) || targetEmbedding.length === 0) {
            console.error('[FaceMatch] Invalid embedding format received');
            return res.status(500).json({ success: false, error: 'Failed to process face embedding.' });
        }
        
        console.log(`[FaceMatch] Target embedding received (Size: ${targetEmbedding.length})`);

        // -- Database Matching --
        // FIX: Schema uses eventId, not event
        const photos = await Photo.find({ eventId: eventId });
        console.log(`[FaceMatch] Searching through ${photos.length} photos in this event...`);

        const matches = [];
        const MATCH_THRESHOLD = 0.6; // Adjust based on model (VGG-Face Euclidean usually is around 0.5-0.7)

        photos.forEach(photo => {
            if (photo.faces && Array.isArray(photo.faces)) {
                photo.faces.forEach(face => {
                    const dbEmbedding = face.embedding;

                    if (Array.isArray(dbEmbedding) && dbEmbedding.length === targetEmbedding.length) {
                        const distance = getEuclideanDistance(targetEmbedding, dbEmbedding);

                        if (distance < MATCH_THRESHOLD) {
                            matches.push({
                                photoId: photo._id,
                                // FIX: Schema uses imageUrl, not url
                                imageUrl: photo.imageUrl,
                                distance: parseFloat(distance.toFixed(4)),
                                uploadedAt: photo.uploadedAt
                            });
                        }
                    }
                });
            }
        });

        // Group by photo and keep best match per photo
        const uniqueMatches = [];
        const seenPhotos = new Set();
        
        // Sort by distance first
        matches.sort((a, b) => a.distance - b.distance);
        
        for (const m of matches) {
            if (!seenPhotos.has(m.photoId.toString())) {
                uniqueMatches.push(m);
                seenPhotos.add(m.photoId.toString());
            }
        }

        console.log(`[FaceMatch] Process complete. Found ${uniqueMatches.length} matching photos.`);
        res.status(200).json({ 
            success: true, 
            count: uniqueMatches.length, 
            matches: uniqueMatches 
        });

    } catch (err) {
        console.error('[FaceMatch] UNEXPECTED CRITICAL ERROR:', err);
        res.status(500).json({ success: false, error: 'Internal server error during face matching.' });
    } finally {
        // -- Cleanup --
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error('[FaceMatch] Temp file cleanup failed:', unlinkErr);
            });
        }
    }
});

module.exports = router;