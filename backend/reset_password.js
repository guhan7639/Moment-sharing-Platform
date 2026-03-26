const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

async function resetPassword() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node reset_password.js <username> <new_password>');
        process.exit(1);
    }

    const username = args[0];
    const newPassword = args[1];

    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_db');

        // Find the user
        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User '${username}' not found in the database.`);
        } else {
            // Update the password. The pre-save hook in User.js will automatically hash it.
            user.password = newPassword;
            await user.save();
            console.log(`✅ Password for '${username}' has been successfully reset!`);
        }
    } catch (err) {
        console.error('Error updating password:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

resetPassword();
