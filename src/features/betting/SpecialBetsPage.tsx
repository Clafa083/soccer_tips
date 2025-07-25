import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { SpecialBet, UserSpecialBet } from '../../types/models';
import { specialBetService } from '../../services/specialBetService';
import { SystemConfigService } from '../../services/systemConfigService';
import { useApp } from '../../context/AppContext';

export function SpecialBetsPage({ userId: propUserId }: { userId?: number }) {
    const { state } = useApp();
    const { user } = state;
    const effectiveUserId = propUserId ?? user?.id;
    const [specialBets, setSpecialBets] = useState<SpecialBet[]>([]);
    const [userSpecialBets, setUserSpecialBets] = useState<UserSpecialBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({});
    const [bettingLocked, setBettingLocked] = useState(false);

    useEffect(() => {
        if (effectiveUserId) {
            loadData();
        }
    }, [effectiveUserId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bets, locked] = await Promise.all([
                specialBetService.getSpecialBets(),
                SystemConfigService.isBettingLocked()
            ]);
            setSpecialBets(bets);
            setBettingLocked(locked);
            await loadUserSpecialBets();
        } catch (err) {
            setError('Kunde inte ladda special-tips: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const loadUserSpecialBets = async () => {
        if (!effectiveUserId) return;
        try {
            const userBets = await specialBetService.getUserSpecialBets(effectiveUserId);
            setUserSpecialBets(userBets);
            // Populate selectedOptions state with existing user selections
            const optionsMap: { [key: number]: string } = {};
            userBets.forEach(bet => {
                optionsMap[bet.special_bet_id] = bet.selected_option;
            });
            setSelectedOptions(optionsMap);
        } catch (err) {
            setError('Kunde inte ladda dina svar: ' + (err as Error).message);
        }
    };    const handleOptionChange = (specialBetId: number, selectedOption: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [specialBetId]: selectedOption
        }));
    };

    const handleSubmit = async (specialBetId: number) => {
        if (bettingLocked) {
            setError('Tips är låsta av administratören');
            return;
        }

        const selectedOption = selectedOptions[specialBetId]?.trim();
        
        if (!selectedOption) {
            setError('Du måste välja ett alternativ');
            return;
        }

        try {
            setSaving(specialBetId);
            await specialBetService.createOrUpdateUserSpecialBet({
                special_bet_id: specialBetId,
                selected_option: selectedOption,
                ...(effectiveUserId ? { user_id: effectiveUserId } : {})
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
                Här ska du tippa på speciella frågor kring mästerskapet. Varje rätt svar ger poäng som räknas in i totalresultatet!
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

            <Box sx={{ mt: 3 }}>
                {specialBets.map((specialBet, index) => {
                    const userBet = getUserBetForSpecialBet(specialBet.id);
                    const hasCorrectOption = specialBet.correct_option;
                    
                    return (
                        <Card key={specialBet.id} sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    {index + 1}. {specialBet.question}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Poäng vid rätt svar: <strong>{specialBet.points}</strong>
                                </Typography>

                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel id={`special-bet-${specialBet.id}-label`}>
                                        Välj ditt svar
                                    </InputLabel>
                                    <Select
                                        labelId={`special-bet-${specialBet.id}-label`}
                                        value={selectedOptions[specialBet.id] || ''}
                                        onChange={(e) => handleOptionChange(specialBet.id, e.target.value)}
                                        label="Välj ditt svar"
                                        disabled={bettingLocked || saving === specialBet.id}
                                        displayEmpty={false}
                                    >
                                        {specialBet.options.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => handleSubmit(specialBet.id)}
                                        disabled={bettingLocked || saving === specialBet.id || !selectedOptions[specialBet.id]?.trim()}
                                        sx={{ minWidth: '150px' }}
                                    >
                                        {saving === specialBet.id ? 'Sparar...' : (userBet ? 'Uppdatera svar' : 'Spara svar')}
                                    </Button>
                                    
                                    {userBet && (
                                        <Box textAlign="right">
                                            <Typography variant="body2" color="text.secondary">
                                                ✅ Sparad: {new Date(userBet.updated_at).toLocaleDateString('sv-SE')}
                                            </Typography>
                                            {userBet.points > 0 && (
                                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                                    🏆 Poäng: {userBet.points}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                {hasCorrectOption && userBet && (
                                    <>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Rätt svar:
                                        </Typography>
                                        <Typography variant="body2" color="success.main" fontWeight="bold">
                                            {specialBet.correct_option}
                                        </Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
                
                {specialBets.length === 0 && (
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Inga special-tips är tillgängliga just nu.
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>

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
