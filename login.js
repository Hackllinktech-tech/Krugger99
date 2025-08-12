const express = require('express');
const Database = require('./config.js');

const router = express.Router();

router.post('/login', async (req, res) => {
  const db = new Database();
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, error: "Missing credentials." });
  }

  const userArr = await db.select('users', ['id', 'username', 'password'], 'username = ?', [username]);
  if (!userArr || !userArr[0]) {
    return res.json({ success: false, error: "Login or password is incorrect." });
  }

  const user = userArr[0];
  const hashedPassword = db.hashPassword(password);

  if (user.password !== hashedPassword) {
    return res.json({ success: false, error: "Login or password is incorrect." });
  }

  // Set session (if using express-session)
  req.session.loggedin = true;
  req.session.username = user.username;
  req.session.user_id = user.id;

  res.json({ success: true });
});

module.exports = router;
