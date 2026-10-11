import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/firebase.service";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ success: false, error: 'Token not provided' });
    }

    if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    try {
        const token = authorization.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token could not be verified' });
    }
};