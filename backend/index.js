const express = require('express');
const cors = require('cors');
// Ensure you have this file created (I've provided the code for it below)
const { admin, db } = require('./firebaseAdmin');

const app = express();
const port = 3002;

// --- Middleware ---
app.use(cors({
  origin: true, // Allow all origins for development (restrict this in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- Helper Functions ---

// Standardized Error Responder
const sendError = (res, error, message = 'Internal Server Error') => {
  console.error(`❌ ${message}:`, error);
  res.status(500).json({ error: message, details: error.message });
};

// Generic GET (Fetch All)
const handleGet = async (res, collectionName) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📡 GET /${collectionName} - Sent ${data.length} records`);
    res.json(data);
  } catch (error) {
    sendError(res, error, `Failed to fetch ${collectionName}`);
  }
};

// Generic POST (Create New)
const handlePost = async (req, res, collectionName) => {
  try {
    const newItem = req.body;
    
    // Basic Validation
    if (!newItem || Object.keys(newItem).length === 0) {
      return res.status(400).json({ error: 'Request body cannot be empty' });
    }

    // Add Timestamp if not present
    if (!newItem.createdAt) {
      newItem.createdAt = new Date().toISOString();
    }

    const docRef = await db.collection(collectionName).add(newItem);
    console.log(`✅ POST /${collectionName} - Created ID: ${docRef.id}`);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    sendError(res, error, `Failed to create item in ${collectionName}`);
  }
};

// Generic PUT (Update Existing)
const handlePut = async (req, res, collectionName) => {
  try {
    const { id } = req.params;
    const updatedItem = req.body;
    
    // Using { merge: true } ensures we don't accidentally overwrite missing fields
    await db.collection(collectionName).doc(id).set(updatedItem, { merge: true });
    
    console.log(`🔄 PUT /${collectionName}/${id} - Updated`);
    res.json({ id, ...updatedItem });
  } catch (error) {
    sendError(res, error, `Failed to update item in ${collectionName}`);
  }
};

// Generic DELETE (Remove)
const handleDelete = async (req, res, collectionName) => {
  try {
    const { id } = req.params;
    await db.collection(collectionName).doc(id).delete();
    console.log(`🗑️ DELETE /${collectionName}/${id} - Deleted`);
    res.status(204).send();
  } catch (error) {
    sendError(res, error, `Failed to delete item in ${collectionName}`);
  }
};


// --- API Routes ---

// Root Health Check
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #2563EB;">RICGCW Backend Online 🚀</h1>
      <p>Server is running on port <strong>${port}</strong></p>
      <p>Endpoints available: /members, /transactions, /events, /attendance, /users</p>
    </div>
  `);
});

// 1. Members
app.get('/api/members', (req, res) => handleGet(res, 'members'));
app.post('/api/members', (req, res) => handlePost(req, res, 'members'));
app.put('/api/members/:id', (req, res) => handlePut(req, res, 'members'));
app.delete('/api/members/:id', (req, res) => handleDelete(req, res, 'members'));

// 2. Transactions (Financials)
app.get('/api/transactions', (req, res) => handleGet(res, 'transactions'));
app.post('/api/transactions', (req, res) => handlePost(req, res, 'transactions'));
app.put('/api/transactions/:id', (req, res) => handlePut(req, res, 'transactions'));
app.delete('/api/transactions/:id', (req, res) => handleDelete(req, res, 'transactions'));

// 3. Events & Attendance
app.get('/api/events', (req, res) => handleGet(res, 'events'));
app.post('/api/events', (req, res) => handlePost(req, res, 'events'));
app.put('/api/events/:id', (req, res) => handlePut(req, res, 'events'));
app.delete('/api/events/:id', (req, res) => handleDelete(req, res, 'events'));

app.get('/api/attendance', (req, res) => handleGet(res, 'attendance'));
app.post('/api/attendance', (req, res) => handlePost(req, res, 'attendance'));

// 4. User Management (NEW - Support for UserManagement.js)
app.get('/api/users', (req, res) => handleGet(res, 'users'));
app.post('/api/users', (req, res) => handlePost(req, res, 'users'));
app.put('/api/users/:id', (req, res) => handlePut(req, res, 'users'));
app.delete('/api/users/:id', (req, res) => handleDelete(req, res, 'users'));

// 5. Bible Studies & Resources
app.get('/api/bible-studies', (req, res) => handleGet(res, 'bible-studies'));
app.get('/api/resources', (req, res) => handleGet(res, 'resources'));


// --- Start Server ---
app.listen(port, () => {
  console.log(`
  =============================================
  ✅ Backend Server Listening
  🔗 URL: http://localhost:${port}
  📂 Database: Firestore (Admin SDK)
  =============================================
  `);
});