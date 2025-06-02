import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
    calculateAllPoints,
    getLeaderboard,
    getAllUsers,
    deleteUser,
    getBettingStats,
    getBetsLocked,
    setBetsLocked
} from '../controllers/adminController';

const router = Router();

// All admin routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Point calculation
router.post('/calculate-points', calculateAllPoints);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Statistics and leaderboard
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getBettingStats);

// Betting lock endpoints
router.get('/bets-locked', function(req, res) { void getBetsLocked(req, res); });
router.post('/bets-locked', function(req, res) { void setBetsLocked(req, res); });

export default router;