import express, { Request, Response } from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware';

dotenv.config();

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
	res.json({ message: 'This is a protected route.' });
});

// Interface for question data
interface QuestionData {
	id: string;
	question: string;
	clue: string;
	answer: string;
	difficulty: number;
	image: string;
}

// ✅ Route: Get the current question from Firebase (protected)
app.get("/play", authMiddleware, async (req: Request, res: Response) => {
	try {
		const questionsRef = db.collection('questions');
		const snapshot = await questionsRef.get();
		
		if (snapshot.empty) {
			return res.status(404).json({ error: 'No questions found in database' });
		}
		
		const questions = snapshot.docs.map(doc => ({ 
			id: doc.id, 
			...doc.data() 
		})) as QuestionData[];
		
		// Get the first (and only) question - you can change this in Firebase as needed
		const question = questions[0];
		
		res.json({
			id: question.id,
			question: question.question,
			hint: question.clue,
		});
	} catch (error) {
		console.error('Error fetching question:', error);
		res.status(500).json({ error: 'Failed to fetch question' });
	}
});

// ✅ Route: Submit answer (protected)
app.post("/play/submit", authMiddleware, async (req: Request, res: Response) => {
	const { id, answer } = req.body;
	
	// Validate request body
	if (!id || !answer) {
		return res.status(400).json({ result: "Missing question ID or answer" });
	}
	
	try {
		const questionDoc = await db.collection('questions').doc(id).get();
		
		if (!questionDoc.exists) {
			return res.status(400).json({ result: "Invalid Question ID" });
		}
		
		const questionData = questionDoc.data();
		
		if (!questionData?.answer) {
			return res.status(500).json({ result: "Question data is corrupted" });
		}
		
		// Compare answers (case-insensitive, trimmed)
		if (answer.trim().toLowerCase() === questionData.answer.trim().toLowerCase()) {
			return res.json({ result: "Success 🎉 Correct Answer!" });
		} else {
			return res.json({ result: "Fail ❌ Wrong Answer!" });
		}
	} catch (error) {
		console.error('Error validating answer:', error);
		res.status(500).json({ result: "Error validating answer" });
	}
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});