import { Router } from 'express';
import multer from 'multer';
import * as DatasetController from './dataset.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post('/upload', upload.single('file'), DatasetController.uploadDataset);
router.get('/', DatasetController.listDatasets);
router.get('/:id', DatasetController.getDataset);
router.put('/:id', DatasetController.updateDataset);
router.delete('/:id', DatasetController.deleteDataset);

export default router;
