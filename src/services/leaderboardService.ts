import api from '../api/api';

interface LeaderboardEntry {
    id: number;
    username: string;
    name: string;
    email: string;
    image_url?: string;
    total_points: number;
    total_bets: number;
    rank: number;
    created_at: string;
}

interface LeaderboardStats {
    totalUsers: number;
    totalBets: number;
    averagePoints: number;
    topScorer: LeaderboardEntry | null;
}

export const leaderboardService = {
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const response = await api.get('/leaderboard.php');
        return response.data;
    },

    async getLeaderboardStats(): Promise<LeaderboardStats> {
        const response = await api.get('/leaderboard.php?stats=1');
        return response.data;
    }
};
