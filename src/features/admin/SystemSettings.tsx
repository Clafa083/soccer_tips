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
  Divider,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { SystemConfigService, SystemConfig } from '../../services/systemConfigService';
import { KnockoutScoringConfigService, KnockoutScoringConfig } from '../../services/knockoutScoringConfigService';
import { TournamentService } from '../../services/tournamentService';
import { usePageTitle } from '../../hooks/usePageTitle';

export const SystemSettings: React.FC = () => {
  usePageTitle('Systeminställningar');
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // State for editing tournament information
  const [editingTournament, setEditingTournament] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentYear, setTournamentYear] = useState('');
  const [tournamentDescription, setTournamentDescription] = useState('');

  // State for knockout scoring config
  const [knockoutConfigs, setKnockoutConfigs] = useState<KnockoutScoringConfig[]>([]);
  const [editingKnockout, setEditingKnockout] = useState(false);
  const [knockoutConfigValues, setKnockoutConfigValues] = useState<{ [key: number]: number }>({});

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const [data, knockoutData] = await Promise.all([
        SystemConfigService.getAllConfigs(),
        KnockoutScoringConfigService.getAllConfigs()
      ]);
      
      setConfigs(data);
      setKnockoutConfigs(knockoutData);
      
      // Populate tournament information
      const nameConfig = data.find(c => c.config_key === 'tournament_name');
      const yearConfig = data.find(c => c.config_key === 'tournament_year');
      const descConfig = data.find(c => c.config_key === 'tournament_description');
      
      setTournamentName(nameConfig?.config_value || '');
      setTournamentYear(yearConfig?.config_value || '');
      setTournamentDescription(descConfig?.config_value || '');
      
      // Populate knockout config values
      const knockoutValues: { [key: number]: number } = {};
      knockoutData.forEach(config => {
        knockoutValues[config.id] = config.points_per_correct_team;
      });
      setKnockoutConfigValues(knockoutValues);
      
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

  const handleEditTournament = () => {
    setEditingTournament(true);
  };

  const handleCancelEditTournament = () => {
    setEditingTournament(false);
    // Reset to original values
    const nameConfig = configs.find(c => c.config_key === 'tournament_name');
    const yearConfig = configs.find(c => c.config_key === 'tournament_year');
    const descConfig = configs.find(c => c.config_key === 'tournament_description');
    
    setTournamentName(nameConfig?.config_value || '');
    setTournamentYear(yearConfig?.config_value || '');
    setTournamentDescription(descConfig?.config_value || '');
  };

  const handleSaveTournament = async () => {
    try {
      setUpdating('tournament_info');
      setError(null);
      setSuccess(null);

      // Save all tournament-related configs
      await Promise.all([
        SystemConfigService.setConfig('tournament_name', tournamentName),
        SystemConfigService.setConfig('tournament_year', tournamentYear),
        SystemConfigService.setConfig('tournament_description', tournamentDescription)
      ]);

      // Reload configs to update state
      await loadConfigs();
      setEditingTournament(false);
      setSuccess('Tournament information updated successfully');
      
      // Clear tournament service cache so the new info is used throughout the app
      TournamentService.clearCache();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating tournament info:', err);
      setError('Failed to update tournament information');
    } finally {
      setUpdating(null);
    }
  };

  const handleEditKnockout = () => {
    setEditingKnockout(true);
  };

  const handleCancelEditKnockout = () => {
    setEditingKnockout(false);
    // Reset to original values
    const knockoutValues: { [key: number]: number } = {};
    knockoutConfigs.forEach(config => {
      knockoutValues[config.id] = config.points_per_correct_team;
    });
    setKnockoutConfigValues(knockoutValues);
  };

  const handleKnockoutValueChange = (configId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setKnockoutConfigValues(prev => ({
      ...prev,
      [configId]: numValue
    }));
  };

  const handleSaveKnockout = async () => {
    try {
      setUpdating('knockout_config');
      setError(null);
      setSuccess(null);

      // Prepare configs for update
      const configsToUpdate = Object.entries(knockoutConfigValues).map(([configId, points]) => ({
        id: parseInt(configId),
        points_per_correct_team: points
      }));

      // Save all knockout config values
      await KnockoutScoringConfigService.updateConfigs(configsToUpdate);

      // Reload configs to update state
      await loadConfigs();
      setEditingKnockout(false);
      setSuccess('Knockout scoring configuration updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error updating knockout config:', err);
      setError('Failed to update knockout scoring configuration');
    } finally {
      setUpdating(null);
    }
  };

  const betsLockedConfig = configs.find(c => c.config_key === 'bets_locked');
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Tournament Information
                  </Typography>
                  {!editingTournament && (
                    <IconButton onClick={handleEditTournament} size="small">
                      <Edit />
                    </IconButton>
                  )}
                </Box>
                
                {editingTournament ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Tournament Name"
                      value={tournamentName}
                      onChange={(e) => setTournamentName(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Tournament Year"
                      value={tournamentYear}
                      onChange={(e) => setTournamentYear(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Tournament Description"
                      value={tournamentDescription}
                      onChange={(e) => setTournamentDescription(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                    />
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button 
                        size="small" 
                        onClick={handleCancelEditTournament}
                        disabled={updating === 'tournament_info'}
                      >
                        <Cancel sx={{ mr: 0.5 }} />
                        Cancel
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={handleSaveTournament}
                        disabled={updating === 'tournament_info'}
                      >
                        <Save sx={{ mr: 0.5 }} />
                        Save
                      </Button>
                    </Box>
                    {updating === 'tournament_info' && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">Updating...</Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Tournament Name
                      </Typography>
                      <Typography variant="body1">
                        {tournamentName || 'Not set'}
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Tournament Year
                      </Typography>
                      <Typography variant="body1">
                        {tournamentYear || 'Not set'}
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Tournament Description
                      </Typography>
                      <Typography variant="body1">
                        {tournamentDescription || 'Not set'}
                      </Typography>
                    </Box>
                    
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
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Knockout Scoring Configuration */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Knockout Scoring Configuration
              </Typography>
              {!editingKnockout && (
                <IconButton onClick={handleEditKnockout} size="small">
                  <Edit />
                </IconButton>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Configure points awarded for correctly predicting teams advancing in knockout matches
            </Typography>

            {editingKnockout ? (
              <Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Match Type</TableCell>
                        <TableCell align="right">Points per Correct Team</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {knockoutConfigs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {config.match_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={knockoutConfigValues[config.id] || 0}
                              onChange={(e) => handleKnockoutValueChange(config.id, e.target.value)}
                              size="small"
                              sx={{ width: '80px' }}
                              inputProps={{ min: 0, max: 100 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box display="flex" gap={1} justifyContent="flex-end" mt={2}>
                  <Button 
                    size="small" 
                    onClick={handleCancelEditKnockout}
                    disabled={updating === 'knockout_config'}
                  >
                    <Cancel sx={{ mr: 0.5 }} />
                    Cancel
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={handleSaveKnockout}
                    disabled={updating === 'knockout_config'}
                  >
                    <Save sx={{ mr: 0.5 }} />
                    Save
                  </Button>
                </Box>
                
                {updating === 'knockout_config' && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Updating...</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Match Type</TableCell>
                      <TableCell align="right">Points per Correct Team</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {knockoutConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {config.match_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {config.points_per_correct_team} points
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

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
