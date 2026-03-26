const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent, updateEventStatus, getUserEvents, getApprovedEvents, applyForEvent, selectPhotographer, rejectPhotographer } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

const uploadMiddleware = (req, res, next) => {
    const uploader = upload.single('bannerImage');
    uploader(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Multer Error:", err);
            return res.status(400).json({ message: "Multer Error", error: err });
        } else if (err) {
            console.error("Unknown Upload Error:", err);
            return res.status(500).json({ message: "Unknown Upload Error", error: err });
        }
        console.log("Multer parsed file:", req.file);
        console.log("Multer parsed body:", req.body);
        next();
    });
};

router.route('/')
    .get(protect, getEvents)
    .post(protect, uploadMiddleware, createEvent); // Users can create events, admin approval handled via status

// Route to get events created by the logged-in user
router.route('/my-events')
    .get(protect, getUserEvents);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, upload.single('bannerImage'), updateEvent)
    .delete(protect, deleteEvent);

router.route('/:id/status')
    .patch(protect, admin, updateEventStatus); // Only admins can approve/reject

// Photographer routes
router.route('/photographer/approved-events')
    .get(protect, getApprovedEvents);

router.route('/:id/apply')
    .post(protect, applyForEvent);

// Host routes for managing photographers
router.route('/:id/select-photographer')
    .patch(protect, selectPhotographer);

router.route('/:id/reject-photographer')
    .patch(protect, rejectPhotographer);

module.exports = router;
