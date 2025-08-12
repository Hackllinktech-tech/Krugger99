const express = require('express');
const Database = require('./config.js');

const router = express.Router();

// Check availability for username/email
router.post('/signup/check_availability', async (req, res) => {
  const db = new Database();
  let response = { usernameExists: false, emailExists: false };

  if (req.body.email) {
    const email = db.validate(req.body.email);
    const emailCheck = await db.select('users', ['email'], 'email = ?', [email]);
    if (emailCheck.length > 0) response.emailExists = true;
  }
  if (req.body.username) {
    const username = db.validate(req.body.username);
    const usernameCheck = await db.select('users', ['username'], 'username = ?', [username]);
    if (usernameCheck.length > 0) response.usernameExists = true;
  }
  res.json(response);
});

// Register new user
router.post('/signup', async (req, res) => {
  const db = new Database();
  const { first_name, last_name, email, username, password, terms } = req.body;
  let errors = [];

  // Server-side validation
  if (!first_name || first_name.length > 30) errors.push("Invalid first name.");
  if (!last_name || last_name.length > 30) errors.push("Invalid last name.");
  if (!email || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email) || email.length > 100) errors.push("Invalid email address.");
  if (!username || !/^[a-zA-Z0-9_]+$/.test(username) || username.length > 30) errors.push("Invalid username.");
  if (!password || password.length < 6 || password.length > 255) errors.push("Password must be between 6 and 255 characters.");
  if (!terms) errors.push("You must agree to the Terms & Conditions.");

  // Check if email or username already exists
  const emailExists = await db.select('users', ['id'], 'email = ?', [email]);
  if (emailExists.length > 0) errors.push("This email exists!");
  const usernameExists = await db.select('users', ['id'], 'username = ?', [username]);
  if (usernameExists.length > 0) errors.push("This username exists!");

  if (errors.length > 0) {
    return res.json({ success: false, errors });
  }

  const hashedPassword = db.hashPassword(password);
  const data = {
    first_name: db.validate(first_name),
    last_name: db.validate(last_name),
    email: db.validate(email),
    username: db.validate(username),
    password: hashedPassword
  };
  const result = await db.insert('users', data);

  if (typeof result === 'number' && result > 0) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false, errors: ["Registration failed. Please try again later."] });
  }
});

module.exports = router;
