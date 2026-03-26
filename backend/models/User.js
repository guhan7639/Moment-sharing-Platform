const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user', 'host', 'photographer'], default: 'user' },
    qrCode: { type: String }, // Stores QR code data URL
    bio: { type: String },
    // Photographer specific fields
    phone: { type: String },
    profilePhoto: { type: String },
    experience: { type: String },
    portfolioPhotos: [{ type: String }], // Array of image URLs
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (this.email === '') {
        this.email = undefined;
    }
    if (this.username) {
        this.username = this.username.toLowerCase();
    }
    
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
