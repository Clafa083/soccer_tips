import { Router } from 'express';
import { getLeaderboard } from '../controllers/adminController';

const router = Router();

// Public leaderboard endpoint - no authentication required
router.get('/', getLeaderboard);

export default router;
