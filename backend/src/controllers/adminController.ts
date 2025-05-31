import { Request, Response } from 'express';
import { pool } from '../db/database';
import { mockUsers, mockBets } from '../db/mockDatabase';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const USE_MOCK_DATA = !process.env.DB_HOST || process.env.NODE_ENV === 'development';

// Calculate points for all bets based on match results
export const calculateAllPoints = async (req: Request, res: Response) => {
    if (USE_MOCK_DATA) {
        console.log('Mock point calculation');
        res.json({ 
            message: 'Successfully calculated points for 2 bets (mock data)',
            updatedBets: 2,
            finishedMatches: 2
        });
        return;
    }
    
    const connection = await pool.getConnection();
    
    try {
        // Get all finished matches (with results)
        const [matchesRows] = await connection.execute<RowDataPacket[]>(
            `SELECT id, homeScore, awayScore, matchType FROM matches 
             WHERE homeScore IS NOT NULL AND awayScore IS NOT NULL`
        );
        
        let totalUpdatedBets = 0;
        
        for (const match of matchesRows) {
            // Get all bets for this match
            const [betsRows] = await connection.execute<RowDataPacket[]>(
                'SELECT id, userId, homeScore as betHomeScore, awayScore as betAwayScore FROM bets WHERE matchId = ?',
                [match.id]
            );
            
            for (const bet of betsRows) {
                let points = 0;
                
                // Calculate points based on match type and bet accuracy
                if (match.matchType === 'GROUP') {
                    // Group stage scoring
                    if (bet.betHomeScore === match.homeScore && bet.betAwayScore === match.awayScore) {
                        // Exact score: 3 points
                        points = 3;
                    } else if (
                        (bet.betHomeScore > bet.betAwayScore && match.homeScore > match.awayScore) ||
                        (bet.betHomeScore < bet.betAwayScore && match.homeScore < match.awayScore) ||
                        (bet.betHomeScore === bet.betAwayScore && match.homeScore === match.awayScore)
                    ) {
                        // Correct result (win/draw/loss): 1 point
                        points = 1;
                    }
                    // Wrong result: 0 points
                }
                // For knockout stages, we'd need different logic based on teams advancing
                
                // Update bet with calculated points
                await connection.execute(
                    'UPDATE bets SET points = ? WHERE id = ?',
                    [points, bet.id]
                );
                
                totalUpdatedBets++;
            }
        }
        
        res.json({ 
            message: `Successfully calculated points for ${totalUpdatedBets} bets`,
            updatedBets: totalUpdatedBets,
            finishedMatches: matchesRows.length
        });
        
    } catch (error) {
        console.error('Error calculating points:', error);
        res.status(500).json({ error: 'Failed to calculate points' });
    } finally {
        connection.release();
    }
};

// Get all users with their total points
export const getLeaderboard = async (req: Request, res: Response) => {
    if (USE_MOCK_DATA) {
        console.log('Using mock leaderboard data');
        const leaderboard = mockUsers.filter(u => !u.isAdmin).sort((a, b) => b.totalPoints - a.totalPoints);
        res.json(leaderboard);
        return;
    }
    
    const connection = await pool.getConnection();
    
    try {
        const [rows] = await connection.execute<RowDataPacket[]>(
            `SELECT 
                u.id, u.name, u.email, u.imageUrl, u.createdAt,
                COALESCE(SUM(b.points), 0) as totalPoints,
                COUNT(b.id) as totalBets
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             WHERE u.isAdmin = FALSE
             GROUP BY u.id, u.name, u.email, u.imageUrl, u.createdAt
             ORDER BY totalPoints DESC, u.name ASC`
        );
        
        res.json(rows);
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    } finally {
        connection.release();
    }
};

// Get all users for user management
export const getAllUsers = async (req: Request, res: Response) => {
    if (USE_MOCK_DATA) {
        console.log('Using mock user data');
        res.json(mockUsers);
        return;
    }
    
    const connection = await pool.getConnection();
    
    try {
        const [rows] = await connection.execute<RowDataPacket[]>(
            `SELECT 
                u.id, u.name, u.email, u.imageUrl, u.isAdmin, u.createdAt,
                COUNT(b.id) as totalBets,
                COALESCE(SUM(b.points), 0) as totalPoints
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             GROUP BY u.id, u.name, u.email, u.imageUrl, u.isAdmin, u.createdAt
             ORDER BY u.createdAt DESC`
        );
        
        res.json(rows);
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    } finally {
        connection.release();
    }
};

// Delete a user and all their bets
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
        // Check if user exists and is not an admin
        const [userRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id, isAdmin FROM users WHERE id = ?',
            [id]
        );
        
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (userRows[0].isAdmin) {
            return res.status(400).json({ error: 'Cannot delete admin users' });
        }
        
        // Delete user (bets will be deleted automatically due to foreign key cascade)
        const [result] = await connection.execute<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    } finally {
        connection.release();
    }
};

// Get betting statistics
export const getBettingStats = async (req: Request, res: Response) => {
    if (USE_MOCK_DATA) {
        console.log('Using mock betting stats');
        res.json({
            totalUsers: 1,
            totalMatches: 4,
            totalBets: 2,
            finishedMatches: 2,
            averagePoints: 2.0,
            topScorer: {
                name: 'Test User',
                totalPoints: 7
            }
        });
        return;
    }
    
    const connection = await pool.getConnection();
    
    try {
        // Get overall statistics
        const [statsRows] = await connection.execute<RowDataPacket[]>(
            `SELECT 
                COUNT(DISTINCT u.id) as totalUsers,
                COUNT(DISTINCT m.id) as totalMatches,
                COUNT(b.id) as totalBets,
                COUNT(CASE WHEN m.homeScore IS NOT NULL THEN 1 END) as finishedMatches,
                AVG(CASE WHEN b.points IS NOT NULL THEN b.points END) as averagePoints
             FROM users u
             CROSS JOIN matches m
             LEFT JOIN bets b ON u.id = b.userId AND m.id = b.matchId
             WHERE u.isAdmin = FALSE`
        );
        
        // Get top scorer
        const [topScorerRows] = await connection.execute<RowDataPacket[]>(
            `SELECT u.name, COALESCE(SUM(b.points), 0) as totalPoints
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             WHERE u.isAdmin = FALSE
             GROUP BY u.id, u.name
             ORDER BY totalPoints DESC
             LIMIT 1`
        );
        
        res.json({
            ...statsRows[0],
            topScorer: topScorerRows[0] || null
        });
        
    } catch (error) {
        console.error('Error fetching betting stats:', error);
        res.status(500).json({ error: 'Failed to fetch betting statistics' });
    } finally {
        connection.release();
    }
};