const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin (No key file needed in Cloud Functions!)
admin.initializeApp();
const db = admin.firestore();

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(express.json());

// --- HELPER FUNCTIONS ---

const handleGet = async (res, collectionName) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handlePost = async (req, res, collectionName) => {
  try {
    const newItem = req.body;
    // Add Timestamp if missing
    if (!newItem.createdAt) newItem.createdAt = new Date().toISOString();
    
    const docRef = await db.collection(collectionName).add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handlePut = async (req, res, collectionName) => {
  try {
    const { id } = req.params;
    const updatedItem = req.body;
    await db.collection(collectionName).doc(id).set(updatedItem, { merge: true });
    res.json({ id, ...updatedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleDelete = async (req, res, collectionName) => {
  try {
    const { id } = req.params;
    await db.collection(collectionName).doc(id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- ROUTES ---

// 1. Members
app.get('/members', (req, res) => handleGet(res, 'members'));
app.post('/members', (req, res) => handlePost(req, res, 'members'));
app.put('/members/:id', (req, res) => handlePut(req, res, 'members'));
app.delete('/members/:id', (req, res) => handleDelete(req, res, 'members'));

// 2. Transactions
app.get('/transactions', (req, res) => handleGet(res, 'transactions'));
app.post('/transactions', (req, res) => handlePost(req, res, 'transactions'));

// 3. Attendance
app.get('/attendance', (req, res) => handleGet(res, 'attendance'));
app.post('/attendance', (req, res) => handlePost(req, res, 'attendance'));
app.delete('/attendance/:id', (req, res) => handleDelete(req, res, 'attendance'));

// 4. Events
app.get('/events', (req, res) => handleGet(res, 'events'));
app.post('/events', (req, res) => handlePost(req, res, 'events'));
app.put('/events/:id', (req, res) => handlePut(req, res, 'events'));
app.delete('/events/:id', (req, res) => handleDelete(req, res, 'events'));

// 5. Users
app.get('/users', (req, res) => handleGet(res, 'users'));
app.post('/users', (req, res) => handlePost(req, res, 'users'));

// 6. Resources & Bible Studies
app.get('/resources', (req, res) => handleGet(res, 'resources'));
app.get('/bible-studies', (req, res) => handleGet(res, 'bible-studies'));

// --- EXPORT FUNCTION ---
// This exposes the Express app as a single Cloud Function named "api"
exports.api = functions.https.onRequest(app);