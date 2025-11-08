import { Router, Request, Response } from "express";
import admin from "firebase-admin";

const router = Router();

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  completedAt: admin.firestore.Timestamp;
  rank: number;
}

router.get("/leaderboard/:day", async (req: Request, res: Response) => {
  const { db } = req.app.locals;
  try {
    const day = parseInt(req.params.day);

    if (isNaN(day) || day < 1 || day > 10) {
      return res.status(400).json({ error: "Invalid day number" });
    }

    const usersRef = db.collection("users");
    const q = usersRef
      .where(`completed.day${day}.done`, "==", true)
      .orderBy(`completed.day${day}.timestamp`, "asc")
      .limit(10);

    const querySnapshot = await q.get();
    const leaderboard: LeaderboardEntry[] = [];

    querySnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const userData = doc.data();
      const completedData = userData.completed[`day${day}`];

      if (completedData?.timestamp) {
        leaderboard.push({
          id: doc.id,
          name: userData.name,
          email: userData.email,
          completedAt: completedData.timestamp,
          rank: leaderboard.length + 1,
        });
      }
    });

    res.json({ leaderboard, day });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/leaderboard", async (req: Request, res: Response) => {
  const { getCurrentDay } = req.app.locals;
  const currentDay = getCurrentDay();
  return res.redirect(`/leaderboard/${currentDay}`);
});

export default router;
