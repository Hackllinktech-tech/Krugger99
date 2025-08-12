const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const signupRoutes = require('./signup.js');
const loginRoutes = require('./login.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'your_session_secret', // Change to a strong secret!
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400 * 30 * 1000,
    httpOnly: true,
    secure: false // set to true if using HTTPS
  }
}));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use(signupRoutes);
app.use(loginRoutes);

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lander.html'));
});

// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
