const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetPassword, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-profile', upload.single('profilePhoto'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ filePath: `/${req.file.path.replace(/\\/g, '/')}` });
});

module.exports = router;
