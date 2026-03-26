const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    imageUrl: { type: String, required: true },
    faces: [{
        box: {
            top: Number,
            right: Number,
            bottom: Number,
            left: Number
        },
        embedding: [Number]
    }],
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
