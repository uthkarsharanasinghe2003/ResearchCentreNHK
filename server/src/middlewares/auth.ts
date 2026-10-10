import { NextFunction, Request, Response } from "express";
import * as admin from 'firebase-admin';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const {authorization} = req.headers;
    if (!authorization) {
        return res.status(401).json({
            success: false, error: 'Token not provided'
        });
        //return next(new UnauthorizedErro('Token not provided'));
    }

    if (authorization.indexOf('Bearer ') !== 0) {
        return res.status(401).json({
            success: false, error: 'Invalid token'
        });
    }

    try {
        const _token = authorization.split(" ")[1];
        let res = await admin.auth().verifyIdToken(_token);
        req.user = res as any;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false, error: 'Token could not be verified'
        });

    }
}