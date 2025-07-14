import api from '../api/api';

export interface KnockoutScoringConfig {
  id: number;
  match_type: 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
  points_per_correct_team: number;
  active: boolean; // Added active field
  description?: string; // Nytt fält för beskrivning/hjälptext
  created_at: string;
  updated_at: string;
}

export class KnockoutScoringConfigService {
  private static readonly BASE_URL = '/knockout-scoring-config.php';

  /**
   * Get all knockout scoring configurations
   */
  static async getAllConfigs(): Promise<KnockoutScoringConfig[]> {
    const response = await api.get(this.BASE_URL);
    return response.data;
  }

  /**
   * Update knockout scoring configurations (admin only)
   */
  static async updateConfigs(configs: Partial<KnockoutScoringConfig>[]): Promise<void> {
    await api.put(this.BASE_URL, {
      configs: configs
    });
  }
}
