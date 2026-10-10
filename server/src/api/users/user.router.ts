import { Router } from "express";
import * as UserController from "./user.controller";
import { isAuthenticated } from "../../middlewares/auth";

const router = Router();

router.post('/register', UserController.createUser);
router.get('/users', isAuthenticated, UserController.getUsers);
router.get('/users/:uid', isAuthenticated, UserController.getUserByUid);


export default router;