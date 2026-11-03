import { Router } from 'express';
import { TestDriveController } from '../controllers/testDriveController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Buyer availability & booking
router.get('/availability', TestDriveController.getAvailability);
router.post('/', optionalAuthenticate, TestDriveController.bookTestDrive);

// Logged-in buyer bookings
router.get('/my-bookings', authenticate, TestDriveController.getMyBookings);

// Consultant / Admin appointment management
router.get(
  '/consultant-bookings',
  authenticate,
  authorize('SALES_CONSULTANT', 'ADMIN'),
  TestDriveController.getConsultantBookings
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('SALES_CONSULTANT', 'ADMIN'),
  TestDriveController.updateStatus
);

export default router;
