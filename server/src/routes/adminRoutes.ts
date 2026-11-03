import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Restrict entire admin router to ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Vehicle inventory management
router.post('/vehicles', AdminController.createVehicleModel);
router.patch('/vehicles/:id', AdminController.updateVehicleModel);
router.post('/variants', AdminController.createVehicleVariant);
router.patch('/variants/:id', AdminController.updateVehicleVariant);

// Dynamic City Pricing
router.get('/pricing', AdminController.getCityPricingList);
router.post('/pricing', AdminController.createCityPricing);
router.patch('/pricing/:id', AdminController.updateCityPricing);

// Certified Used Car Management
router.post('/used-vehicles', AdminController.createUsedVehicle);
router.patch('/used-vehicles/:id', AdminController.updateUsedVehicle);

// Staff & Consultant Workload Management
router.get('/consultants', AdminController.getConsultants);
router.post('/consultants', AdminController.createConsultant);
router.patch('/consultants/:id/availability', AdminController.toggleConsultantAvailability);

// Executive Analytics
router.get('/analytics', AdminController.getExecutiveAnalytics);

export default router;
