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
    Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { teamService } from '../../services/teamService';
import { Team } from '../../types/models';

export function TeamManagement() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        group: '',
        flag: ''
    });

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const data = await teamService.getAllTeams();
            setTeams(data);
            setError(null);
        } catch (err) {
            console.error('Error loading teams:', err);
            setError('Kunde inte ladda lag');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (team?: Team) => {        if (team) {
            setEditingTeam(team);
            setFormData({
                name: team.name,
                group: team.group || '',
                flag: team.flag_url || ''
            });
        } else {
            setEditingTeam(null);
            setFormData({
                name: '',
                group: '',
                flag: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingTeam(null);
        setFormData({
            name: '',
            group: '',
            flag: ''
        });
    };

    const handleSave = async () => {
        try {
            if (!formData.name) {
                setError('Lagnamn är obligatoriskt');
                return;
            }

            if (editingTeam) {
                await teamService.updateTeam(editingTeam.id, formData);
            } else {
                await teamService.createTeam(formData);
            }
            
            await loadTeams();
            handleCloseDialog();
            setError(null);
        } catch (err) {
            console.error('Error saving team:', err);
            setError('Kunde inte spara lag');
        }
    };

    const handleDelete = async (teamId: number) => {
        if (window.confirm('Är du säker på att du vill ta bort detta lag?')) {
            try {
                await teamService.deleteTeam(teamId);
                await loadTeams();
                setError(null);
            } catch (err) {
                console.error('Error deleting team:', err);
                setError('Kunde inte ta bort lag');
            }
        }
    };

    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    if (loading) {
        return <Typography>Laddar lag...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Hantera lag</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Lägg till lag
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
                            <TableCell>Lag</TableCell>
                            <TableCell>Grupp</TableCell>
                            <TableCell>Flagga</TableCell>
                            <TableCell align="right">Åtgärder</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell>{team.name}</TableCell>
                                <TableCell>
                                    {team.group ? (
                                        <Chip label={`Grupp ${team.group}`} size="small" />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Ingen grupp
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>{team.flag_url || '-'}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        onClick={() => handleOpenDialog(team)}
                                        size="small"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(team.id)}
                                        size="small"
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {teams.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="text.secondary">
                                        Inga lag har lagts till än
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingTeam ? 'Redigera lag' : 'Lägg till nytt lag'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Lagnamn"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                            required
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel>Grupp</InputLabel>
                            <Select
                                value={formData.group}
                                label="Grupp"
                                onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                            >
                                <MenuItem value="">Ingen grupp</MenuItem>
                                {groups.map(group => (
                                    <MenuItem key={group} value={group}>
                                        Grupp {group}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Flagga (emoji eller URL)"
                            value={formData.flag}
                            onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                            fullWidth
                            placeholder="🇸🇪 eller URL till flaggbild"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Avbryt</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingTeam ? 'Uppdatera' : 'Lägg till'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}