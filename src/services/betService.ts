import api from '../api/api';
import { Bet, CreateBetDto } from '../types/models';

interface BetWithMatch extends Bet {
    userName?: string;
    userImageUrl?: string;
    match: {
        id: number;
        matchTime: Date;
        matchType: string;
        group?: string;
        homeScore?: number;
        awayScore?: number;
        homeTeam?: {
            id: number;
            name: string;
            flag?: string;
        };
        awayTeam?: {
            id: number;
            name: string;
            flag?: string;
        };
    };
}

export const betService = {
    async getUserBets(): Promise<BetWithMatch[]> {
        const response = await api.get('/bets.php?action=my-bets');
        return response.data;
    },

    async createOrUpdateBet(betData: CreateBetDto): Promise<Bet> {
        const response = await api.post('/bets.php', betData);
        return response.data;
    },

    async deleteBet(betId: number): Promise<void> {
        await api.delete(`/bets.php?id=${betId}`);
    },

    async getBetsByMatch(matchId: number): Promise<Bet[]> {
        const response = await api.get(`/bets.php?action=match&matchId=${matchId}`);
        return response.data;
    },

    async getPublicBetsByMatch(matchId: number): Promise<Array<Bet & { userName: string; userImageUrl?: string }>> {
        const response = await api.get(`/bets.php?action=public&matchId=${matchId}`);
        return response.data;
    },

    async getUserBetsById(userId: number): Promise<BetWithMatch[]> {
        const response = await api.get(`/bets.php?action=user&userId=${userId}`);
        return response.data;
    }
};