require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        const users = await User.find({});
        console.log('Users:');
        users.forEach(u => console.log(u.username, u.role));

        const events = await Event.find({});
        console.log('\nEvents:');
        events.forEach(e => console.log(e.eventName, e.status));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
