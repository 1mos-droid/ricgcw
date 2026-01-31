const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3002;

// --- Middleware ---
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Parses incoming JSON data

// --- Database Configuration ---
const DB_FILE = path.join(__dirname, 'db.json');

// Helper: Define default DB structure
const getInitialDB = () => ({
  members: [],
  transactions: [],
  attendance: [],
  events: []
});

// Helper: Read DB safely (Prevent Crashes)
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Create file if it doesn't exist
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }

    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    
    // Handle case where file exists but is empty
    if (!fileContent.trim()) {
      return getInitialDB();
    }

    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Database Error:", error);
    // Return empty structure instead of crashing
    return getInitialDB();
  }
};

// Helper: Write DB safely
const writeDB = (db) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Failed to save to database:", error);
  }
};

// --- Generic Request Handlers ---

// Handles all GET requests
const handleGet = (res, key) => {
  const db = readDB();
  res.json(db[key] || []);
};

// Handles all POST requests
const handlePost = (req, res, key) => {
  try {
    const db = readDB();
    
    // Validate that body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body cannot be empty" });
    }
    
    const newItem = { id: Date.now(), ...req.body };
    
    // Ensure the array exists before pushing
    if (!db[key]) db[key] = [];
    
    db[key].push(newItem);
    writeDB(db);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Post Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- API Routes ---

// Root Route (Fixes "Cannot GET /" error)
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend is Running 🚀</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/api/members">/api/members</a></li>
      <li><a href="/api/transactions">/api/transactions</a></li>
      <li><a href="/api/attendance">/api/attendance</a></li>
      <li><a href="/api/events">/api/events</a></li>
    </ul>
  `);
});

// Members API
app.get('/api/members', (req, res) => handleGet(res, 'members'));
app.post('/api/members', (req, res) => handlePost(req, res, 'members'));

// Transactions API
app.get('/api/transactions', (req, res) => handleGet(res, 'transactions'));
app.post('/api/transactions', (req, res) => handlePost(req, res, 'transactions'));

// Attendance API
app.get('/api/attendance', (req, res) => handleGet(res, 'attendance'));
app.post('/api/attendance', (req, res) => handlePost(req, res, 'attendance'));

// Events API
app.get('/api/events', (req, res) => handleGet(res, 'events'));
app.post('/api/events', (req, res) => handlePost(req, res, 'events'));

// --- Start Server ---
app.listen(port, () => {
  console.log(`✅ Backend server listening at http://localhost:${port}`);
});