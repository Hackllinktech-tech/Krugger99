const express = require('express');
const path = require('path');
const signupRouter = require('./signup');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mount signup router
app.use('/', signupRouter);

// 404 fallback for unmatched routes (optional)
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
