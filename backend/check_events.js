const mongoose = require('mongoose');
require('./models/User'); // Load User model first so Event can reference it
const Event = require('./models/Event');
require('dotenv').config();

async function checkEvents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');
        const count = await Event.countDocuments();
        console.log(`\n=== Total Events in DB: ${count} ===\n`);

        const events = await Event.find({}).populate('createdBy', 'username role');

        events.forEach((event, index) => {
            console.log(`[Event ${index + 1}]`);
            console.log(`- ID: ${event._id}`);
            console.log(`- Name: ${event.eventName}`);
            console.log(`- Status: ${event.status}`);
            console.log(`- Category: ${event.category}`);
            console.log(`- Created By: ${event.createdBy ? `${event.createdBy.username} (Role: ${event.createdBy.role})` : 'Unknown/Deleted User'}`);
            console.log('------------------------------');
        });

    } catch (err) {
        console.error('Error fetching events:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

checkEvents();
