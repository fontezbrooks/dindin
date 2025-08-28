import type { NextFunction, Request, Response } from "express";
import { auth } from "./auth";
import logger from "./logger";

export interface AuthenticatedRequest extends Request {
	user: {
		id: string;
		email: string;
		name: string;
	};
}

export const authMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Authorization token required" });
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Verify token using the auth library
		const session = await auth.api.getSession({
			headers: {
				authorization: authHeader,
			},
		} as any);

		if (!session) {
			return res.status(401).json({ error: "Invalid or expired token" });
		}

		req.user = {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
		};

		next();
	} catch (error) {
		logger.error("Auth middleware error:", error);
		return res.status(401).json({ error: "Authentication failed" });
	}
};
