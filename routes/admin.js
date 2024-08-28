const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../models/user');
const path = require('path');
const { logToConsole } = require('../logger');

const logFilePath = path.join(__dirname, '../data/server.log');

router.get('/admin-panel', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-panel', { user: req.session.user });
    logToConsole(`Admin panel accessed by user: ${req.session.user.username}`);
});

router.get('/admin-panel/logs', (req, res) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.status(500).json({ error: 'Unable to read log file' });
        }

        const logs = data.trim().split('\n');
        res.json({ logs });
    });
});

module.exports = router;
