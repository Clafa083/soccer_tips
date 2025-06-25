import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    Snackbar,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { SpecialBet, CreateSpecialBetDto } from '../../types/models';
import { specialBetService } from '../../services/specialBetService';

export function SpecialBetsManagement() {
    const [specialBets, setSpecialBets] = useState<SpecialBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBet, setEditingBet] = useState<SpecialBet | null>(null);    const [formData, setFormData] = useState<CreateSpecialBetDto>({
        question: '',
        options: [],
        correct_option: '',
        points: 1,
        is_active: true,
    });
    const [newOption, setNewOption] = useState('');

    useEffect(() => {
        loadSpecialBets();
    }, []);

    const loadSpecialBets = async () => {
        try {
            setLoading(true);
            const bets = await specialBetService.getSpecialBets();
            setSpecialBets(bets);
        } catch (err) {
            setError('Kunde inte ladda special-tips: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };    const handleOpenDialog = (bet?: SpecialBet) => {
        if (bet) {
            setEditingBet(bet);
            setFormData({
                question: bet.question,
                options: bet.options || [],
                correct_option: bet.correct_option || '',
                points: bet.points,
                is_active: bet.is_active,
            });
        } else {
            setEditingBet(null);
            setFormData({
                question: '',
                options: [],
                correct_option: '',
                points: 1,
                is_active: true,
            });
        }
        setNewOption('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {        setOpenDialog(false);
        setEditingBet(null);
        setNewOption('');
    };

    const handleAddOption = () => {
        if (newOption.trim() && !formData.options?.includes(newOption.trim())) {
            setFormData({
                ...formData,
                options: [...(formData.options || []), newOption.trim()],
            });
            setNewOption('');
        }
    };

    const handleRemoveOption = (optionToRemove: string) => {
        setFormData({
            ...formData,
            options: formData.options?.filter(option => option !== optionToRemove) || [],
            // Reset correct_option if it was the removed option
            correct_option: formData.correct_option === optionToRemove ? '' : formData.correct_option,
        });
    };    const handleSubmit = async () => {
        try {
            // Validate that options exist
            if (!formData.options || formData.options.length === 0) {
                setError('Du måste lägga till minst ett svarsalternativ');
                return;
            }

            if (editingBet) {
                await specialBetService.updateSpecialBet(editingBet.id, formData);
                setSuccess('Special-tips uppdaterat!');
            } else {
                await specialBetService.createSpecialBet(formData);
                setSuccess('Special-tips skapat!');
            }
            handleCloseDialog();
            loadSpecialBets();
        } catch (err) {
            setError('Fel vid sparande: ' + (err as Error).message);
        }
    };

    const handleDelete = async (bet: SpecialBet) => {
        if (window.confirm(`Är du säker på att du vill ta bort "${bet.question}"?`)) {
            try {
                await specialBetService.deleteSpecialBet(bet.id);
                setSuccess('Special-tips borttaget!');
                loadSpecialBets();
            } catch (err) {
                setError('Kunde inte ta bort special-tips: ' + (err as Error).message);
            }
        }
    };    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    if (loading) {
        return <Typography>Laddar special-tips...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Special-tips</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nytt Special-tips
                </Button>
            </Box>

            <Paper>
                <List>
                    {specialBets.map((bet) => (
                        <ListItem key={bet.id} divider>
                            <ListItemText
                                primary={bet.question}                                secondary={
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Poäng: {bet.points} | Status: {bet.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Typography>
                                        {bet.options && bet.options.length > 0 && (
                                            <Box mt={1}>
                                                <Typography variant="caption" display="block" gutterBottom>
                                                    Alternativ:
                                                </Typography>
                                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                                    {bet.options.map((option, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={option}
                                                            size="small"
                                                            color={option === bet.correct_option ? 'success' : 'default'}
                                                            variant={option === bet.correct_option ? 'filled' : 'outlined'}
                                                        />
                                                    ))}
                                                </Box>
                                                {bet.correct_option && (
                                                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                                                        Rätt svar: {bet.correct_option}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                }
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    onClick={() => handleOpenDialog(bet)}
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDelete(bet)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {specialBets.length === 0 && (
                        <ListItem>
                            <ListItemText
                                primary="Inga special-tips finns ännu"
                                secondary="Klicka på 'Nytt Special-tips' för att skapa det första"
                            />
                        </ListItem>
                    )}
                </List>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingBet ? 'Redigera Special-tips' : 'Nytt Special-tips'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Fråga"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                            required
                        />
                        
                        <TextField
                            label="Poäng"
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                            inputProps={{ min: 1, max: 10 }}
                            fullWidth
                            required
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                            }
                            label="Aktiv"
                        />                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Svarsalternativ (obligatoriskt)
                            </Typography>
                            
                            <Box display="flex" gap={1} mb={2}>
                                <TextField
                                    label="Lägg till alternativ"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    size="small"
                                    fullWidth
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddOption}
                                    disabled={!newOption.trim()}
                                >
                                    Lägg till
                                </Button>
                            </Box>

                            {formData.options && formData.options.length > 0 && (
                                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                    {formData.options.map((option, index) => (
                                        <Chip
                                            key={index}
                                            label={option}
                                            onDelete={() => handleRemoveOption(option)}
                                            color={option === formData.correct_option ? 'success' : 'default'}
                                            variant={option === formData.correct_option ? 'filled' : 'outlined'}
                                        />
                                    ))}
                                </Box>
                            )}

                            {formData.options && formData.options.length > 0 && (
                                <TextField
                                    select
                                    label="Rätt svar (valfritt)"
                                    value={formData.correct_option || ''}
                                    onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                                    fullWidth
                                    size="small"
                                    SelectProps={{
                                        native: true,
                                    }}
                                    helperText="Välj det rätta svaret från alternativen"
                                >
                                    <option value="">-- Välj rätt svar --</option>
                                    {formData.options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Avbryt</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.question.trim()}
                    >
                        {editingBet ? 'Uppdatera' : 'Skapa'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert onClose={() => setError('')} severity="error">
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess('')}
            >
                <Alert onClose={() => setSuccess('')} severity="success">
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
}
