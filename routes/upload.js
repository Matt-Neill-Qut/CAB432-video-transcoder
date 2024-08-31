const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
const { getSocket } = require('../socket');
const { logToConsole } = require('../logger');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../data');
const uploadDir = path.join(dataDir, 'uploads');
const transcodedDir = path.join(dataDir, 'transcoded');

[uploadDir, transcodedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        logToConsole(`Directory created at ${dir}`);
    }
});

const upload = multer({ dest: uploadDir });
const activeJobs = {};

router.post('/upload', upload.single('video'), (req, res) => {
    const { file, body, session } = req;
    const { outputFormat = 'mp4' } = body;
    const outputFilePath = path.join(transcodedDir, `${file.filename}.${outputFormat}`);
    const io = getSocket();
    const userId = session.user?.id || null;
    const originalFileName = file.originalname;
    const transcodedFileName = `${file.filename}.${outputFormat}`;
    const jobId = uuidv4();

    activeJobs[jobId] = {
        filePath: file.path,
        outputFilePath,
        userId,
        originalFileName,
        transcodedFileName
    };

    logToConsole(`Transcoding started for file: ${originalFileName} to format: ${outputFormat} => saving as: ${transcodedFileName}`);

    ffmpeg(file.path)
        .output(outputFilePath)
        .on('start', () => logToConsole('FFmpeg transcoding process started.'))
        .on('progress', progress => {
            const percent = Math.round(progress.percent);
            logToConsole(`${transcodedFileName} => Transcoding progress: ${percent}%`);
            io.emit('progress', { jobId, percent });
        })
        .on('end', () => {
            logToConsole(`${transcodedFileName} => Transcoding completed.`);

            db.run(
                `INSERT INTO TranscodedFiles (userId, originalFileName, originalFormat, transcodedFileName, transcodedFormat, dateTime) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, originalFileName, path.extname(originalFileName).slice(1), transcodedFileName, outputFormat, new Date().toISOString()],
                err => err ? logToConsole(`Error saving transcoded file info: ${err.message}`) : logToConsole(`File record saved for: ${transcodedFileName}`)
            );

            io.emit('completed', { jobId, downloadPath: transcodedFileName });
 
            fs.unlinkSync(file.path);
            logToConsole(`Original file deleted: ${file.path}`);
            delete activeJobs[jobId];
        })
        .on('error', err => {
            logToConsole(`Error during transcoding: ${err.message}`);
            io.emit('error', 'Error during transcoding');
            
            const job = activeJobs[jobId];
            if (job) {
                fs.unlinkSync(job.filePath);
                logToConsole(`Original file deleted: ${job.filePath}`);
                delete activeJobs[jobId];
            }
        })
        .run();

    res.status(200).send({ message: 'Transcoding started', jobId });
});

module.exports = router;
