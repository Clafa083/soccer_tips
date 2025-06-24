import api from '../api/api';
import { UserBetsData, MatchBetsData } from '../types/models';

export const publicService = {
  // Get all bets for a specific match (public)
  async getMatchBets(matchId: number): Promise<MatchBetsData> {
    const response = await api.get(`/public.php?action=match-bets&match_id=${matchId}`);
    return response.data;
  },

  // Get detailed bets for a specific user (public)
  async getUserBets(userId: number): Promise<UserBetsData> {
    const response = await api.get(`/public.php?action=user-bets&user_id=${userId}`);
    return response.data;
  }
};
