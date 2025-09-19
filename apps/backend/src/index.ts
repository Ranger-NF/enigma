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

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
	res.json({ message: 'This is a protected route.' });
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
