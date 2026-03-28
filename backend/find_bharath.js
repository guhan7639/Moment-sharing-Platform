const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
require('dotenv').config();

const findBharath = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');
        const bharath = await User.findOne({ name: /bharath/i });
        fs.writeFileSync('bharath_details.json', JSON.stringify(bharath, null, 2), 'utf8');
        console.log('Done');
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findBharath();
