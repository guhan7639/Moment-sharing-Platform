const Photo = require('../models/Photo');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const processFaceEmbeddings = async (photoPath) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(photoPath));
        
        const response = await axios.post(`${ML_SERVICE_URL}/process-image`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        
        return response.data.faces || [];
    } catch (error) {
        console.error('ML Service Error:', error.message);
        return [];
    }
};

const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        const photoPath = req.file.path;
        const faces = await processFaceEmbeddings(photoPath);

        const photo = await Photo.create({
            eventId: req.params.eventId,
            imageUrl: req.file.path.replace(/\\/g, '/'),
            faces: faces
        });
        res.status(201).json(photo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const uploadBulkPhotos = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }
        
        const photosData = await Promise.all(req.files.map(async (file) => {
            const faces = await processFaceEmbeddings(file.path);
            return {
                eventId: req.params.eventId,
                imageUrl: file.path.replace(/\\/g, '/'),
                faces: faces
            };
        }));

        const photos = await Photo.insertMany(photosData);
        res.status(201).json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getEventPhotos = async (req, res) => {
    try {
        const photos = await Photo.find({ eventId: req.params.eventId });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.photoId);
        if (photo) {
            await photo.deleteOne();
            res.json({ message: 'Photo removed' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadPhoto, uploadBulkPhotos, getEventPhotos, deletePhoto };
