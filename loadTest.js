#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Get command-line arguments
const duration = parseInt(process.argv[2], 10); // Test duration in minutes
const interval = parseInt(process.argv[3], 10); // Interval between requests in milliseconds
const concurrentRequests = parseInt(process.argv[4], 10); // Number of concurrent requests

// Validate arguments
if (isNaN(duration) || isNaN(interval) || isNaN(concurrentRequests)) {
    console.error('Usage: node load_test.js <duration in minutes> <interval in ms> <concurrent requests>');
    process.exit(1);
}

// Configuration
const url = 'http://localhost:3000/upload'; // Change to your upload endpoint
const filePath = "C:\\Users\\mattn\\Downloads\\CAB401_Assignment_1_n10256164 (1).mov"; // Path to the MP4 file
const testDuration = duration * 60 * 1000; // Convert minutes to milliseconds
const outputFormat = 'mp4'; // Change this to the desired output format

// Function to upload and transcode the file
async function uploadFile() {
    const form = new FormData();
    form.append('video', fs.createReadStream(filePath));
    form.append('outputFormat', outputFormat); // Include the output format in the form data

    try {
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        console.log('Transcoding started:', response.data);
    } catch (error) {
        console.error('Error uploading file:', error.message);
    }
}

// Function to simulate continuous load
async function simulateLoad() {
    const startTime = Date.now();
    const endTime = startTime + testDuration;
    
    while (Date.now() < endTime) {
        const requests = [];
        for (let i = 0; i < concurrentRequests; i++) {
            requests.push(uploadFile());
        }
        await Promise.all(requests);
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    console.log('Load test completed');
}

// Start the load test
simulateLoad();
