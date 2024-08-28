const express = require('express');
const http = require('http');
const session = require('express-session');
const passport = require('./config/passport');
const flash = require('connect-flash');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const { setupSocket } = require('./socket');
const { logToConsole } = require('./logger');

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', uploadRoutes);
app.use('/', downloadRoutes);
app.use('/', adminRoutes);
app.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

// Start the server
server.listen(3000, () => {
    logToConsole('Server started on http://localhost:3000');
});
