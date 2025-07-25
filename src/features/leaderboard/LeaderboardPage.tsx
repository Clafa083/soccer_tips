import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Button,
    IconButton
} from '@mui/material';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
    EmojiEvents as TrophyIcon,
    Person as PersonIcon,
    Star as StarIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { leaderboardService } from '../../services/leaderboardService';
import { PointsHistoryChart } from '../../components/charts/PointsHistoryChart';
import Cookies from 'js-cookie';

interface LeaderboardEntry {
    id: number;
    username: string;
    name: string;
    email: string;
    image_url?: string;
    total_points: number;
    total_bets: number;
    rank: number;
    created_at: string;
    total_knockout_points?: number; // Added for knockout points
}

interface LeaderboardStats {
    totalUsers: number;
    totalBets: number;
    averagePoints: number;
    topScorer: LeaderboardEntry | null;
}

export function LeaderboardPage() {
    usePageTitle('Resultattavla');
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = useState<LeaderboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartOpen, setChartOpen] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                  const [leaderboardData, statsData] = await Promise.all([
                    leaderboardService.getLeaderboard(),
                    leaderboardService.getLeaderboardStats()
                ]);
                
                setLeaderboard(leaderboardData);
                setStats(statsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ett fel uppstod');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const savedFavorites = Cookies.get('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const handleFavoriteToggle = (id: number) => {
        const newFavorites = favorites.includes(id)
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        Cookies.set('favorites', JSON.stringify(newFavorites));
    };

    const toggleShowFavorites = () => {
        setShowFavoritesOnly(!showFavoritesOnly);
    };

    const filteredLeaderboard = showFavoritesOnly
        ? leaderboard.filter(entry => favorites.includes(entry.id))
        : leaderboard;

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; // Guld
            case 2: return '#C0C0C0'; // Silver
            case 3: return '#CD7F32'; // Brons
            default: return 'text.secondary';
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank <= 3) {
            return <TrophyIcon sx={{ color: getRankColor(rank), fontSize: 20 }} />;
        }
        return rank;
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrophyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Resultattavla
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    onClick={() => setChartOpen(true)}
                    sx={{ ml: 'auto' }}
                >
                    Visa Poängresa
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {stats && (
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr 1fr'
                    },
                    gap: 3,
                    mb: 4
                }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.totalUsers}
                            </Typography>
                            <Typography color="text.secondary">
                                Antal deltagare
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <StarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />                            <Typography variant="h4" component="div">
                                {stats.averagePoints?.toFixed(1) || '0.0'}
                            </Typography>
                            <Typography color="text.secondary">
                                Snittpoäng
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrophyIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.topScorer?.total_points || 0}
                            </Typography>
                            <Typography color="text.secondary">
                                Högsta poäng
                            </Typography>
                            {stats.topScorer && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {stats.topScorer.name}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}
            <Button variant="contained" color="primary" onClick={toggleShowFavorites} sx={{ mb: 2 }}>
                {showFavoritesOnly ? 'Visa alla tippare' : 'Visa endast favorittippare'}
            </Button>
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Plats</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Spelare</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Poäng</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Antal tips</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Medlem sedan</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Favorit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLeaderboard.length === 0 ? (
                                <TableRow>
                                    <TableCell 
                                        colSpan={5} 
                                        align="center" 
                                        sx={{ 
                                            py: 4,
                                            // Adjust colspan for mobile (3 columns) vs desktop (5 columns)
                                            '@media (max-width: 960px)': {
                                                // On mobile, we effectively have 3 columns (Plats, Spelare, Poäng)
                                            }
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            Inga resultat hittades än
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeaderboard.map((entry) => (
                                    <TableRow 
                                        key={entry.id}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                            ...(entry.rank <= 3 && {
                                                backgroundColor: `${getRankColor(entry.rank)}20`,
                                                fontWeight: 'bold'
                                            })
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getRankIcon(entry.rank)}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar 
                                                    src={entry.image_url}
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        mr: 2,
                                                        fontSize: 14 
                                                    }}
                                                >
                                                    {entry.name.charAt(0).toUpperCase()}
                                                </Avatar>                                                <Box>
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: 'medium',
                                                            cursor: 'pointer',
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                        onClick={() => navigate(`/user/${entry.id}`)}
                                                    >
                                                        {entry.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        @{entry.username}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box>
                                                <Chip 
                                                    label={entry.total_points}
                                                    color={entry.rank <= 3 ? 'primary' : 'default'}
                                                    variant={entry.rank <= 3 ? 'filled' : 'outlined'}
                                                />
                                                {typeof entry.total_knockout_points === 'number' && (
                                                    <Typography variant="caption" color="secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        Slutspel: {entry.total_knockout_points}p
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            <Typography>
                                                {entry.total_bets}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(entry.created_at).toLocaleDateString('sv-SE')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleFavoriteToggle(entry.id)}
                                                sx={{
                                                    color: favorites.includes(entry.id) ? 'gold' : 'gray',
                                                    '&:hover': {
                                                        color: favorites.includes(entry.id) ? 'gold' : 'gray',
                                                    },
                                                }}
                                            >
                                                <StarIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {leaderboard.length > 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Visar {leaderboard.length} deltagare
                    </Typography>
                </Box>
            )}

            <PointsHistoryChart
                open={chartOpen}
                onClose={() => setChartOpen(false)}
            />
        </Container>
    );
}
