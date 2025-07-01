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
    Autocomplete,
    TableSortLabel
} from '@mui/material';
import { Edit, Delete, Add, CloudDownload } from '@mui/icons-material';
import { matchService } from '../../services/matchService';
import { teamService } from '../../services/teamService';
import { adminService } from '../../services/adminService';
import { Match, Team, MatchType } from '../../types/models';
import CombinedFootballImport from '../../components/admin/CombinedFootballImport';

interface CreateMatchDto {
    homeTeamId?: number;
    awayTeamId?: number;
    matchTime: string;
    matchType: MatchType;
    group?: string;
    // Group constraints for knockout matches
    allowed_home_groups?: string;
    allowed_away_groups?: string;
    home_group_description?: string;
    away_group_description?: string;
}

type SortField = 'matchTime' | 'homeTeam' | 'awayTeam' | 'matchType' | 'group' | 'result';
type SortDirection = 'asc' | 'desc';

export function MatchManagement() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [sortField, setSortField] = useState<SortField>('matchTime');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [formData, setFormData] = useState<CreateMatchDto>({
        homeTeamId: undefined,
        awayTeamId: undefined,
        matchTime: '',
        matchType: MatchType.GROUP,
        group: '',
        allowed_home_groups: '',
        allowed_away_groups: '',
        home_group_description: '',
        away_group_description: ''
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

    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const sortedMatches = [...matches].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'matchTime':
                aValue = new Date(a.matchTime).getTime();
                bValue = new Date(b.matchTime).getTime();
                break;
            case 'homeTeam':
                aValue = a.homeTeam?.name || 'TBD';
                bValue = b.homeTeam?.name || 'TBD';
                break;
            case 'awayTeam':
                aValue = a.awayTeam?.name || 'TBD';
                bValue = b.awayTeam?.name || 'TBD';
                break;
            case 'matchType':
                aValue = a.matchType;
                bValue = b.matchType;
                break;
            case 'group':
                aValue = a.group || '';
                bValue = b.group || '';
                break;
            case 'result':
                aValue = (a.homeScore !== null && a.awayScore !== null) ? `${a.homeScore}-${a.awayScore}` : '';
                bValue = (b.homeScore !== null && b.awayScore !== null) ? `${b.homeScore}-${b.awayScore}` : '';
                break;
            default:
                return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const handleOpenDialog = (match?: Match) => {
        if (match) {
            setEditingMatch(match);
            setFormData({
                homeTeamId: match.home_team_id,
                awayTeamId: match.away_team_id,
                matchTime: new Date(match.matchTime).toISOString().slice(0, 16),
                matchType: match.matchType,
                group: match.group || '',
                allowed_home_groups: match.allowed_home_groups || '',
                allowed_away_groups: match.allowed_away_groups || '',
                home_group_description: match.home_group_description || '',
                away_group_description: match.away_group_description || ''
            });
        } else {
            setEditingMatch(null);
            setFormData({
                homeTeamId: undefined,
                awayTeamId: undefined,
                matchTime: '',
                matchType: MatchType.GROUP,
                group: '',
                allowed_home_groups: '',
                allowed_away_groups: '',
                home_group_description: '',
                away_group_description: ''
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
            }            const matchData = {
                homeTeamId: formData.homeTeamId,
                awayTeamId: formData.awayTeamId,
                matchTime: formData.matchTime, // Keep as string
                matchType: formData.matchType,
                group: formData.group,
                // Include group constraints for knockout matches
                allowed_home_groups: formData.allowed_home_groups,
                allowed_away_groups: formData.allowed_away_groups,
                home_group_description: formData.home_group_description,
                away_group_description: formData.away_group_description
            };

            if (editingMatch) {
                // Update existing match using admin service
                await adminService.updateMatch(editingMatch.id, {
                    home_team_id: formData.homeTeamId,
                    away_team_id: formData.awayTeamId,
                    matchTime: formData.matchTime,
                    allowed_home_groups: formData.allowed_home_groups,
                    allowed_away_groups: formData.allowed_away_groups,
                    home_group_description: formData.home_group_description,
                    away_group_description: formData.away_group_description
                });
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        onClick={() => setImportDialogOpen(true)}
                        color="secondary"
                    >
                        Importera från API
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Lägg till match
                    </Button>
                </Box>
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
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'matchTime'}
                                    direction={sortField === 'matchTime' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('matchTime')}
                                >
                                    Datum & Tid
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'homeTeam'}
                                    direction={sortField === 'homeTeam' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('homeTeam')}
                                >
                                    Hemmalag
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'awayTeam'}
                                    direction={sortField === 'awayTeam' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('awayTeam')}
                                >
                                    Bortalag
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'matchType'}
                                    direction={sortField === 'matchType' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('matchType')}
                                >
                                    Typ
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'group'}
                                    direction={sortField === 'group' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('group')}
                                >
                                    Grupp
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'result'}
                                    direction={sortField === 'result' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('result')}
                                >
                                    Resultat
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">Åtgärder</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedMatches.map((match) => (
                            <TableRow key={match.id}>
                                <TableCell>{formatDateTime(new Date(match.matchTime))}</TableCell>
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
                        {sortedMatches.length === 0 && (
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

                        {/* Group constraints for knockout matches */}
                        {formData.matchType !== MatchType.GROUP && (
                            <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Gruppbegränsningar för slutspel
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Konfigurera vilka gruppers lag som kan väljas för denna slutspelsmatch
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Tillåtna grupper för hemmalag (t.ex. A,B)"
                                        value={formData.allowed_home_groups}
                                        onChange={(e) => setFormData(prev => ({ ...prev, allowed_home_groups: e.target.value }))}
                                        fullWidth
                                        helperText="Ange gruppbokstäver separerade med komma"
                                    />
                                    
                                    <TextField
                                        label="Beskrivning för hemmalag (t.ex. Vinnare grupp A och B)"
                                        value={formData.home_group_description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, home_group_description: e.target.value }))}
                                        fullWidth
                                        helperText="Denna text visas för användarna"
                                    />
                                    
                                    <TextField
                                        label="Tillåtna grupper för bortalag (t.ex. C,D)"
                                        value={formData.allowed_away_groups}
                                        onChange={(e) => setFormData(prev => ({ ...prev, allowed_away_groups: e.target.value }))}
                                        fullWidth
                                        helperText="Ange gruppbokstäver separerade med komma"
                                    />
                                    
                                    <TextField
                                        label="Beskrivning för bortalag (t.ex. Vinnare grupp C och D)"
                                        value={formData.away_group_description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, away_group_description: e.target.value }))}
                                        fullWidth
                                        helperText="Denna text visas för användarna"
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Avbryt</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingMatch ? 'Uppdatera' : 'Lägg till'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Combined Football Import Dialog */}
            <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Importera Matcher</DialogTitle>
                <DialogContent>
                    <CombinedFootballImport
                        onImportComplete={() => {
                            loadData();
                            setImportDialogOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}