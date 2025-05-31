import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
    getUserBets,
    getBetsByMatch,
    createOrUpdateBet,
    deleteBet
} from '../controllers/betController';

const router = Router();

// Protected routes - user must be authenticated
router.get('/my-bets', authenticateToken, getUserBets);
router.post('/', authenticateToken, createOrUpdateBet);
router.delete('/:id', authenticateToken, deleteBet);

// Admin routes
router.get('/match/:matchId', authenticateToken, requireAdmin, getBetsByMatch);

export default router;