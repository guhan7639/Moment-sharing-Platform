const mongoose = require('mongoose');
const Photo = require('./backend/models/Photo');
require('dotenv').config({ path: 'backend/.env' });

async function checkEmbeddings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const photos = await Photo.find({});
        console.log(`Checking ${photos.length} photos...`);

        photos.forEach(photo => {
            if (photo.faces) {
                photo.faces.forEach((face, index) => {
                    if (!Array.isArray(face.embedding)) {
                        console.log(`Photo ${photo._id} Face ${index} embedding is NOT an array:`, typeof face.embedding);
                    } else if (face.embedding.length === 0) {
                        console.log(`Photo ${photo._id} Face ${index} embedding is EMPTY`);
                    } else {
                        // console.log(`Photo ${photo._id} Face ${index} embedding OK (length: ${face.embedding.length})`);
                    }
                });
            }
        });

        console.log('Check complete');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkEmbeddings();
