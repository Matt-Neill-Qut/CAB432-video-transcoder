const express = require('express');
const db = require('../db');
const router = express.Router();

const { isAuthenticated } = require('../models/user');

router.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;

    db.all(`SELECT * FROM TranscodedFiles WHERE userId = ? ORDER BY dateTime DESC`, [userId], (err, files) => {
        if (err) {
            console.error('Error retrieving files:', err.message);
            return res.status(500).send('Server error');
        }
        const isAdmin = req.session.user.role === 'admin';
        res.render('dashboard', { user: req.session.user, files, isAdmin });
    });
});

module.exports = router;
