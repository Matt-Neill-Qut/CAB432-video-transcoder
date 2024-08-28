const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/users.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'user'
            );
        `);
    }
});

const addUser = async (username, password, role = 'user') => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, hashedPassword, role],
            function (err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        reject(new Error('Username already exists.'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(this.lastID); 
                }
            }
        );
    });
};

async function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

const validatePassword = async (username, password) => {
    try {
        const user = await findUserByUsername(username);
        if (!user) {
            throw new Error('User not found.');
        }
        return await bcrypt.compare(password, user.password);
    } catch (err) {
        throw err;
    }
};

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        res.status(403).send('Forbidden');
    }
};

module.exports = {
    addUser,
    findUserByUsername,
    validatePassword,
    isAuthenticated,
    isAdmin
};