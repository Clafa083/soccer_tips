import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import {
    CloudDownload as ImportIcon,
    SportsSoccer as SoccerIcon,
    Groups as TeamsIcon,
    ExpandMore as ExpandMoreIcon,
    Download as DownloadIcon,
    CheckCircle as CheckIcon,
    SelectAll as SelectAllIcon
} from '@mui/icons-material';
import { footballDataService, FootballDataTeam, FootballDataMatch } from '../../services/footballDataService';

interface FootballDataImportProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function FootballDataImport({ open, onClose, onSuccess }: FootballDataImportProps) {
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [availableTeams, setAvailableTeams] = useState<FootballDataTeam[]>([]);
    const [availableMatches, setAvailableMatches] = useState<FootballDataMatch[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<Set<number>>(new Set());
    const [selectedMatches, setSelectedMatches] = useState<Set<number>>(new Set());
    const [importResults, setImportResults] = useState<{
        teams?: { imported: number; skipped: number; };
        matches?: { imported: number; skipped: number; };
    }>({});

    const majorCompetitions = footballDataService.getMajorCompetitions();

    const handleCompetitionChange = async (competitionCode: string) => {
        setSelectedCompetition(competitionCode);
        setAvailableTeams([]);
        setAvailableMatches([]);
        setSelectedTeams(new Set());
        setSelectedMatches(new Set());
        setImportResults({});
        setError(null);
        setSuccess(null);

        if (!competitionCode) return;

        setLoading(true);
        try {
            const [teams, matches] = await Promise.all([
                footballDataService.getCompetitionTeams(competitionCode),
                footballDataService.getCompetitionMatches(competitionCode)
            ]);
            
            setAvailableTeams(teams);
            setAvailableMatches(matches);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunde inte hämta data från Football-Data.org');
        } finally {
            setLoading(false);
        }
    };

    const handleTeamSelection = (teamId: number, selected: boolean) => {
        setSelectedTeams(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(teamId);
            } else {
                newSet.delete(teamId);
            }
            return newSet;
        });
    };

    const handleMatchSelection = (matchId: number, selected: boolean) => {
        setSelectedMatches(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(matchId);
            } else {
                newSet.delete(matchId);
            }
            return newSet;
        });
    };

    const handleSelectAllTeams = (selectAll: boolean) => {
        if (selectAll) {
            setSelectedTeams(new Set(availableTeams.map(team => team.id)));
        } else {
            setSelectedTeams(new Set());
        }
    };

    const handleSelectAllMatches = (selectAll: boolean) => {
        if (selectAll) {
            setSelectedMatches(new Set(availableMatches.map(match => match.id)));
        } else {
            setSelectedMatches(new Set());
        }
    };

    const handleImportTeams = async () => {
        if (selectedTeams.size === 0) return;

        setImporting(true);
        setError(null);
        setSuccess(null);

        try {
            const teamsToImport = availableTeams.filter(team => selectedTeams.has(team.id));
            await footballDataService.importTeamsToDatabase(teamsToImport);
            const result = { imported: teamsToImport.length, skipped: 0 };
            setImportResults(prev => ({ ...prev, teams: result }));
            setSuccess(`Importerade ${result.imported} lag framgångsrikt!`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunde inte importera lag');
        } finally {
            setImporting(false);
        }
    };

    const handleImportMatches = async () => {
        if (selectedMatches.size === 0) return;

        setImporting(true);
        setError(null);
        setSuccess(null);

        try {
            const matchesToImport = availableMatches.filter(match => selectedMatches.has(match.id));
            await footballDataService.importMatchesToDatabase(matchesToImport);
            const result = { imported: matchesToImport.length, skipped: 0 };
            setImportResults(prev => ({ ...prev, matches: result }));
            setSuccess(`Importerade ${result.imported} matcher framgångsrikt!`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunde inte importera matcher');
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        if (importResults.teams || importResults.matches) {
            onSuccess(); // Trigger refresh of parent components
        }
        onClose();
    };

    const formatMatchDisplay = (match: FootballDataMatch) => {
        const date = new Date(match.utcDate).toLocaleDateString('sv-SE');
        const time = new Date(match.utcDate).toLocaleTimeString('sv-SE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        return `${match.homeTeam.name} vs ${match.awayTeam.name} - ${date} ${time}`;
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <ImportIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        Importera från Football-Data.org
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Välj en tävling för att hämta och importera lag och matcher från Football-Data.org API.
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Välj tävling</InputLabel>
                    <Select
                        value={selectedCompetition}
                        label="Välj tävling"
                        onChange={(e) => handleCompetitionChange(e.target.value)}
                        disabled={loading}
                    >
                        <MenuItem value="">
                            <em>Välj en tävling</em>
                        </MenuItem>
                        {majorCompetitions.map((comp) => (
                            <MenuItem key={comp.code} value={comp.code}>
                                {comp.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loading && (
                    <Box display="flex" justifyContent="center" my={3}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            Hämtar data från Football-Data.org...
                        </Typography>
                    </Box>
                )}

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

                {(availableTeams.length > 0 || availableMatches.length > 0) && (
                    <Box>
                        <Divider sx={{ my: 2 }} />
                        
                        {availableTeams.length > 0 && (
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box display="flex" alignItems="center" width="100%">
                                        <TeamsIcon sx={{ mr: 1 }} />
                                        <Typography sx={{ flexGrow: 1 }}>
                                            Lag ({availableTeams.length}) 
                                            {selectedTeams.size > 0 && ` - ${selectedTeams.size} valda`}
                                        </Typography>
                                        {importResults.teams && (
                                            <Chip
                                                icon={<CheckIcon />}
                                                label={`Importerade: ${importResults.teams.imported}`}
                                                color="success"
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                        )}
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImportTeams();
                                            }}
                                            disabled={importing || importResults.teams !== undefined || selectedTeams.size === 0}
                                            sx={{ ml: 1 }}
                                        >
                                            {importResults.teams ? 'Importerat' : `Importera (${selectedTeams.size})`}
                                        </Button>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ mb: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedTeams.size === availableTeams.length && availableTeams.length > 0}
                                                    indeterminate={selectedTeams.size > 0 && selectedTeams.size < availableTeams.length}
                                                    onChange={(e) => handleSelectAllTeams(e.target.checked)}
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <SelectAllIcon sx={{ mr: 1, fontSize: 20 }} />
                                                    Välj alla lag
                                                </Box>
                                            }
                                        />
                                    </Box>
                                    <List dense>
                                        {availableTeams.map((team) => (
                                            <ListItem key={team.id}>
                                                <ListItemIcon>
                                                    <Checkbox
                                                        checked={selectedTeams.has(team.id)}
                                                        onChange={(e) => handleTeamSelection(team.id, e.target.checked)}
                                                    />
                                                </ListItemIcon>
                                                <ListItemIcon>
                                                    <img 
                                                        src={team.crest} 
                                                        alt={team.name}
                                                        style={{ width: 24, height: 24 }}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={team.name}
                                                    secondary={team.shortName}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        )}

                        {availableMatches.length > 0 && (
                            <Accordion sx={{ mt: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box display="flex" alignItems="center" width="100%">
                                        <SoccerIcon sx={{ mr: 1 }} />
                                        <Typography sx={{ flexGrow: 1 }}>
                                            Matcher ({availableMatches.length})
                                            {selectedMatches.size > 0 && ` - ${selectedMatches.size} valda`}
                                        </Typography>
                                        {importResults.matches && (
                                            <Chip
                                                icon={<CheckIcon />}
                                                label={`Importerade: ${importResults.matches.imported}`}
                                                color="success"
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                        )}
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImportMatches();
                                            }}
                                            disabled={importing || importResults.matches !== undefined || selectedMatches.size === 0}
                                            sx={{ ml: 1 }}
                                        >
                                            {importResults.matches ? 'Importerat' : `Importera (${selectedMatches.size})`}
                                        </Button>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ mb: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedMatches.size === availableMatches.length && availableMatches.length > 0}
                                                    indeterminate={selectedMatches.size > 0 && selectedMatches.size < availableMatches.length}
                                                    onChange={(e) => handleSelectAllMatches(e.target.checked)}
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <SelectAllIcon sx={{ mr: 1, fontSize: 20 }} />
                                                    Välj alla matcher
                                                </Box>
                                            }
                                        />
                                    </Box>
                                    <List dense>
                                        {availableMatches.map((match) => (
                                            <ListItem key={match.id}>
                                                <ListItemIcon>
                                                    <Checkbox
                                                        checked={selectedMatches.has(match.id)}
                                                        onChange={(e) => handleMatchSelection(match.id, e.target.checked)}
                                                    />
                                                </ListItemIcon>
                                                <ListItemIcon>
                                                    <SoccerIcon />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={formatMatchDisplay(match)}
                                                    secondary={`${match.stage} ${match.group ? `- Grupp ${match.group}` : ''}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        )}

                        {importing && (
                            <Box display="flex" justifyContent="center" alignItems="center" my={2}>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                    Importerar...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    {importResults.teams || importResults.matches ? 'Stäng' : 'Avbryt'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
