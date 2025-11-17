import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";

dotenv.config();

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_JSON) {
  // Running in Firebase App Hosting
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
} else {
  // Local development
  const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
  serviceAccount = require(serviceAccountPath);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const app = express();
const port = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

const getCurrentDay = async () => {
  const snapshot = await db.collection("questions").orderBy("day").get();
  const now = new Date();

  const unlockedCount = snapshot.docs.filter(doc => {
    const d = doc.data().unlockDate?.toDate();
    return d && d <= now;
  }).length;

  return Math.max(1, unlockedCount);
};

// Make db and getCurrentDay available to routes
app.locals.db = db;
app.locals.getCurrentDay = getCurrentDay;

// Use split routes
app.use(authRoutes);
app.use(questionRoutes);
app.use(leaderboardRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
