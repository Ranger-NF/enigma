import dotenv from "dotenv";
import cors from "cors";
import express, { Application, Response, Request } from 'express';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";

dotenv.config();

const firebaseConfig = {
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_BUCKET,
	messagingSenderId: process.env.MESSAGING_SENDER_ID,
	appId: process.env.APP_ID,
	measurementId: process.env.MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const router: Application = express();
const port = process.env.PORT || 8000;

router.use(cors<Request>());
router.use(express.json());

router.get('/', (req: Request, res: Response) => {
	res.send('Hello world');
});

router.post('/data', async (req: Request, res: Response) => {
	console.log('Saved: ', req.body.data);
	saveToDB(req.body.data);
});

router.listen(port, () => {
	console.log(`Server is on at http://localhost:${port}`);
});

async function saveToDB(s: string) {
	try {
		const docRef = await addDoc(collection(db, "input"), {
			submitted: s,
		});

		console.log("Document written with ID: ", docRef.id);
	} catch (e) {
		console.error("Error: ", e);
	}
}
