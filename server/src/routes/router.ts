import { Router } from 'express';
import BioMarkerRouter from '../api/biomarkers/biomarker.router';
import UserRouter from '../api/users/user.router';
import TreRouter from '../api/tre/tre.router';
import DatasetRouter from '../api/datasets/dataset.router';
import { isAuthenticated } from '../middlewares/auth';
const router = Router();

router.use('/bioMarkers', isAuthenticated, BioMarkerRouter);
router.use('/tre', isAuthenticated, TreRouter);
router.use('/auth', UserRouter);
router.use('/datasets', DatasetRouter);

export default router;