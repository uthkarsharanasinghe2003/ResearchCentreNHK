import { NextFunction, Request, Response } from "express";
import * as UserService from './user.service';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await UserService.createUser(req.body);
        res.status(201);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getUserByUid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await UserService.getUserByUid(req.params.uid);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await UserService.getUsers(req.query);
        res.status(200);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
      next(error);
    }
};