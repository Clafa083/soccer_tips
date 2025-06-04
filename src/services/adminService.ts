import api from '../api/api';
import { KnockoutScoringConfig, UpdateKnockoutScoringDto } from '../types/models';

interface User {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    isAdmin: boolean;
    createdAt: Date;
    totalBets: number;
    totalPoints: number;
}

interface LeaderboardEntry {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    createdAt: Date;
    totalPoints: number;
    totalBets: number;
}

interface BettingStats {
    totalUsers: number;
    totalMatches: number;
    totalBets: number;
    finishedMatches: number;
    averagePoints: number | string | null;
    topScorer: {
        name: string;
        totalPoints: number;
    } | null;
}

export const adminService = {
    async calculateAllPoints(): Promise<{ message: string; updatedBets: number; finishedMatches: number }> {
        const response = await api.post('/admin/calculate-points');
        return response.data;
    },

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const response = await api.get('/admin/leaderboard');
        return response.data;
    },

    async getAllUsers(): Promise<User[]> {
        const response = await api.get('/admin/users');
        return response.data;
    },    async deleteUser(userId: number): Promise<void> {
        await api.delete(`/admin/users/${userId}`);
    },

    async updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<void> {
        await api.put(`/admin/users/${userId}/admin-status`, { isAdmin });
    },

    async getBettingStats(): Promise<BettingStats> {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    async getBetsLocked(): Promise<boolean> {
        const response = await api.get('/admin/bets-locked');
        return response.data.betsLocked;
    },
    async setBetsLocked(betsLocked: boolean): Promise<void> {
        await api.post('/admin/bets-locked', { betsLocked });
    },

    async getKnockoutScoringConfig(): Promise<KnockoutScoringConfig[]> {
        const response = await api.get('/admin/knockout-scoring');
        return response.data;
    },

    async updateKnockoutScoringConfig(config: UpdateKnockoutScoringDto): Promise<KnockoutScoringConfig[]> {
        const response = await api.put('/admin/knockout-scoring', config);
        return response.data;
    }
};