const mongoose = require('mongoose');
const path = require('path');
const Photo = require('./models/Photo');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkEmbeddings() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const photos = await Photo.find({});
        console.log(`Checking ${photos.length} photos...`);

        let issues = 0;
        photos.forEach(photo => {
            if (photo.faces && photo.faces.length > 0) {
                photo.faces.forEach((face, index) => {
                    if (!Array.isArray(face.embedding)) {
                        console.log(`Photo ${photo._id} Face ${index} embedding is NOT an array:`, typeof face.embedding);
                        issues++;
                    } else if (face.embedding.length === 0) {
                        console.log(`Photo ${photo._id} Face ${index} embedding is EMPTY`);
                        issues++;
                    }
                });
            } else {
                // console.log(`Photo ${photo._id} has NO faces`);
            }
        });

        console.log(`Check complete. Found ${issues} issues.`);
    } catch (err) {
        console.error('Error during check:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

checkEmbeddings();
