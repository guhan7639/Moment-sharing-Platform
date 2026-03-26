const User = require('../models/User');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateQRCode = async (userId) => {
    // Generate a QR code linking to the user's gallery
    const galleryUrl = `http://localhost:5173/gallery/user/${userId}`;
    return await QRCode.toDataURL(galleryUrl);
};

const registerUser = async (req, res) => {
    const { name, username, email, password, role, phone, experience, profilePhoto, portfolioPhotos } = req.body;
    try {
        const query = { $or: [{ username }] };
        if (email && email.trim() !== '') {
            query.$or.push({ email });
        }
        
        const userExists = await User.findOne(query);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let userRole = role;
        // Ensure valid role
        if (!['admin', 'user', 'host', 'photographer'].includes(role)) {
            userRole = 'user';
        }

        const userData = { name, username, email, password, role: userRole };
        if (userRole === 'photographer') {
            userData.phone = phone;
            userData.experience = experience;
            userData.profilePhoto = profilePhoto;
            userData.portfolioPhotos = portfolioPhotos;
        }

        const user = await User.create(userData);

        if (user) {
            // Generate QR Code after user creation
            const qrCode = await generateQRCode(user._id);
            user.qrCode = qrCode;
            await user.save();

            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                qrCode: user.qrCode,
                token: signToken(user._id)
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.comparePassword(password))) {
            // Generate QR code if it doesn't exist
            if (!user.qrCode) {
                user.qrCode = await generateQRCode(user._id);
                await user.save();
            }

            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                qrCode: user.qrCode,
                phone: user.phone,
                profilePhoto: user.profilePhoto,
                experience: user.experience,
                portfolioPhotos: user.portfolioPhotos,
                rating: user.rating,
                createdAt: user.createdAt,
                token: signToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { username, email, newPassword } = req.body;
    try {
        const user = await User.findOne({ username, email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with matching username and email' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('Password Reset Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    const { name, email, bio, profilePhoto } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.bio = bio || user.bio;
            if (profilePhoto) {
                user.profilePhoto = profilePhoto;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                qrCode: updatedUser.qrCode,
                phone: updatedUser.phone,
                profilePhoto: updatedUser.profilePhoto,
                experience: updatedUser.experience,
                bio: updatedUser.bio,
                portfolioPhotos: updatedUser.portfolioPhotos,
                rating: updatedUser.rating,
                createdAt: updatedUser.createdAt,
                token: signToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, resetPassword, updateUserProfile };
