const fs = require('fs');
const path = require('path');

// Log file path
const logFilePath = path.join(__dirname, 'data', 'server.log');

function logToConsole(message) {
    const timestampedMessage = `${new Date().toISOString()}: ${message}\n`;
    console.log(timestampedMessage);

    // Append the message to the log file
    fs.appendFileSync(logFilePath, timestampedMessage, 'utf8');
}

function getLogFilePath() {
    return logFilePath;
}

module.exports = { logToConsole, getLogFilePath };
