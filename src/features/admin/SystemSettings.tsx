import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Alert, 
  CircularProgress,
  Divider
} from '@mui/material';
import { SystemConfigService, SystemConfig } from '../../services/systemConfigService';

export const SystemSettings: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await SystemConfigService.getAllConfigs();
      setConfigs(data);
      setError(null);
    } catch (err) {
      console.error('Error loading system configs:', err);
      setError('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleBettingLockChange = async (checked: boolean) => {
    try {
      setUpdating('bets_locked');
      setError(null);
      setSuccess(null);
      
      await SystemConfigService.setBettingLocked(checked);
      
      // Update local state
      setConfigs(prev => prev.map(config => 
        config.config_key === 'bets_locked' 
          ? { ...config, config_value: checked ? 'true' : 'false' }
          : config
      ));
      
      setSuccess(`Betting ${checked ? 'locked' : 'unlocked'} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating betting lock:', err);
      setError('Failed to update betting lock status');
    } finally {
      setUpdating(null);
    }
  };

  const getBooleanValue = (config: SystemConfig): boolean => {
    return config.config_value === 'true';
  };

  const betsLockedConfig = configs.find(c => c.config_key === 'bets_locked');
  const tournamentNameConfig = configs.find(c => c.config_key === 'tournament_name');
  const appVersionConfig = configs.find(c => c.config_key === 'app_version');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Betting Control */}
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box flex={1} minWidth="300px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Betting Control
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Control whether users can place or modify their match bets and special bets
                </Typography>
                
                {betsLockedConfig && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!getBooleanValue(betsLockedConfig)}
                        onChange={(e) => handleBettingLockChange(!e.target.checked)}
                        disabled={updating === 'bets_locked'}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          Allow Betting
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getBooleanValue(betsLockedConfig) 
                            ? 'All betting is currently locked (match bets and special bets)' 
                            : 'All betting is currently allowed (match bets and special bets)'
                          }
                        </Typography>
                      </Box>
                    }
                  />
                )}
                
                {updating === 'bets_locked' && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Updating...</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Tournament Info */}
          <Box flex={1} minWidth="300px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tournament Information
                </Typography>
                
                {tournamentNameConfig && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Tournament Name
                    </Typography>
                    <Typography variant="body1">
                      {tournamentNameConfig.config_value}
                    </Typography>
                  </Box>
                )}
                
                {appVersionConfig && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      App Version
                    </Typography>
                    <Typography variant="body1">
                      {appVersionConfig.config_value}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* All Configurations */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All System Configurations
            </Typography>
            
            {configs.map((config, index) => (
              <Box key={config.id}>
                <Box py={1}>
                  <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="flex-start">
                    <Box minWidth="150px">
                      <Typography variant="body2" color="text.secondary">
                        {config.config_key}
                      </Typography>
                    </Box>
                    <Box minWidth="150px">
                      <Typography variant="body1">
                        {config.config_value}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < configs.length - 1 && <Divider />}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>  );
};

export default SystemSettings;
