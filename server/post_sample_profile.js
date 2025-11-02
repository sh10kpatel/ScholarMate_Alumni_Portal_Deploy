// post_sample_profile.js
// Sends a sample POST to the running API at http://localhost:4000/api/alumni/full
// Usage: node post_sample_profile.js

const http = require('http');

const payload = JSON.stringify({
  name: 'Test User from Script',
  role: 'alumni',
  login_id: 'testuser@example.com',
  password: 'testpass',
  branch: 'cse',
  batch: '2022',
  company: 'ExampleCo',
  current_place: 'Example City',
  education: 'BTech',
  experience: '2 years at ExampleCo',
  certificates: 'CertA, CertB',
  description: 'Inserted via test script',
  image: null
});

const port = process.env.PORT || 4000;
const options = {
  hostname: 'localhost',
  port: port,
  path: '/api/alumni/full',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Response:', json);
    } catch (e) {
      console.log('Response body:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(payload);
req.end();
