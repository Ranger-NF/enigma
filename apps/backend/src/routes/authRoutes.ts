import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import authMiddleware from "../../middleware/authMiddleware";

const router = Router();

router.get("/api/protected", authMiddleware, (req: Request, res: Response) => {
  res.json({ message: "This is a protected route." });
});

/**
 * POST /user/profile - Create or update user profile
 */
router.post(
  "/user/profile",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db } = req.app.locals;
    const { name, email } = req.body;

    try {
      const userId = (req as any).user.uid;
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        // Create new user
        const newUser = {
          id: userId,
          name: name || "",
          email: email || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          completed: {},
        };
        await userRef.set(newUser);
        res
          .status(201)
          .json({ message: "User created successfully", user: newUser });
      } else {
        // Update existing user
        await userRef.update({
          name: name,
          email: email,
        });
        res.json({ message: "User updated successfully" });
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      res.status(500).json({ error: "Failed to create/update user" });
    }
  },
);

router.get(
  "/user/progress",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db, getCurrentDay } = req.app.locals;
    try {
      const userId = (req as any).user.uid;
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      res.json({
        user: { id: userDoc.id, ...userData },
        currentDay: getCurrentDay(),
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  },
);

export default router;
