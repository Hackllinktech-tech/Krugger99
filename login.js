const express = require('express');
const Database = require('./config.js');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const db = new Database();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, error: "Missing credentials." });
    }

    // Check if user exists
    const userArr = await db.select('users', ['id', 'username', 'password'], 'username = ?', [username]);
    if (!userArr || userArr.length === 0) {
      return res.json({ success: false, error: "Login or password is incorrect." });
    }

    const user = userArr[0];
    const hashedPassword = db.hashPassword(password);

    // Verify password
    if (user.password !== hashedPassword) {
      return res.json({ success: false, error: "Login or password is incorrect." });
    }

    // If using sessions
    if (req.session) {
      req.session.loggedin = true;
      req.session.username = user.username;
      req.session.user_id = user.id;
    }

    // Successful login
    return res.json({ success: true, username: user.username });

  } catch (err) {
    console.error("Login error:", err);
    return res.json({ success: false, error: "Server error. Please try again later." });
  }
});

module.exports = router;
