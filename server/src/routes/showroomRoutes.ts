import { Router } from 'express';
import { ShowroomController } from '../controllers/showroomController.js';

const router = Router();

router.get('/', ShowroomController.getAllShowrooms);
router.get('/:id', ShowroomController.getShowroomById);

export default router;
