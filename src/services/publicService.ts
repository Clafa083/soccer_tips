import api from '../api/api';
import { UserBetsData, MatchBetsData } from '../types/models';

export interface UserSuggestion {
  id: number;
  username: string;
  name: string;
  image_url?: string;
}

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
  },

  // Sök användare för @-taggning
  async searchUsers(query: string): Promise<UserSuggestion[]> {
    const response = await api.get(`/public.php?action=user-search&query=${encodeURIComponent(query)}`);
    return response.data;
  }
};
