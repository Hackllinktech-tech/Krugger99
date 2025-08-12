const express = require('express');
const Database = require('./config.js');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const db = new Database();
    const { username, password } = req.body;

    // ✅ Validate input
    if (!username || !password) {
      return res.json({ success: false, error: "Please enter both username and password." });
    }

    // ✅ Get user by username
    const userArr = await db.select('users', ['id', 'username', 'password'], 'username = ?', [username]);
    if (!userArr || !userArr[0]) {
      return res.json({ success: false, error: "Login or password is incorrect." });
    }

    const user = userArr[0];
    const hashedPassword = db.hashPassword(password);

    // ✅ Check password
    if (user.password !== hashedPassword) {
      return res.json({ success: false, error: "Login or password is incorrect." });
    }

    // ✅ Set session variables
    req.session.loggedin = true;
    req.session.username = user.username;
    req.session.user_id = user.id;

    // ✅ Send welcome + redirect info
    return res.json({
      success: true,
      message: `Welcome to HACKLLINK TECH, ${user.username}!`,
      redirect: '/dashboard'
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

module.exports = router;
