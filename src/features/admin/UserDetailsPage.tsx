import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import { ArrowBack, EmojiEvents, SportsSoccer, Star } from '@mui/icons-material';
import { publicService } from '../../services/publicService';
import { UserBetsData, UserBet } from '../../types/models';
import { generateFlagUrlForTeam } from '../../utils/flagUtils';
import KnockoutPredictionResultsTab from '../user/KnockoutPredictionResultsTab';

export function UserDetailsPage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<UserBetsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (userId) {
            loadUserBets(parseInt(userId, 10));
        }
    }, [userId]);    const loadUserBets = async (id: number) => {
        try {
            setLoading(true);
            const response = await publicService.getUserBets(id);
            setData(response);
            setError(null);
        } catch (err) {
            console.error('Error loading user bets:', err);
            setError('Kunde inte ladda användardata');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const TeamDisplay = ({ teamName, flagUrl }: { teamName: string | null | undefined; flagUrl?: string }) => {
        // Handle null/undefined teamName
        if (!teamName) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                        sx={{ 
                            width: 24, 
                            height: 24,
                            borderRadius: 1,
                            backgroundColor: 'grey.300',
                            fontSize: '0.75rem'
                        }}
                    >
                        ?
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                        Okänt lag
                    </Typography>
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {flagUrl ? (
                    <Avatar
                        src={flagUrl}
                        alt={`${teamName} flagga`}
                        sx={{ 
                            width: 24, 
                            height: 24,
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.12)'
                        }}
                    />
                ) : (
                    <Avatar
                        sx={{ 
                            width: 24, 
                            height: 24,
                            borderRadius: 1,
                            backgroundColor: 'grey.300',
                            fontSize: '0.75rem'
                        }}
                    >
                        {teamName.charAt(0)}
                    </Avatar>
                )}
                <Typography variant="body2">{teamName}</Typography>
            </Box>
        );
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !data) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Kunde inte ladda användardata'}
                </Alert>                <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/leaderboard')}
                >
                    Tillbaka till resultattavlan
                </Button>
            </Container>
        );
    }

    // Poänguppdelning
    const groupPoints = data.bets.filter(bet => bet.match.matchType === 'GROUP').reduce((sum, bet) => sum + bet.points, 0);
    const knockoutPoints = typeof data.knockout_points === 'number' ? data.knockout_points : 0;
    const specialPoints = (data.special_bets?.reduce((sum, bet) => sum + bet.points, 0) || 0);
    const totalPoints = groupPoints + knockoutPoints + specialPoints;
    const groupedBets = data.bets.reduce((acc, bet) => {
        const matchType = bet.match.matchType;
        if (!acc[matchType]) acc[matchType] = [];
        acc[matchType].push(bet);
        return acc;
    }, {} as Record<string, UserBet[]>);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/leaderboard')}
                    sx={{ mb: 2 }}
                >
                    Tillbaka till resultattavlan
                </Button>
            </Box>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="Gruppspelsmatcher" />
                <Tab label="Slutspel" />
                <Tab label="Specialtips" />
            </Tabs>
            {/* Profilkortet alltid överst */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 3 } }}>
                        <Avatar
                            src={data.user.image_url}
                            sx={{ width: 64, height: 64, mb: { xs: 1, sm: 0 } }}
                        >
                            {data.user.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '2rem' } }}>
                                {data.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                {data.user.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                Medlem sedan: {formatDateTime(data.user.created_at)}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'center' }, minWidth: { xs: 0, sm: 120 }, width: { xs: '100%', sm: 'auto' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <EmojiEvents color="primary" />
                                <Typography variant="h5" color="primary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                    {totalPoints}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                Totala poäng
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: { xs: 1, sm: 0.5 } }}>
                                <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1, px: 1.2, py: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' }, minWidth: 0, textAlign: 'center' }}>
                                    Grupp: <b>{groupPoints}</b>p
                                </Box>
                                <Box sx={{ bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1, px: 1.2, py: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' }, minWidth: 0, textAlign: 'center' }}>
                                    Slutspel: <b>{knockoutPoints}</b>p
                                </Box>
                                <Box sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 1, px: 1.2, py: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' }, minWidth: 0, textAlign: 'center' }}>
                                    Special: <b>{specialPoints}</b>p
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            {/* Gruppspelsmatcher */}
            {activeTab === 0 && (
                <>
                    {groupedBets['GROUP'] && groupedBets['GROUP'].length > 0 ? (
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SportsSoccer />
                                    Gruppspel
                                    <Chip 
                                        label={`${groupedBets['GROUP'].length} tips`} 
                                        size="small" 
                                        variant="outlined" 
                                    />
                                </Typography>
                                <Stack spacing={1.2}>
                                    {groupedBets['GROUP'].map((bet) => (
                                        <Card key={bet.id} variant="outlined" sx={{ boxShadow: 'none', borderRadius: 2 }}>
                                            <CardContent sx={{ '&:last-child': { pb: 2 }, p: { xs: 1.2, sm: 2 } }}>
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, md: 2 }, alignItems: { xs: 'flex-start', md: 'stretch' } }}>
                                                    {/* Match Info */}
                                                    <Box sx={{ flex: 2, mb: { xs: 1, md: 0 } }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                                                            {formatDateTime(bet.match.matchTime)}
                                                            {bet.match.group && ` • Grupp ${bet.match.group}`}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <TeamDisplay 
                                                                teamName={bet.match.home_team_name}
                                                                flagUrl={generateFlagUrlForTeam(bet.match.home_team_name)}
                                                            />
                                                            <Typography variant="body2" sx={{ mx: 1, fontSize: { xs: '0.95rem', sm: '1rem' } }}>vs</Typography>
                                                            <TeamDisplay 
                                                                teamName={bet.match.away_team_name}
                                                                flagUrl={generateFlagUrlForTeam(bet.match.away_team_name)}
                                                            />
                                                        </Box>
                                                        {bet.match.status === 'finished' && (
                                                            <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.2rem' } }}>
                                                                {bet.match.home_score} - {bet.match.away_score}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    {/* Bet Info */}
                                                    <Box sx={{ flex: 1, mb: { xs: 1, md: 0 } }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                                                            Ditt tips:
                                                        </Typography>
                                                        {bet.bet === null ? (
                                                            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontStyle: 'italic', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                                Inget tips lämnat
                                                            </Typography>
                                                        ) : (
                                                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                                {bet.bet.home_score} - {bet.bet.away_score}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    {/* Points */}
                                                    <Box sx={{ flex: 1, textAlign: { xs: 'left', md: 'center' } }}>
                                                        <Chip
                                                            label={bet.points > 0 ? `${bet.points}p` : '0p'}
                                                            color={bet.points > 0 ? 'success' : 'error'}
                                                            size="small"
                                                            sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 0.5, sm: 1.5 } }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    ) : (
                        <Alert severity="info">
                            Denna användare har inte lagt några gruppspelstips än.
                        </Alert>
                    )}
                </>
            )}
            {activeTab === 1 && (
                <Box sx={{ overflowX: 'auto' }}>
                    <KnockoutPredictionResultsTab userId={parseInt(userId || "0", 10)} />
                </Box>
            )}
            {activeTab === 2 && (
                <>
                    {data.special_bets && data.special_bets.length > 0 ? (
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Star />
                                    Special-tips
                                    <Chip 
                                        label={`${data.special_bets.length} tips`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Typography>
                                <Stack spacing={2}>
                                    {data.special_bets.map((bet, index) => (
                                        <Card key={bet.id} variant="outlined">
                                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'stretch' }}>
                                                    {/* Question */}
                                                    <Box sx={{ flex: 2 }}>
                                                        <Typography variant="body2" color="primary" gutterBottom>
                                                            {index + 1}. {bet.question}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Max poäng: {bet.max_points}
                                                        </Typography>
                                                    </Box>
                                                    {/* Answer */}
                                                    <Box sx={{ flex: 2 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Valt alternativ:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                                                            {bet.selected_option}
                                                        </Typography>
                                                        {bet.correct_option && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Rätt svar:
                                                                </Typography>
                                                                <Typography 
                                                                    variant="body2" 
                                                                    color={bet.selected_option === bet.correct_option ? 'success.main' : 'error.main'}
                                                                    sx={{ fontWeight: bet.selected_option === bet.correct_option ? 'bold' : 'normal' }}
                                                                >
                                                                    {bet.correct_option}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    {/* Points */}
                                                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                        <Chip
                                                            label={bet.points > 0 ? `${bet.points}p` : '0p'}
                                                            color={bet.points > 0 ? 'success' : 'error'}
                                                            size="small"
                                                            sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 0.5, sm: 1.5 } }}
                                                        />
                                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                            {formatDateTime(bet.updated_at)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    ) : (
                        <Alert severity="info">
                            Denna användare har inte lagt några specialtips än.
                        </Alert>
                    )}
                </>
            )}
        </Container>
    );
}