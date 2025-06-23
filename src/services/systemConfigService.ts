import api from '../api/api';

export interface SystemConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export class SystemConfigService {
  private static readonly BASE_URL = '/system-config.php';

  /**
   * Get all system configurations
   */
  static async getAllConfigs(): Promise<SystemConfig[]> {
    const response = await api.get(this.BASE_URL);
    return response.data;
  }

  /**
   * Get a specific configuration by key
   */
  static async getConfig(key: string): Promise<SystemConfig> {
    const response = await api.get(`${this.BASE_URL}?key=${encodeURIComponent(key)}`);
    return response.data;
  }

  /**
   * Update a configuration value (admin only)
   */
  static async updateConfig(key: string, value: string): Promise<void> {
    await api.put(`${this.BASE_URL}?key=${encodeURIComponent(key)}`, {
      config_value: value
    });
  }

  /**
   * Check if betting is locked
   */
  static async isBettingLocked(): Promise<boolean> {
    try {
      const config = await this.getConfig('bets_locked');
      return config.config_value === 'true';
    } catch (error) {
      console.error('Error checking betting lock status:', error);
      // Default to locked if we can't determine the status
      return true;
    }
  }

  /**
   * Set betting lock status (admin only)
   */
  static async setBettingLocked(locked: boolean): Promise<void> {
    await this.updateConfig('bets_locked', locked ? 'true' : 'false');
  }
}
