import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
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
  serviceAccount = require("../serviceAccountKey.json");
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

// Utility function
const getCurrentDay = (): number => {
  const startDate = new Date("2025-09-30");
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays, 1), 10);
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
