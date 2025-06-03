import { Request, Response } from 'express';
import { devDb } from '../db/DevelopmentDatabaseAdapter';

interface CreateForumPostDto {
    content: string;
}

// Get all forum posts with user information
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    console.log('=== FORUM GET ALL POSTS CALLED ===');
    console.log('Request headers:', req.headers.origin);
    try {
        if (devDb.isUsingMockData()) {
            console.log('Using mock forum posts');
            res.json([
                {
                    id: 1,
                    userId: 1,
                    content: 'Välkommen till VM-tipset! Lycka till alla! ⚽',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    user: {
                        id: 1,
                        name: 'Admin',
                        email: 'admin@vm-tips.se',
                        isAdmin: true
                    }
                },
                {
                    id: 2,
                    userId: 2,
                    content: 'Spännande att tippa VM! Vem tror ni vinner?',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    user: {
                        id: 2,
                        name: 'Test User',
                        email: 'test@vm-tips.se',
                        isAdmin: false
                    }
                }
            ]);
            return;
        }

        console.log('Querying database for forum posts...');
        const result = await devDb.query(
            `SELECT 
                fp.id, fp.userId, fp.content, fp.createdAt, fp.updatedAt,
                u.name as userName, u.email as userEmail, u.imageUrl as userImageUrl, u.isAdmin as userIsAdmin
             FROM forum_posts fp
             JOIN users u ON fp.userId = u.id
             ORDER BY fp.createdAt DESC`
        );

        console.log('Database query result:', result);
        const posts = (result.rows || []).map((row: any) => ({
            id: row.id,
            userId: row.userId,
            content: row.content,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            user: {
                id: row.userId,
                name: row.userName,
                email: row.userEmail,
                imageUrl: row.userImageUrl,
                isAdmin: !!row.userIsAdmin
            }
        }));

        console.log('Formatted posts to send:', posts);
        res.json(posts);
        console.log('✅ Response sent successfully');
        
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        res.status(500).json({ error: 'Failed to fetch forum posts' });
    }
};

// Create a new forum post
export const createPost = async (req: Request, res: Response): Promise<void> => {
    console.log('=== FORUM CREATE POST CALLED ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('User from req.user:', req.user);
    
    const userId = req.user?.userId;
    const { content }: CreateForumPostDto = req.body;

    console.log('Extracted userId:', userId);
    console.log('Extracted content:', content);

    if (!userId) {
        console.log('❌ User not authenticated');
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    if (!content || content.trim().length === 0) {
        console.log('❌ Content is required');
        res.status(400).json({ error: 'Content is required' });
        return;
    }

    if (content.length > 2000) {
        console.log('❌ Content too long');
        res.status(400).json({ error: 'Content too long (max 2000 characters)' });
        return;
    }

    try {
        if (devDb.isUsingMockData()) {
            console.log('Creating mock forum post');
            res.status(201).json({
                id: Math.floor(Math.random() * 1000),
                userId,
                content: content.trim(),
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: userId,
                    name: 'Test User',
                    email: 'test@vm-tips.se',
                    isAdmin: false
                }
            });
            return;
        }

        const insertResult = await devDb.query(
            'INSERT INTO forum_posts (userId, content, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [userId, content.trim()]
        );

        // Get the created post with user information
        const postResult = await devDb.query(
            `SELECT 
                fp.id, fp.userId, fp.content, fp.createdAt, fp.updatedAt,
                u.name as userName, u.email as userEmail, u.imageUrl as userImageUrl, u.isAdmin as userIsAdmin
             FROM forum_posts fp
             JOIN users u ON fp.userId = u.id
             WHERE fp.id = ?`,
            [insertResult.metadata?.insertId]
        );

        if (!postResult.rows || postResult.rows.length === 0) {
            res.status(500).json({ error: 'Failed to retrieve created post' });
            return;
        }

        const row = postResult.rows[0];
        const newPost = {
            id: row.id,
            userId: row.userId,
            content: row.content,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            user: {
                id: row.userId,
                name: row.userName,
                email: row.userEmail,
                imageUrl: row.userImageUrl,
                isAdmin: !!row.userIsAdmin
            }
        };

        res.status(201).json(newPost);
        
    } catch (error) {
        console.error('Error creating forum post:', error);
        res.status(500).json({ error: 'Failed to create forum post' });
    }
};

// Delete a forum post (only by the author or admin)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const isAdmin = req.user?.isAdmin;
    const postId = parseInt(req.params.id, 10);

    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    if (isNaN(postId)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
    }

    try {
        if (devDb.isUsingMockData()) {
            console.log('Deleting mock forum post');
            res.json({ message: 'Forum post deleted successfully' });
            return;
        }

        // Check if post exists and get the author
        const postResult = await devDb.query(
            'SELECT userId FROM forum_posts WHERE id = ?',
            [postId]
        );

        if (!postResult.rows || postResult.rows.length === 0) {
            res.status(404).json({ error: 'Forum post not found' });
            return;
        }

        const postUserId = postResult.rows[0].userId;

        // Check if user is authorized to delete (author or admin)
        if (postUserId !== userId && !isAdmin) {
            res.status(403).json({ error: 'Not authorized to delete this post' });
            return;
        }

        // Delete the post
        const deleteResult = await devDb.query(
            'DELETE FROM forum_posts WHERE id = ?',
            [postId]
        );

        if (deleteResult.metadata?.affectedRows === 0) {
            res.status(404).json({ error: 'Forum post not found' });
            return;
        }

        res.json({ message: 'Forum post deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting forum post:', error);
        res.status(500).json({ error: 'Failed to delete forum post' });
    }
};
