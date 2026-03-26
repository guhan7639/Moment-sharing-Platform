const express = require('express');
const router = express.Router();
const { uploadPhoto, uploadBulkPhotos, getEventPhotos, deletePhoto } = require('../controllers/photoController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/photos/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.post('/upload/:eventId', protect, upload.single('photo'), uploadPhoto);
router.post('/upload-bulk/:eventId', protect, upload.array('photos', 50), uploadBulkPhotos);
router.get('/event/:eventId', getEventPhotos);
router.delete('/:photoId', protect, admin, deletePhoto);

module.exports = router;
