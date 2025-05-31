import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
    getAllMatches,
    getMatchesByType,
    getMatchesByGroup,
    createMatch,
    updateMatchResult,
    deleteMatch
} from '../controllers/matchController';

const router = Router();

// Public routes
router.get('/', getAllMatches);
router.get('/type/:type', getMatchesByType);
router.get('/group/:group', getMatchesByGroup);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createMatch);
router.put('/:id/result', authenticateToken, requireAdmin, updateMatchResult);
router.delete('/:id', authenticateToken, requireAdmin, deleteMatch);

export default router;