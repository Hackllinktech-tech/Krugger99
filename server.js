const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const signupRoutes = require('./signup.js');
const loginRoutes = require('./login.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400 * 30 * 1000,
    httpOnly: true,
    secure: false
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use(signupRoutes);
app.use(loginRoutes);

// Routes for HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lander.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
