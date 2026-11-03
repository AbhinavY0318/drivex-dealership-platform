import { Router } from 'express';
import { UsedVehicleController } from '../controllers/usedVehicleController.js';
import { optionalAuthenticate, authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', UsedVehicleController.getAllUsedVehicles);
router.get('/:id', optionalAuthenticate, UsedVehicleController.getUsedVehicleById);
router.get(
  '/:id/price-suggestion',
  authenticate,
  authorize('ADMIN', 'SALES_CONSULTANT'),
  UsedVehicleController.getPriceSuggestion
);

export default router;
