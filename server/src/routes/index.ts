import { Router } from 'express';
import authRoutes from './authRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import usedVehicleRoutes from './usedVehicleRoutes.js';
import leadRoutes from './leadRoutes.js';
import testDriveRoutes from './testDriveRoutes.js';
import showroomRoutes from './showroomRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DriveX Automotive Dealership API',
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/used-vehicles', usedVehicleRoutes);
router.use('/leads', leadRoutes);
router.use('/test-drives', testDriveRoutes);
router.use('/showrooms', showroomRoutes);
router.use('/admin', adminRoutes);

export default router;
