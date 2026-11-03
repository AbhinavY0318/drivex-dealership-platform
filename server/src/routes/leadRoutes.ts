import { Router } from 'express';
import { LeadController } from '../controllers/leadController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public enquiry creation
router.post('/', LeadController.createLead);

// Protected Staff routes (Consultant & Admin)
router.use(authenticate, authorize('SALES_CONSULTANT', 'ADMIN'));

router.get('/', LeadController.getAllLeads);
router.get('/analytics', LeadController.getLeadAnalytics);
router.get('/:id', LeadController.getLeadById);
router.patch('/:id/status', LeadController.updateStatus);
router.patch('/:id/assign', LeadController.reassignLead);
router.patch('/:id/ai-draft', LeadController.updateAiDraft);
router.post('/:id/ai-draft/regenerate', LeadController.regenerateAiDraft);

export default router;
