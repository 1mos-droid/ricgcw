const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express App
const app = express();

// 🟢 Simplified CORS for maximum compatibility
app.use(cors({ origin: true }));
app.use(express.json());

// Add request logging with more detail
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} | Method: ${req.method} | Path: ${req.path} | Body: ${JSON.stringify(req.body)}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// --- SECURE LOGIN ENDPOINT ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = [
    { email: 'admin@ricgcw.com', password: 'admin123', role: 'admin', branch: 'all' },
    { email: 'langma@ricgcw.com', password: 'langma123', role: 'branch_admin', branch: 'Langma' },
    { email: 'mallam@ricgcw.com', password: 'mallam123', role: 'branch_admin', branch: 'Mallam' },
    { email: 'kokrobetey@ricgcw.com', password: 'kokrobetey123', role: 'branch_admin', branch: 'Kokrobetey' },
  ];
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.status(200).json({ isAuthenticated: true, role: user.role, branch: user.branch, email: user.email });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// --- GENERIC CRUD HANDLER ---
const createHandler = (collectionName) => {
  const router = express.Router();

  // GET ALL
  router.get("/", async (req, res) => {
    try {
      const snapshot = await db.collection(collectionName).get();
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(items);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // CREATE (POST)
  router.post("/", async (req, res) => {
    try {
      const newItem = req.body;

      // 🟢 Enforce Name Uniqueness for Members
      if (collectionName === "members" && newItem.name) {
        const snapshot = await db.collection("members")
          .where("name", "==", newItem.name.trim())
          .get();
        if (!snapshot.empty) {
          return res.status(409).json({ 
            error: `A member named "${newItem.name}" already exists in the database.` 
          });
        }
      }

      if (!newItem.createdAt) newItem.createdAt = new Date().toISOString();
      
      const docRef = await db.collection(collectionName).add(newItem);
      res.status(201).json({ id: docRef.id, ...newItem });
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // UPDATE (PUT)
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection(collectionName).doc(id).set(req.body, { merge: true });
      res.status(200).json({ id, ...req.body });
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection(collectionName).doc(id).delete();
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};

// --- ROUTES ---
app.use("/members", createHandler("members"));
app.use("/events", createHandler("events"));
app.use("/attendance", createHandler("attendance"));
app.use("/transactions", createHandler("transactions"));
app.use("/resources", createHandler("resources"));
app.use("/bible-studies", createHandler("bible-studies"));
app.use("/targets", createHandler("targets"));

// --- SCHEDULED BIRTHDAY EVENTS ---
exports.checkBirthdays = onSchedule("0 0 * * *", async (event) => {
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + 14);
  const targetMonth = targetDate.getMonth() + 1;
  const targetDay = targetDate.getDate();

  try {
    const membersSnapshot = await db.collection("members").get();
    const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const birthdaysToday = members.filter(member => {
      if (!member.dob) return false;
      const dob = new Date(member.dob);
      return (dob.getMonth() + 1) === targetMonth && dob.getDate() === targetDay;
    });

    for (const member of birthdaysToday) {
      const eventName = `🎂 Birthday: ${member.name}`;
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
      }
    }
  } catch (error) {
    console.error("Error checking birthdays:", error);
  }
});

// --- EXPORT THE FUNCTION ---
exports.api = onRequest({ cors: true, maxInstances: 10 }, app);