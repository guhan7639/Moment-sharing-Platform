const mongoose = require('mongoose');
require('./backend/models/User');
const Event = require('./backend/models/Event');
require('dotenv').config({ path: 'backend/.env' });

async function testVisibility() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');

        // Find user Hasan
        const User = mongoose.model('User');
        const hasan = await User.findOne({ username: 'hasan' });

        if (!hasan) {
            console.log("User 'hasan' not found.");
            // List all users to see who exists
            const allUsers = await User.find({});
            console.log("Existing users:", allUsers.map(u => u.username));
            return;
        }

        console.log(`Testing visibility for user: ${hasan.username} (ID: ${hasan._id}, Role: ${hasan.role})`);

        // Simulate getEvents logic: find({ createdBy: userId })
        const events = await Event.find({ createdBy: hasan._id }).populate('createdBy', 'username');
        console.log(`Logic 'Event.find({ createdBy: hasan._id })' returned ${events.length} events.`);

        // Find all events to see what exists
        const totalEvents = await Event.find({}).populate('createdBy', 'username');
        console.log(`Total events in DB: ${totalEvents.length}`);

        if (events.length === totalEvents.length && totalEvents.length > 0 && totalEvents.some(e => e.createdBy._id.toString() !== hasan._id.toString())) {
            console.log("CRITICAL: Filter is NOT working or Hasan is the creator of everything.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

testVisibility();
