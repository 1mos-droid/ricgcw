const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const express = require("express");
const bcrypt = require("bcryptjs");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express App
const app = express();

// 🟢 Manual CORS implementation for maximum control
app.use((req, res, next) => {
  const origin = req.get('origin');
  // Allow all origins for now to solve the immediate issue, but echo the origin if present
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

app.use(express.json());

// Add request logging with more detail
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} | Method: ${req.method} | Path: ${req.path} | Origin: ${req.get('origin')}`);
  next();
});

// Health check endpoint with debug info
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    origin: req.get('origin'),
    headers: req.headers,
    env: process.env.NODE_ENV || 'production'
  });
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
  targetDate.setDate(today.getDate() + 7);
  const targetMonth = targetDate.getMonth() + 1;
  const targetDay = targetDate.getDate();

  try {
    const membersSnapshot = await db.collection("members").get();
    const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const birthdaysToday = members.filter(member => {
      if (!member.dob) return false;
      const dob = (typeof member.dob.toDate === 'function') 
        ? member.dob.toDate() 
        : new Date(member.dob);
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
          branch: member.branch || 'Main',
          createdAt: new Date().toISOString()
        };
        await db.collection("events").add(newEvent);
      }
    }
  } catch (error) {
    console.error("Error checking birthdays:", error);
  }
});

// --- SCHEDULED STATUS UPDATES ---
// Runs daily at 1:00 AM to check attendance thresholds
exports.updateMemberStatuses = onSchedule("0 1 * * *", async (event) => {
  const today = new Date();
  // We check records up to 5 months back to determine discontinued status
  const cutoffDate = new Date();
  cutoffDate.setMonth(today.getMonth() - 5);

  try {
    const [membersSnapshot, attendanceSnapshot] = await Promise.all([
      db.collection("members").get(),
      db.collection("attendance").where("date", ">=", cutoffDate.toISOString()).get()
    ]);

    // Map memberId -> latest attendance date found in the window
    const lastSeenMap = new Map();
    attendanceSnapshot.forEach(doc => {
      const record = doc.data();
      const recordDate = new Date(record.date);
      if (record.attendees) {
        record.attendees.forEach(m => {
          if (m.id) {
            const currentLast = lastSeenMap.get(m.id);
            if (!currentLast || recordDate > currentLast) {
              lastSeenMap.set(m.id, recordDate);
            }
          }
        });
      }
    });

    const batch = db.batch();
    let updatesCount = 0;

    membersSnapshot.forEach(doc => {
      const member = doc.data();
      const memberId = doc.id;
      
      const lastAttendance = lastSeenMap.get(memberId);
      const joinDate = new Date(member.createdAt || 0);
      
      // Use the later of last attendance or join date to determine period of absence
      const referenceDate = lastAttendance && lastAttendance > joinDate ? lastAttendance : joinDate;
      const msDiff = today.getTime() - referenceDate.getTime();
      const daysAbsent = Math.floor(msDiff / (1000 * 60 * 60 * 24));

      let targetStatus = "active";
      if (daysAbsent >= 150) { // 5 months approx
        targetStatus = "discontinued";
      } else if (daysAbsent >= 90) { // 3 months approx
        targetStatus = "inactive";
      }

      if (member.status !== targetStatus) {
        // Safety: Don't move manually discontinued/inactive members back to active 
        // unless they have actually attended recently (handled by the 'else' targetStatus="active")
        batch.update(doc.ref, { status: targetStatus });
        updatesCount++;
      }

      // Handle batch limit (500)
      if (updatesCount >= 490) {
        // For very large databases, this would need to commit and start a new batch.
        // Assuming member count is within reasonable church limits for now.
      }
    });

    if (updatesCount > 0) {
      await batch.commit();
      console.log(`[STATUS SYNC] Updated ${updatesCount} member statuses based on attendance.`);
    }

  } catch (error) {
    console.error("Error updating member statuses:", error);
  }
});

// --- EXPORT THE FUNCTION ---
exports.api = onRequest({ maxInstances: 10 }, app);