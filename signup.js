const express = require('express');
const Database = require('./config.js');

const router = express.Router();

// ✅ Check username/email availability
router.post('/signup/check_availability', async (req, res) => {
  try {
    const db = new Database();
    let response = { usernameExists: false, emailExists: false };

    // Check email if provided
    if (req.body.email) {
      const email = db.validate(req.body.email);
      const emailCheck = await db.select('users', ['email'], 'email = ?', [email]);
      if (emailCheck.length > 0) response.emailExists = true;
    }

    // Check username if provided
    if (req.body.username) {
      const username = db.validate(req.body.username);
      const usernameCheck = await db.select('users', ['username'], 'username = ?', [username]);
      if (usernameCheck.length > 0) response.usernameExists = true;
    }

    return res.json(response);

  } catch (err) {
    console.error('❌ Error checking username/email:', err);
    return res.status(500).json({ error: 'Server error checking availability.' });
  }
});

// ✅ Register new user
router.post('/signup', async (req, res) => {
  try {
    const db = new Database();
    const { first_name, last_name, email, username, password, terms } = req.body;
    let errors = [];

    // Validation rules
    if (!first_name || first_name.length > 30) errors.push("Invalid first name.");
    if (!last_name || last_name.length > 30) errors.push("Invalid last name.");
    if (!email || !/^[\w._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email) || email.length > 100) errors.push("Invalid email address.");
    if (!username || !/^[a-zA-Z0-9_]+$/.test(username) || username.length > 30) errors.push("Invalid username.");
    if (!password || password.length < 6 || password.length > 255) errors.push("Password must be between 6 and 255 characters.");
    if (!terms) errors.push("You must agree to the Terms & Conditions.");

    // If no validation errors, check DB
    if (!errors.length) {
      const emailExists = await db.select('users', ['id'], 'email = ?', [email]);
      if (emailExists.length > 0) errors.push("This email exists!");

      const usernameExists = await db.select('users', ['id'], 'username = ?', [username]);
      if (usernameExists.length > 0) errors.push("This username exists!");
    }

    // If still errors, return them
    if (errors.length > 0) {
      return res.json({ success: false, errors });
    }

    // Insert user
    const hashedPassword = db.hashPassword(password);
    const result = await db.insert('users', {
      first_name: db.validate(first_name),
      last_name: db.validate(last_name),
      email: db.validate(email),
      username: db.validate(username),
      password: hashedPassword
    });

    // Success check
    if (typeof result === 'number' && result > 0) {
      return res.json({ success: true, redirect: '/login' });
    } else {
      return res.json({ success: false, errors: ["Registration failed. Please try again later."] });
    }

  } catch (err) {
    console.error('❌ Error during signup:', err);
    return res.status(500).json({ success: false, errors: ["Server error during signup."] });
  }
});

module.exports = router;
