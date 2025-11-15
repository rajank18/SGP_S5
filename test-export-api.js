#!/usr/bin/env node

/**
 * Quick Test Script for Export API
 * Usage: node test-export-api.js <courseId>
 * 
 * Example: node test-export-api.js 1
 */

const http = require('http');

const courseId = process.argv[2] || '1';
const token = process.argv[3] || 'YOUR_JWT_TOKEN_HERE';

console.log(`🧪 Testing Export API for Course ID: ${courseId}`);
console.log(`⏳ Making request to: http://localhost:3001/api/faculty/courses/${courseId}/export`);
console.log('');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/faculty/courses/${courseId}/export`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
    console.log('');
    console.log('📦 Response Body:');
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('');
        console.log(`✅ SUCCESS: Found ${parsed.data.length} groups to export`);
        console.log(`📅 Export Date: ${parsed.exportDate}`);
        console.log(`📚 Course Name: ${parsed.courseName}`);
      } else {
        console.log('');
        console.log('❌ FAILED: API returned success=false');
      }
    } catch (e) {
      console.log(data);
      console.log('');
      console.log('⚠️  Could not parse JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('');
  console.error('🔍 Troubleshooting:');
  console.error('1. Make sure backend is running: npm run dev (in backend folder)');
  console.error('2. Make sure backend is running on port 3001');
  console.error('3. Make sure you have a valid JWT token');
  console.error('4. Make sure courseId exists in database');
});

console.log('📡 Sending request...');
req.end();
