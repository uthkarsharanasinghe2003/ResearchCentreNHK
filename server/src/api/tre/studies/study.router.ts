import { Router } from "express";
import * as StudyController from "./study.controller";

const router = Router();

router.post('/', StudyController.createStudy);
router.get('/', StudyController.getStudies);
router.get('/results', StudyController.getResults);
router.post('/results', StudyController.getAdvancedResults);
router.post('/results/download', StudyController.downloadResults);
router.get('/results/:id', StudyController.getResult);
router.put('/results/:id', StudyController.changeResultStatus);
router.get('/:id', StudyController.getStudy);
router.put('/:id/variables/order', StudyController.updateStudyVariablesOrder);
router.put('/:id', StudyController.updateStudy);
router.post('/:id/template', StudyController.downloadTemplate);
router.get('/:id/eligible-users', StudyController.getEligbleUsers);
router.put('/:id/members', StudyController.addMemberToStudy);
router.post('/:id/results/validate', StudyController.validateUniqueVariables);
router.post('/:id/results', StudyController.createResult);
router.delete('/:id/results/:resultId', StudyController.deleteResult);
router.post('/:id/results-bulk', StudyController.createResults);

export default router;