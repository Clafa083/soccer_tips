import api from '../api/api';

interface LeaderboardEntry {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    createdAt: Date;
    totalPoints: number;
    totalBets: number;
}

export const leaderboardService = {
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const response = await api.get('/leaderboard.php');
        return response.data;
    }
};
