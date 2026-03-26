const axios = require('axios');

async function testProfileUpdate() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'testuser123',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        // 2. Update Profile
        const updateRes = await axios.put('http://localhost:5000/api/auth/profile', {
            name: 'Test User Redesigned API',
            bio: 'This bio was updated via API test script.'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update successful:', updateRes.data.name, '-', updateRes.data.bio);

        // 3. Verify
        const verifyRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'testuser123',
            password: 'password123'
        });
        console.log('Verification successful:', verifyRes.data.name, '-', verifyRes.data.bio);
    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

testProfileUpdate();
