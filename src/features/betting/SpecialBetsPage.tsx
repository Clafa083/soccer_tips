import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import { SpecialBet, UserSpecialBet } from '../../types/models';
import { specialBetService } from '../../services/specialBetService';
import { useApp } from '../../context/AppContext';

export function SpecialBetsPage() {
    const { state } = useApp();
    const { user } = state;
    const [specialBets, setSpecialBets] = useState<SpecialBet[]>([]);
    const [userSpecialBets, setUserSpecialBets] = useState<UserSpecialBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        if (user) {
            loadSpecialBets();
            loadUserSpecialBets();
        }
    }, [user]);

    const loadSpecialBets = async () => {
        try {
            const bets = await specialBetService.getSpecialBets();
            setSpecialBets(bets);
        } catch (err) {
            setError('Kunde inte ladda special-tips: ' + (err as Error).message);
        }
    };

    const loadUserSpecialBets = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const userBets = await specialBetService.getUserSpecialBets(user.id);
            setUserSpecialBets(userBets);
              // Populate selectedOptions state with existing user selections
            const optionsMap: { [key: number]: string } = {};
            userBets.forEach(bet => {
                optionsMap[bet.special_bet_id] = bet.selected_option;
            });
            setSelectedOptions(optionsMap);
        } catch (err) {
            setError('Kunde inte ladda dina svar: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };    const handleOptionChange = (specialBetId: number, selectedOption: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [specialBetId]: selectedOption
        }));
    };

    const handleSubmit = async (specialBetId: number) => {
        const selectedOption = selectedOptions[specialBetId]?.trim();
        
        if (!selectedOption) {
            setError('Du måste välja ett alternativ');
            return;
        }

        try {
            setSaving(specialBetId);
            await specialBetService.createOrUpdateUserSpecialBet({
                special_bet_id: specialBetId,
                selected_option: selectedOption
            });
            
            setSuccess('Ditt svar har sparats!');
            loadUserSpecialBets(); // Reload to get updated points
        } catch (err) {
            setError('Kunde inte spara svar: ' + (err as Error).message);
        } finally {
            setSaving(null);
        }
    };

    const getUserBetForSpecialBet = (specialBetId: number): UserSpecialBet | undefined => {
        return userSpecialBets.find(bet => bet.special_bet_id === specialBetId);
    };

    const getTotalPoints = (): number => {
        return userSpecialBets.reduce((total, bet) => total + bet.points, 0);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography>Laddar special-tips...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Special-tips
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
                Här kan du tippa på speciella frågor kring VM. Varje rätt svar ger poäng som räknas in i totalresultatet!
            </Typography>

            {getTotalPoints() > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" color="primary">
                            Dina special-tips poäng: {getTotalPoints()}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            <List>
                {specialBets.map((specialBet, index) => {
                    const userBet = getUserBetForSpecialBet(specialBet.id);
                    const hasCorrectOption = specialBet.correct_option;
                    
                    return (
                        <ListItem key={specialBet.id} sx={{ px: 0, mb: 2 }}>
                            <Paper sx={{ width: '100%', p: 3 }}>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        {index + 1}. {specialBet.question}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Poäng vid rätt svar: {specialBet.points}
                                    </Typography>                                    <Box mt={2}>
                                        <TextField
                                            select
                                            label="Välj ditt svar"
                                            value={selectedOptions[specialBet.id] || ''}
                                            onChange={(e) => handleOptionChange(specialBet.id, e.target.value)}
                                            fullWidth
                                            disabled={saving === specialBet.id}
                                            SelectProps={{
                                                native: true,
                                            }}
                                        >
                                            <option value="">-- Välj ett alternativ --</option>
                                            {specialBet.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </TextField>
                                        
                                        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                                            <Button
                                                variant="contained"
                                                onClick={() => handleSubmit(specialBet.id)}
                                                disabled={saving === specialBet.id || !selectedOptions[specialBet.id]?.trim()}
                                            >
                                                {saving === specialBet.id ? 'Sparar...' : (userBet ? 'Uppdatera svar' : 'Spara svar')}
                                            </Button>
                                            
                                            {userBet && (
                                                <Box textAlign="right">
                                                    <Typography variant="body2" color="text.secondary">
                                                        Sparad: {new Date(userBet.updated_at).toLocaleDateString('sv-SE')}
                                                    </Typography>
                                                    {userBet.points > 0 && (
                                                        <Typography variant="body2" color="success.main" fontWeight="bold">
                                                            Poäng: {userBet.points}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>                                        {hasCorrectOption && userBet && (
                                            <Box mt={2}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Rätt svar:
                                                </Typography>
                                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                                    {specialBet.correct_option}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        </ListItem>
                    );
                })}
                
                {specialBets.length === 0 && (
                    <ListItem>
                        <Paper sx={{ width: '100%', p: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Inga special-tips är tillgängliga just nu.
                            </Typography>
                        </Paper>
                    </ListItem>
                )}
            </List>

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
        </Container>
    );
}
