// Keep-alive script για Render
const https = require('https');

const BACKEND_URL = 'https://step-in-style-backend.onrender.com';

function pingBackend() {
  console.log(`[${new Date().toISOString()}] Pinging backend...`);
  
  https.get(`${BACKEND_URL}/api/health`, (res) => {
    console.log(`✅ Backend responded with status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`❌ Ping failed: ${err.message}`);
  });
}

// Ping κάθε 10 λεπτά (600000ms)
setInterval(pingBackend, 10 * 60 * 1000);

// Initial ping
pingBackend();

console.log('🔄 Keep-alive service started - pinging every 10 minutes');
