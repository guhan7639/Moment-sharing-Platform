const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');
    const users = await User.find({}, 'username email role');
    console.log('Total Users:', users.length);
    console.log(JSON.stringify(users, null, 2));
    await mongoose.connection.close();
}
check();
