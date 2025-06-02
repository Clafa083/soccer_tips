import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as teamController from '../controllers/teamController';

const router = Router();

// Public routes
router.get('/', teamController.getAllTeams);
router.get('/group/:group', teamController.getTeamsByGroup);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, teamController.createTeam);
router.put('/:id', authenticateToken, requireAdmin, teamController.updateTeam);
router.delete('/:id', authenticateToken, requireAdmin, teamController.deleteTeam);

export default router;