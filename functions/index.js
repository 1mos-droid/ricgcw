/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express App
const app = express();

// Automatically allow cross-origin requests (Allows your React app to talk to this)
app.use(cors({ origin: true }));
app.use(express.json());

// --- GENERIC CRUD HANDLER ---
// This smart function handles GET, POST, PUT, DELETE for ANY collection
// It saves us from writing 100 lines of code for Members, Events, etc.

const createHandler = (collectionName) => {
  const router = express.Router();

  // GET ALL
  router.get("/", async (req, res) => {
    try {
      const snapshot = await db.collection(collectionName).get();
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(items);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // CREATE (POST)
  router.post("/", async (req, res) => {
    try {
      const newItem = req.body;
      // Add timestamp if not present
      if (!newItem.createdAt) newItem.createdAt = new Date().toISOString();
      
      const docRef = await db.collection(collectionName).add(newItem);
      res.status(201).json({ id: docRef.id, ...newItem });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // UPDATE (PUT)
  router.put("/:id", async (req, res) => {
    try {
      await db.collection(collectionName).doc(req.params.id).update(req.body);
      res.status(200).send("Updated successfully");
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      await db.collection(collectionName).doc(req.params.id).delete();
      res.status(200).send("Deleted successfully");
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  return router;
};

// --- ROUTES ---
// We simply map the URL paths to the collections in your database
app.use("/members", createHandler("members"));
app.use("/events", createHandler("events"));
app.use("/attendance", createHandler("attendance"));
app.use("/transactions", createHandler("transactions"));
app.use("/resources", createHandler("resources"));
app.use("/bible-studies", createHandler("bible-studies"));

// --- EXPORT THE FUNCTION ---
// This is the specific line Firebase looks for. 
// If this is missing, Firebase thinks you want to delete the function.
exports.api = onRequest(app);