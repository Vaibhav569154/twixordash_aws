const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'my_super_secret_key', // 🔒 Change this in production
  resave: false,
  saveUninitialized: false,
}));

// ✅ Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Login page (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login form submission (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // 🔐 Basic static login — replace with DB validation in production
  if (email === 'vaibhav.deep@mtalkz.com' && password === 'Apex@9999') {
    req.session.loggedIn = true;
    res.redirect('/');
  } else {
    res.send('Invalid credentials. <a href="/login">Try again</a>.');
  }
});

// Logout (POST)
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Protect all routes except /login and /api/data
app.use((req, res, next) => {
  const allowedPaths = ['/login', '/api/data'];
  if (req.session.loggedIn || allowedPaths.includes(req.path)) {
    return next();
  }
  res.redirect('/login');
});

// 🛡 Redirect root (/) to /login if not logged in
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to fetch data from Google Sheet
app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.sheetbest.com/sheets/71a1c16a-626e-43e7-9547-5a3e39a11faf'
    );
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching sheet data:', error.message);
    res.status(500).send('Error fetching data');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
