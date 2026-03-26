const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');
    console.log('Connected');
    try {
        const dummy = {
            name: 'Test User',
            username: 'testuser_' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            role: 'user'
        };
        const user = await User.create(dummy);
        console.log('User created:', user._id);
    } catch (err) {
        console.error('Registration Error:', err.stack || err);
    }
    await mongoose.connection.close();
}

test();
