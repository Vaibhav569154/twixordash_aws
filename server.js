const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming form and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: 'my_super_secret_key',
  resave: false,
  saveUninitialized: false,
}));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login POST
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'vaibhav.deep@mtalkz.com' && password === 'Apex@9999') {
    req.session.loggedIn = true;
    res.redirect('/');
  } else {
    res.send('Invalid credentials. <a href="/login">Try again</a>.');
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Middleware to protect all other routes except public ones
app.use((req, res, next) => {
  const publicPaths = ['/login', '/api/add', '/api/data'];
  if (req.session.loggedIn || publicPaths.includes(req.path)) {
    return next();
  }
  res.redirect('/login');
});

// Dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ API: Get data for dashboard
app.get('/api/data', (req, res) => {
  const sql = 'SELECT * FROM main ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching data:', err);
      return res.status(500).json({ error: 'Error fetching data' });
    }
    res.json(results);
  });
});

// ✅ API: Receive data from chatbot (POST)
app.post('/api/add', (req, res) => {
  const { name, job, mobile } = req.body;
  const timestamp = new Date();

  const sql = 'INSERT INTO main (timestamp, name, job, mobile) VALUES (?, ?, ?, ?)';
  db.query(sql, [timestamp, name, job, mobile], (err, result) => {
    if (err) {
      console.error('❌ Error inserting data:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.status(200).json({ message: 'Data saved successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
