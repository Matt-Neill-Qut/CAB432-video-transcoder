const express = require('express');
const { addUser, findUserByUsername, validatePassword, isAuthenticated } = require('../models/user');
const router = express.Router();

router.get('/login', (req, res) => {
    const errorMessage = req.flash('error') || '';
    res.render('login', { error: errorMessage });
});

router.get('/register', (req, res) => {
    const error = req.query.error;
    res.render('register', { error });
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        await addUser(username, password);
        res.status(201).redirect('/login');
    } catch (error) {
        res.redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await findUserByUsername(username);

        if (!user) {
            return res.redirect('/login?error=User not found');
        }

        const isValid = await validatePassword(username, password);
        if (!isValid) {
            return res.redirect('/login?error=Invalid credentials');
        }


        req.session.user = user;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

module.exports = router;
