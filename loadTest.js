const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const duration = parseInt(process.argv[2], 10); 
const interval = parseInt(process.argv[3], 10); 
const concurrentRequests = parseInt(process.argv[4], 10); 

if (isNaN(duration) || isNaN(interval) || isNaN(concurrentRequests)) {
    console.error('Usage: node load_test.js <duration in minutes> <interval in ms> <concurrent requests>');
    process.exit(1);
}

const url = 'http:/54.253.246.13:3000/upload';
const filePath = "C:\\Users\\mattn\\Downloads\\CAB401_Assignment_1_n10256164 (1).mov";
const testDuration = duration * 60 * 1000; 
const outputFormat = 'mp4'; 

async function uploadFile() {
    const form = new FormData();
    form.append('video', fs.createReadStream(filePath));
    form.append('outputFormat', outputFormat);

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

simulateLoad();
