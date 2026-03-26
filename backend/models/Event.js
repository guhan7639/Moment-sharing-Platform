const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventLocation: { type: String, required: true },
    eventDate: { type: String, required: true },
    category: { type: String, required: true, enum: ['Wedding', 'Birthday', 'Corporate', 'College', 'Other'] },
    bannerImage: { type: String }, // Renamed from banner
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Photographer management fields
    photographersApplied: [{
        photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Booked', 'Not Selected'], default: 'Pending' }
    }],
    bookedPhotographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
