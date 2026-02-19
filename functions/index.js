/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler"); // 🟢 Added for v2 scheduling
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express App
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(express.json());

// --- SECURE LOGIN ENDPOINT ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Pre-defined users (In a real app, these would be hashed in a DB)
  const users = [
    { email: 'admin@ricgcw.com', password: 'admin123', role: 'admin', branch: 'all' },
    { email: 'langma@ricgcw.com', password: 'langma123', role: 'branch_admin', branch: 'Langma' },
    { email: 'mallam@ricgcw.com', password: 'mallam123', role: 'branch_admin', branch: 'Mallam' },
    { email: 'kokrobetey@ricgcw.com', password: 'kokrobetey123', role: 'branch_admin', branch: 'Kokrobetey' },
  ];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Return only the necessary non-sensitive info
    res.status(200).json({
      isAuthenticated: true,
      role: user.role,
      branch: user.branch,
      email: user.email
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

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

// --- SCHEDULED BIRTHDAY EVENTS ---
// Runs every day at midnight (UTC)
exports.checkBirthdays = onSchedule("0 0 * * *", async (event) => {
  const today = new Date();
  
  // Calculate the target date (14 days from now)
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + 14);
  
  const targetMonth = targetDate.getMonth() + 1; // 1-12
  const targetDay = targetDate.getDate();

  console.log(`Checking for birthdays on ${targetMonth}/${targetDay} (2 weeks from now)`);

  try {
    const membersSnapshot = await db.collection("members").get();
    const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const birthdaysToday = members.filter(member => {
      if (!member.dob) return false;
      
      const dob = new Date(member.dob);
      return (dob.getMonth() + 1) === targetMonth && dob.getDate() === targetDay;
    });

    console.log(`Found ${birthdaysToday.length} members with birthdays in 2 weeks.`);

    for (const member of birthdaysToday) {
      const eventName = `🎂 Birthday: ${member.name}`;
      
      // Check if event already exists to avoid duplicates
      const existingEvents = await db.collection("events")
        .where("name", "==", eventName)
        .where("date", "==", targetDate.toISOString().split('T')[0] + "T00:00:00.000Z")
        .get();

      if (existingEvents.empty) {
        const newEvent = {
          name: eventName,
          date: targetDate.toISOString().split('T')[0] + "T00:00:00.000Z",
          time: "00:00",
          location: "Main Auditorium",
          isOnline: false,
          description: `Happy Birthday to ${member.name}! This is an automatically generated reminder.`,
          createdAt: new Date().toISOString()
        };

        await db.collection("events").add(newEvent);
        console.log(`Created birthday event for ${member.name}`);
      } else {
        console.log(`Birthday event for ${member.name} already exists. Skipping.`);
      }
    }
  } catch (error) {
    console.error("Error checking birthdays:", error);
  }
});

// --- EXPORT THE FUNCTION ---
// This is the specific line Firebase looks for. 
// If this is missing, Firebase thinks you want to delete the function.
exports.api = onRequest(app);