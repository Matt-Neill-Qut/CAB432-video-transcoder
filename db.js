const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logToConsole } = require('./logger');

const dbPath = path.join(__dirname, 'data', 'transcoding.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        logToConsole('Connected to SQLite database.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS TranscodedFiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            originalFileName TEXT,
            originalFormat TEXT,
            transcodedFileName TEXT,
            transcodedFormat TEXT,
            dateTime TEXT,
            FOREIGN KEY(userId) REFERENCES Users(id)
        )
    `);
});

function cleanupTranscodedFiles() {
    console.log('Running cleanup task...');
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    db.all(
        `SELECT transcodedFileName FROM TranscodedFiles WHERE userId IS NULL AND dateTime < ?`,
        [fifteenMinutesAgo],
        (err, rows) => {
            if (err) {
                console.error('Error fetching old files:', err.message);
                return;
            }

            if (!rows || rows.length === 0) {
                logToConsole('No old files to delete.');
                return;
            }

            rows.forEach((row) => {
                const filePath = path.join(__dirname, 'data', 'transcoded', row.transcodedFileName);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr.message);
                    } else {
                        logToConsole(`Deleted file: ${row.transcodedFileName}`);
                    }
                });
            });

            db.run(
                `DELETE FROM TranscodedFiles WHERE userId IS NULL AND dateTime < ?`,
                [fifteenMinutesAgo],
                function (err) {
                    if (err) {
                        console.error('Error deleting old file records:', err.message);
                    } else {
                        logToConsole(`Deleted ${this.changes} old file records from the database.`);
                    }
                }
            );
        }
    );
}

setInterval(cleanupTranscodedFiles, 5 * 60 * 1000);

module.exports = db;
