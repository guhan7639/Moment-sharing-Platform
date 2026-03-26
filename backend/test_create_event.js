const mongoose = require('mongoose');
const User = require('./models/User'); // Load User model first
const Event = require('./models/Event');
require('dotenv').config();

async function testCreateEvent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');

        // Find the admin user to use their ID
        const adminUser = await User.findOne({ username: 'admin_guhan' });

        if (!adminUser) {
            console.log('Admin user not found, cannot test creation.');
            return;
        }

        console.log('Simulating creation with Admin ID:', adminUser._id);

        const newEvent = new Event({
            eventName: "Test Admin Event",
            eventDescription: "This is a test event created directly via script.",
            eventLocation: "Localhost Arena",
            eventDate: "2026-10-10",
            category: "Other",
            status: "approved",
            createdBy: adminUser._id
        });

        const savedEvent = await newEvent.save();
        console.log('✅ Event successfully created and saved!');
        console.log('Saved Event Data:', savedEvent);

    } catch (err) {
        console.error('❌ Error creating event:', err.message);
        if (err.errors) {
            console.error('Validation Errors:', err.errors);
        }
    } finally {
        await mongoose.connection.close();
    }
}

testCreateEvent();
