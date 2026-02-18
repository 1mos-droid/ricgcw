const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- HELPER FUNCTIONS ---

const handleGet = async (req, res, collectionName) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 NEW: Handles fetching data from INSIDE a member
const handleSubCollectionGet = async (req, res, parentCollection, subCollection) => {
  try {
    const { id } = req.params; // This is the memberId
    const snapshot = await db.collection(parentCollection).doc(id).collection(subCollection).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handlePost = async (req, res, collectionName) => {
  try {
    const newItem = req.body;
    if (!newItem.createdAt) newItem.createdAt = new Date().toISOString();
    const docRef = await db.collection(collectionName).add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 NEW: Handles saving data INSIDE a member
const handleSubCollectionPost = async (req, res, parentCollection, subCollection) => {
  try {
    const { id } = req.params; // This is the memberId
    const newItem = req.body;
    if (!newItem.createdAt) newItem.createdAt = new Date().toISOString();
    
    // Save to members/{id}/contributions
    const docRef = await db.collection(parentCollection).doc(id).collection(subCollection).add(newItem);
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
app.get('/members', (req, res) => handleGet(req, res, 'members'));
app.post('/members', (req, res) => handlePost(req, res, 'members'));

// 🔴 NEW ROUTES: Specific Member Contributions
// GET: /members/123/contributions -> Returns contributions ONLY for member 123
app.get('/members/:id/contributions', (req, res) => handleSubCollectionGet(req, res, 'members', 'contributions'));
// POST: /members/123/contributions -> Saves contribution INSIDE member 123
app.post('/members/:id/contributions', (req, res) => handleSubCollectionPost(req, res, 'members', 'contributions'));


// 2. Global Transactions (For Dashboard Only)
app.get('/transactions', (req, res) => handleGet(req, res, 'transactions'));
app.post('/transactions', (req, res) => handlePost(req, res, 'transactions'));

// ... (Rest of routes: attendance, events, users, etc.) ...
app.get('/attendance', (req, res) => handleGet(req, res, 'attendance'));
app.post('/attendance', (req, res) => handlePost(req, res, 'attendance'));
app.put('/attendance/:id', (req, res) => handlePut(req, res, 'attendance'));
app.delete('/attendance/:id', (req, res) => handleDelete(req, res, 'attendance'));

app.get('/events', (req, res) => handleGet(req, res, 'events'));

exports.api = functions.https.onRequest(app);