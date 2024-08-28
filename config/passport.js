const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { findUserByUsername, validatePassword } = require('../models/user');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = findUserByUsername(username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const isMatch = await validatePassword(username, password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    const user = findUserByUsername(username);
    if (user) {
        done(null, user);
    } else {
        done({ message: 'User not found' }, null);
    }
});

module.exports = passport;
