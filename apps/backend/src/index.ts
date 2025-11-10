import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";

dotenv.config();

// Use absolute path for serviceAccountKey.json to work in both dev and Docker
const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 5000;

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
