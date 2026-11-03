import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController.js';

const router = Router();

router.get('/', VehicleController.getAllModels);
router.get('/:slug', VehicleController.getModelBySlug);
router.get('/variant/:variantId/pricing', VehicleController.getVariantPricing);
router.post('/emi-calculator', VehicleController.calculateEMI);

export default router;
