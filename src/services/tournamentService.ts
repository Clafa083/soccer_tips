import { SystemConfigService } from './systemConfigService';

export interface TournamentInfo {
  name: string;
  year: string;
  description: string;
}

export class TournamentService {
  private static tournamentInfo: TournamentInfo | null = null;

  /**
   * Get tournament information from system config
   */
  static async getTournamentInfo(): Promise<TournamentInfo> {
    try {
      const configs = await SystemConfigService.getAllConfigs();
      
      const name = configs.find(c => c.config_key === 'tournament_name')?.config_value || 'VM';
      const year = configs.find(c => c.config_key === 'tournament_year')?.config_value || '2026';
      const description = configs.find(c => c.config_key === 'tournament_description')?.config_value || 'Familjen Fälths officiella tipset';
      
      this.tournamentInfo = { name, year, description };
      return this.tournamentInfo;
    } catch (error) {
      console.error('Error fetching tournament info:', error);
      // Return default values on error
      return {
        name: 'VM',
        year: '2026',
        description: 'Familjen Fälths officiella tipset'
      };
    }
  }

  /**
   * Get cached tournament info (returns null if not loaded)
   */
  static getCachedTournamentInfo(): TournamentInfo | null {
    return this.tournamentInfo;
  }

  /**
   * Get tournament display name (name + year)
   */
  static async getTournamentDisplayName(): Promise<string> {
    const info = await this.getTournamentInfo();
    return `${info.name} ${info.year}`;
  }

  /**
   * Get tournament tip name (name-tipset, e.g. "VM-tipset" or "EM-tipset")
   */
  static async getTournamentTipName(): Promise<string> {
    const info = await this.getTournamentInfo();
    return `${info.name}-tipset`;
  }

  /**
   * Clear cached tournament info (useful after admin updates)
   */
  static clearCache(): void {
    this.tournamentInfo = null;
  }
}
