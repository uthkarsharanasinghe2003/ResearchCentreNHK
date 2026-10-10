import { Router } from "express";
import * as BiomarkerController from "./biomarker.controller";

const router = Router();

router.post('/', BiomarkerController.createBioMarker);
router.get('/', BiomarkerController.getBioMarkers);
router.get('/:id', BiomarkerController.getBioMarker);
router.put('/:id/status', BiomarkerController.updateStatus);

export default router;