const https = require('https');
https.get('https://images.unsplash.com/photo-1540575861501-7c0351a773a5?auto=format&fit=crop&q=80&w=2070', (res) => {
    console.log("Status Code:", res.statusCode);
}).on('error', (e) => {
    console.error(e);
});
