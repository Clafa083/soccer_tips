import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Autocomplete
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { matchService } from '../../services/matchService';
import { teamService } from '../../services/teamService';
import { Match, Team, MatchType } from '../../types/models';

interface CreateMatchDto {
    homeTeamId?: number;
    awayTeamId?: number;
    matchTime: string;
    matchType: MatchType;
    group?: string;
}

export function MatchManagement() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [formData, setFormData] = useState<CreateMatchDto>({
        homeTeamId: undefined,
        awayTeamId: undefined,
        matchTime: '',
        matchType: MatchType.GROUP,
        group: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [matchesData, teamsData] = await Promise.all([
                matchService.getAllMatches(),
                teamService.getAllTeams()
            ]);
            setMatches(matchesData);
            setTeams(teamsData);
            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Kunde inte ladda data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (match?: Match) => {
        if (match) {
            setEditingMatch(match);
            setFormData({
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                matchTime: new Date(match.matchTime).toISOString().slice(0, 16),
                matchType: match.matchType,
                group: match.group || ''
            });
        } else {
            setEditingMatch(null);
            setFormData({
                homeTeamId: undefined,
                awayTeamId: undefined,
                matchTime: '',
                matchType: MatchType.GROUP,
                group: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingMatch(null);
    };

    const handleSave = async () => {
        try {
            if (!formData.matchTime || !formData.matchType) {
                setError('Matchtid och matchtyp är obligatoriska');
                return;
            }

            if (formData.matchType === MatchType.GROUP && (!formData.homeTeamId || !formData.awayTeamId)) {
                setError('Hemmalag och bortalag måste väljas för gruppspelsmatcher');
                return;
            }

            const matchData = {
                ...formData,
                matchTime: new Date(formData.matchTime)
            };

            if (editingMatch) {
                // Update functionality would go here
                setError('Uppdatering av matcher är inte implementerat än');
                return;
            } else {
                await matchService.createMatch(matchData);
            }
            
            await loadData();
            handleCloseDialog();
            setError(null);
        } catch (err) {
            console.error('Error saving match:', err);
            setError('Kunde inte spara match');
        }
    };

    const handleDelete = async (matchId: number) => {
        if (window.confirm('Är du säker på att du vill ta bort denna match?')) {
            try {
                await matchService.deleteMatch(matchId);
                await loadData();
                setError(null);
            } catch (err) {
                console.error('Error deleting match:', err);
                setError('Kunde inte ta bort match');
            }
        }
    };

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getMatchTypeLabel = (type: MatchType) => {
        const labels = {
            [MatchType.GROUP]: 'Gruppspel',
            [MatchType.ROUND_OF_16]: 'Åttondel',
            [MatchType.QUARTER_FINAL]: 'Kvartsfinal',
            [MatchType.SEMI_FINAL]: 'Semifinal',
            [MatchType.FINAL]: 'Final'
        };
        return labels[type];
    };

    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    if (loading) {
        return <Typography>Laddar matcher...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Hantera matcher</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Lägg till match
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Datum & Tid</TableCell>
                            <TableCell>Hemmalag</TableCell>
                            <TableCell>Bortalag</TableCell>
                            <TableCell>Typ</TableCell>
                            <TableCell>Grupp</TableCell>
                            <TableCell>Resultat</TableCell>
                            <TableCell align="right">Åtgärder</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {matches.map((match) => (
                            <TableRow key={match.id}>
                                <TableCell>{formatDateTime(match.matchTime)}</TableCell>
                                <TableCell>{match.homeTeam?.name || 'TBD'}</TableCell>
                                <TableCell>{match.awayTeam?.name || 'TBD'}</TableCell>
                                <TableCell>
                                    <Chip label={getMatchTypeLabel(match.matchType)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {match.group ? `Grupp ${match.group}` : '-'}
                                </TableCell>
                                <TableCell>
                                    {match.homeScore !== null && match.awayScore !== null 
                                        ? `${match.homeScore} - ${match.awayScore}`
                                        : '-'
                                    }
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        onClick={() => handleOpenDialog(match)}
                                        size="small"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(match.id)}
                                        size="small"
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {matches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        Inga matcher har lagts till än
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingMatch ? 'Redigera match' : 'Lägg till ny match'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Datum och tid"
                            type="datetime-local"
                            value={formData.matchTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, matchTime: e.target.value }))}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        
                        <FormControl fullWidth required>
                            <InputLabel>Matchtyp</InputLabel>
                            <Select
                                value={formData.matchType}
                                label="Matchtyp"
                                onChange={(e) => setFormData(prev => ({ ...prev, matchType: e.target.value as MatchType }))}
                            >
                                {Object.values(MatchType).map(type => (
                                    <MenuItem key={type} value={type}>
                                        {getMatchTypeLabel(type)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.matchType === MatchType.GROUP && (
                            <FormControl fullWidth>
                                <InputLabel>Grupp</InputLabel>
                                <Select
                                    value={formData.group}
                                    label="Grupp"
                                    onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                                >
                                    {groups.map(group => (
                                        <MenuItem key={group} value={group}>
                                            Grupp {group}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <Autocomplete
                            options={teams}
                            getOptionLabel={(option) => option.name}
                            value={teams.find(t => t.id === formData.homeTeamId) || null}
                            onChange={(_, newValue) => setFormData(prev => ({ ...prev, homeTeamId: newValue?.id }))}
                            renderInput={(params) => (
                                <TextField {...params} label="Hemmalag" />
                            )}
                        />

                        <Autocomplete
                            options={teams}
                            getOptionLabel={(option) => option.name}
                            value={teams.find(t => t.id === formData.awayTeamId) || null}
                            onChange={(_, newValue) => setFormData(prev => ({ ...prev, awayTeamId: newValue?.id }))}
                            renderInput={(params) => (
                                <TextField {...params} label="Bortalag" />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Avbryt</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingMatch ? 'Uppdatera' : 'Lägg till'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}