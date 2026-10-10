import { Router } from 'express';
import StudyRouter from './studies/study.router'

const router = Router();

router.use('/studies', StudyRouter);

export default router;