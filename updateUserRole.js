const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const userId = process.argv[2];
const newRole = process.argv[3];

if (!userId || !newRole) {
    console.error('Usage: node updateUserRole.js <userId> <newRole>');
    process.exit(1);
}

const dbPath = path.join(__dirname, 'data', 'users.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database.');
    }
});

const updateUserRole = (userId, newRole) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE Users SET role = ? WHERE id = ?`,
            [newRole, userId],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
};

updateUserRole(userId, newRole)
    .then(changes => {
        if (changes > 0) {
            console.log(`User with ID ${userId} has been updated to role '${newRole}'.`);
        } else {
            console.log(`No user found with ID ${userId}.`);
        }
        db.close();
    })
    .catch(err => {
        console.error('Error updating user role:', err.message);
        db.close();
    });
