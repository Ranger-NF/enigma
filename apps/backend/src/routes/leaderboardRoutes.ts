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

    // Determine maximum configured day from questions collection.
    // Fallback to 30 if questions collection is empty or field missing.
    const maxSnap = await db
      .collection('questions')
      .orderBy('day', 'desc')
      .limit(1)
      .get();
    let maxDay = 30;
    if (!maxSnap.empty) {
      const doc = maxSnap.docs[0];
      const data = doc.data();
      if (typeof data.day === 'number') {
        maxDay = data.day;
      } else {
        // try to infer from doc id like 'day12'
        const m = doc.id.match(/day(\d+)/i);
        if (m) maxDay = parseInt(m[1], 10) || maxDay;
      }
    }

    if (isNaN(day) || day < 1 || day > maxDay) {
      return res.status(400).json({ error: 'Invalid day number', maxDay });
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
  const { db } = req.app.locals;

  try {
    // Find the latest day where at least ONE user has completed it
    // Determine maximum configured day from questions collection.
    const maxSnap2 = await db
      .collection('questions')
      .orderBy('day', 'desc')
      .limit(1)
      .get();
    let maxDay2 = 30;
    if (!maxSnap2.empty) {
      const doc = maxSnap2.docs[0];
      const data = doc.data();
      if (typeof data.day === 'number') {
        maxDay2 = data.day;
      } else {
        const m = doc.id.match(/day(\d+)/i);
        if (m) maxDay2 = parseInt(m[1], 10) || maxDay2;
      }
    }

    // Find latest day with at least one completed user
    for (let d = maxDay2; d >= 1; d--) {
      const snap = await db
        .collection('users')
        .where(`completed.day${d}.done`, '==', true)
        .limit(1)
        .get();

      if (!snap.empty) {
        return res.redirect(`/leaderboard/${d}`);
      }
    }

    // fallback
    return res.redirect('/leaderboard/1');
  } catch (err) {
    console.error("Leaderboard redirect failed", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

export default router;
