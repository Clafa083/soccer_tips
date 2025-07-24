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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { ArrowBack, SportsSoccer } from '@mui/icons-material';
import { publicService } from '../../services/publicService';
import { MatchBetsData } from '../../types/models';
import { generateFlagUrlForTeam } from '../../utils/flagUtils';
import { KnockoutBetsSummary } from '../../components/knockout/KnockoutBetsSummary';
import { MatchType } from '../../types/models';

interface TeamDisplayProps {
    teamName: string;
    flagUrl: string;
}

function TeamDisplay({ teamName, flagUrl }: TeamDisplayProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
                src={flagUrl} 
                alt={`${teamName} flag`} 
                style={{ width: 24, height: 16, objectFit: 'cover' }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {teamName}
            </Typography>
        </Box>
    );
}

export function MatchDetailsPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<MatchBetsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (matchId) {
            loadMatchBets(parseInt(matchId, 10));
        }
    }, [matchId]);    const loadMatchBets = async (id: number) => {
        try {
            setLoading(true);
            const response = await publicService.getMatchBets(id);
            setData(response);
            setError(null);
        } catch (err) {
            console.error('Error loading match bets:', err);
            setError('Kunde inte ladda matchdetaljer');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMatchTypeLabel = (matchType: string) => {
        switch (matchType) {
            case 'GROUP': return 'Gruppspel';
            case 'ROUND_OF_16': return 'Åttondelsfinaler';
            case 'QUARTER_FINAL': return 'Kvartsfinaler';
            case 'SEMI_FINAL': return 'Semifinaler';
            case 'FINAL': return 'Final';
            default: return matchType;
        }
    };

    const getPointsColor = (points: number): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
        if (points === 0) return 'default';
        if (points === 1) return 'info';
        if (points === 2) return 'primary';
        if (points >= 3) return 'success';
        return 'default';
    };

    const renderBetDisplay = (bet: any, matchType: string) => {
        if (matchType === 'GROUP') {
            return `${bet.bet.home_score} - ${bet.bet.away_score}`;
        } else {
            // Knockout stage
            const teams = [];
            if (bet.bet.home_team_name) teams.push(bet.bet.home_team_name);
            if (bet.bet.away_team_name) teams.push(bet.bet.away_team_name);
            return teams.length > 0 ? teams.join(' vs ') : 'Inget tips';
        }
    };

    // Helper: convert string to MatchType enum
    function toMatchTypeEnum(val: string): MatchType {
        switch (val) {
            case 'GROUP': return MatchType.GROUP;
            case 'ROUND_OF_16': return MatchType.ROUND_OF_16;
            case 'QUARTER_FINAL': return MatchType.QUARTER_FINAL;
            case 'SEMI_FINAL': return MatchType.SEMI_FINAL;
            case 'FINAL': return MatchType.FINAL;
            default: return val as MatchType;
        }
    }

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
                <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/matches')}
                >
                    Tillbaka till matcher
                </Button>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error || 'Matchdetaljer kunde inte laddas'}
                </Alert>
            </Container>
        );
    }

    const { match, bets } = data;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/matches')}
                    sx={{ mb: 2 }}
                >
                    Tillbaka till matcher
                </Button>
            </Box>

            {/* Match Header */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Matchdetaljer
                        </Typography>
                        
                        <Chip 
                            label={getMatchTypeLabel(match.matchType)}
                            color="primary" 
                            sx={{ mb: 2 }}
                        />
                        
                        {match.group && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Grupp {match.group}
                            </Typography>
                        )}
                        
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            {formatDateTime(match.matchTime)}
                        </Typography>

                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 4,
                            mb: 2
                        }}>
                            <TeamDisplay 
                                teamName={match.home_team_name}
                                flagUrl={generateFlagUrlForTeam(match.home_team_name)}
                            />
                            
                            <Box sx={{ textAlign: 'center' }}>
                                {match.status === 'finished' && match.home_score !== null && match.away_score !== null ? (
                                    <Typography variant="h3" color="primary">
                                        {match.home_score} - {match.away_score}
                                    </Typography>
                                ) : (
                                    <Typography variant="h4" color="text.secondary">
                                        vs
                                    </Typography>
                                )}
                                <Chip 
                                    label={match.status === 'finished' ? 'Slutspelad' : 
                                           match.status === 'live' ? 'Pågår' : 'Kommande'}
                                    color={match.status === 'finished' ? 'success' : 
                                           match.status === 'live' ? 'warning' : 'default'}
                                    size="small"
                                />
                            </Box>
                            
                            <TeamDisplay 
                                teamName={match.away_team_name}
                                flagUrl={generateFlagUrlForTeam(match.away_team_name)}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Knockout Bets Summary (endast knockoutmatcher) */}
            {match.matchType !== 'GROUP' && (
                <KnockoutBetsSummary match={{
                  ...match,
                  created_at: '',
                  updated_at: '',
                  status: match.status as 'scheduled' | 'live' | 'finished',
                  matchType: toMatchTypeEnum(match.matchType)
                }} />
            )}

            {/* Bets Table */}
            {match.matchType === 'GROUP' && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <SportsSoccer color="primary" />
                            <Typography variant="h5">
                                Alla tips för denna match ({bets.length} st)
                            </Typography>
                        </Box>
                        {bets.length === 0 ? (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                Inga tips har lagts för denna match än
                            </Typography>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Spelare</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Tips</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Poäng</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Tipptid</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bets.map((bet) => (
                                            <TableRow 
                                                key={bet.id}
                                                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar 
                                                            src={bet.user.image_url}
                                                            sx={{ width: 32, height: 32 }}
                                                        >
                                                            {bet.user.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                                {bet.user.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                @{bet.user.username}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
                                                        {renderBetDisplay(bet, match.matchType)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${bet.points} p`}
                                                        color={getPointsColor(bet.points)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(bet.created_at).toLocaleDateString('sv-SE')}
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
            )}
        </Container>
    );
}
