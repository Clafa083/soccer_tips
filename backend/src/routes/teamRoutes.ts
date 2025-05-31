import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
    getAllTeams,
    getTeamsByGroup,
    createTeam,
    updateTeam,
    deleteTeam
} from '../controllers/teamController';

const router = Router();

// Public routes
router.get('/', getAllTeams);
router.get('/group/:group', getTeamsByGroup);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createTeam);
router.put('/:id', authenticateToken, requireAdmin, updateTeam);
router.delete('/:id', authenticateToken, requireAdmin, deleteTeam);

export default router;