const mongoose = require('mongoose');
require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

async function testVisibility() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');

        const User = mongoose.model('User');
        const hasan = await User.findOne({ username: 'user_hasan' });

        if (!hasan) {
            console.log("User 'user_hasan' not found.");
            const allUsers = await User.find({});
            console.log("Existing users:", allUsers.map(u => u.username));
            return;
        }

        console.log(`Testing visibility for user: ${hasan.username} (ID: ${hasan._id}, Role: ${hasan.role})`);

        // simulate getEvents logic exactly as it is in the controller currently
        const currentLogicEvents = await Event.find({ createdBy: hasan._id }).populate('createdBy', 'username');
        console.log(`- Current Logic 'createdBy: hasan._id' returned ${currentLogicEvents.length} events.`);

        // Find all events to see why Hasan might be seeing everything
        const allEvents = await Event.find({}).populate('createdBy', 'username');
        console.log(`- Total events in DB: ${allEvents.length}`);

        allEvents.forEach((e, i) => {
            console.log(`  [${i}] "${e.eventName}" (ID: ${e._id}) - Creator: ${e.createdBy ? e.createdBy.username : 'Unknown'} - Status: ${e.status}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

testVisibility();
