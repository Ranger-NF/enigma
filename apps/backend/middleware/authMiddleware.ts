import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const { authorization } = req.headers;

	if (!authorization || !authorization.startsWith('Bearer ')) {
		return res.status(401).send({ message: 'Unauthorized' });
	}

	const idToken = authorization.split('Bearer ')[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		(req as any).user = decodedToken;
		next();
	} catch (error) {
		return res.status(401).send({ message: 'Unauthorized' });
	}
};

export default authMiddleware;
