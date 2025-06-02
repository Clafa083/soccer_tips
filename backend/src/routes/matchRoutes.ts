import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as matchController from '../controllers/matchController';

const router = Router();

// Public routes
router.get('/', matchController.getAllMatches);
router.get('/type/:type', matchController.getMatchesByType);
router.get('/group/:group', matchController.getMatchesByGroup);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, matchController.createMatch);
router.put('/:id/result', authenticateToken, requireAdmin, matchController.updateMatchResult);
router.delete('/:id', authenticateToken, requireAdmin, matchController.deleteMatch);

export default router;