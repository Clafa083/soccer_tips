import api from '../api/api';

export const knockoutPredictionService = {
  async getTeams() {
    const response = await api.get('/teams.php');
    return response.data;
  },
  async getPredictions(userId: number) {
    const response = await api.get('/knockout-predictions.php', {
      params: { user_id: userId }
    });
    return response.data;
  },
  async savePredictions(userId: number, predictions: Record<string, number[]>) {
    const response = await api.post('/knockout-predictions.php', {
      user_id: userId,
      predictions
    });
    return response.data;
  }
};
