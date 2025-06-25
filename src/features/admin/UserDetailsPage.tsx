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
    Stack
} from '@mui/material';
import { ArrowBack, EmojiEvents, SportsSoccer, Star } from '@mui/icons-material';
import { publicService } from '../../services/publicService';
import { UserBetsData, UserBet } from '../../types/models';
import { generateFlagUrlForTeam } from '../../utils/flagUtils';

export function UserDetailsPage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<UserBetsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const getMatchTypeLabel = (matchType: string) => {
        const labels = {
            'GROUP': 'Gruppspel',
            'ROUND_OF_16': 'Åttondelsfinaler',
            'QUARTER_FINAL': 'Kvartsfinaler',
            'SEMI_FINAL': 'Semifinaler',
            'FINAL': 'Final'
        };
        return labels[matchType as keyof typeof labels] || matchType;
    };

    const getPointsColor = (points: number) => {
        if (points === 0) return 'default';
        if (points <= 1) return 'warning';
        if (points <= 3) return 'info';
        return 'success';
    };    const TeamDisplay = ({ teamName, flagUrl }: { teamName: string | null | undefined; flagUrl?: string }) => {
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

    const totalPoints = data.bets.reduce((sum, bet) => sum + bet.points, 0) + 
                       (data.special_bets?.reduce((sum, bet) => sum + bet.points, 0) || 0);
    const groupedBets = data.bets.reduce((acc, bet) => {
        const matchType = bet.match.matchType;
        if (!acc[matchType]) acc[matchType] = [];
        acc[matchType].push(bet);
        return acc;
    }, {} as Record<string, UserBet[]>);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/leaderboard')}
                    sx={{ mb: 2 }}
                >
                    Tillbaka till resultattavlan
                </Button>
            </Box>

            {/* User Header */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            src={data.user.image_url}
                            sx={{ width: 64, height: 64 }}
                        >
                            {data.user.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" gutterBottom>
                                {data.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {data.user.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Medlem sedan: {formatDateTime(data.user.created_at)}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <EmojiEvents color="primary" />
                                <Typography variant="h5" color="primary">
                                    {totalPoints}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Totala poäng
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Bets by Match Type */}
            {Object.entries(groupedBets).map(([matchType, bets]) => (
                <Card key={matchType} sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SportsSoccer />
                            {getMatchTypeLabel(matchType)}
                            <Chip 
                                label={`${bets.length} tips`} 
                                size="small" 
                                variant="outlined" 
                            />
                        </Typography>
                        
                        <Stack spacing={2}>
                            {bets.map((bet) => (
                                <Card key={bet.id} variant="outlined">                                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'stretch' }}>
                                            {/* Match Info */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDateTime(bet.match.matchTime)}
                                                    {bet.match.group && ` • Grupp ${bet.match.group}`}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                    <TeamDisplay 
                                                        teamName={bet.match.home_team_name}
                                                        flagUrl={generateFlagUrlForTeam(bet.match.home_team_name)}
                                                    />
                                                    <Typography variant="body2" sx={{ mx: 1 }}>vs</Typography>
                                                    <TeamDisplay 
                                                        teamName={bet.match.away_team_name}
                                                        flagUrl={generateFlagUrlForTeam(bet.match.away_team_name)}
                                                    />
                                                </Box>
                                                {bet.match.status === 'finished' && (
                                                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                                        {bet.match.home_score} - {bet.match.away_score}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Bet Info */}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Ditt tips:
                                                </Typography>
                                                {matchType === 'GROUP' ? (
                                                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                                                        {bet.bet.home_score} - {bet.bet.away_score}
                                                    </Typography>
                                                ) : (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        {bet.bet.home_team_name && (
                                                            <TeamDisplay 
                                                                teamName={bet.bet.home_team_name}
                                                                flagUrl={generateFlagUrlForTeam(bet.bet.home_team_name)}
                                                            />
                                                        )}
                                                        {bet.bet.away_team_name && (
                                                            <TeamDisplay 
                                                                teamName={bet.bet.away_team_name}
                                                                flagUrl={generateFlagUrlForTeam(bet.bet.away_team_name)}
                                                            />
                                                        )}
                                                    </Box>                                                )}
                                            </Box>

                                            {/* Points */}
                                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                <Chip
                                                    label={`${bet.points} poäng`}
                                                    color={getPointsColor(bet.points)}
                                                    size="medium"
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>            ))}

            {/* Special Bets */}
            {data.special_bets && data.special_bets.length > 0 && (
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
                                            </Box>                                            {/* Answer */}
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
                                                    label={`${bet.points} poäng`}
                                                    color={getPointsColor(bet.points)}
                                                    size="medium"
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
            )}            {data.bets.length === 0 && (!data.special_bets || data.special_bets.length === 0) && (
                <Alert severity="info">
                    Denna användare har inte placerat några tips än.
                </Alert>
            )}
        </Container>
    );
}
