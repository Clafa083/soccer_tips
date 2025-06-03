import { Router } from 'express';
import { getAllPosts, createPost, deletePost } from '../controllers/forumController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all forum posts (public endpoint)
router.get('/', getAllPosts);

// Create a new forum post (requires authentication)
router.post('/', authenticateToken, createPost);

// Delete a forum post (requires authentication)
router.delete('/:id', authenticateToken, deletePost);

export default router;
