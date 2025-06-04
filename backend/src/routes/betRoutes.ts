import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as betController from '../controllers/betController';

const router = Router();

// Public routes
router.get('/user/:userId', betController.getUserBetsById);
router.get('/match/:matchId/public', betController.getPublicBetsByMatch);

// Protected routes - user must be authenticated
router.get('/my-bets', authenticateToken, betController.getUserBets);
router.post('/', authenticateToken, betController.createOrUpdateBet);
router.delete('/:id', authenticateToken, betController.deleteBet);

// Admin routes
router.get('/match/:matchId', authenticateToken, requireAdmin, betController.getBetsByMatch);

export default router;