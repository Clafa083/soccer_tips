import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    Stack,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import { EmojiEvents, TrendingUp } from '@mui/icons-material';
import { leaderboardService } from '../../services/leaderboardService';

interface LeaderboardEntry {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    createdAt: Date;
    totalPoints: number;
    totalBets: number;
}

export function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const data = await leaderboardService.getLeaderboard();
            setLeaderboard(data);
            setError(null);
        } catch (err) {
            console.error('Error loading leaderboard:', err);
            setError('Kunde inte ladda resultattavlan');
        } finally {
            setLoading(false);
        }
    };

    const getPositionColor = (position: number) => {
        if (position === 1) return 'gold';
        if (position === 2) return 'silver';
        if (position === 3) return '#CD7F32'; // Bronze
        return 'text.secondary';
    };

    const getPositionIcon = (position: number) => {
        if (position <= 3) return '🏆';
        if (position <= 10) return '🥇';
        return '';
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmojiEvents color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h3" component="h1">
                        Resultattavla
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Se hur du står dig mot andra deltagare i VM-tipset
                </Typography>
            </Box>

            {/* Top 3 Highlight */}
            {leaderboard.length >= 3 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp />
                        Topp 3
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="center">
                        {leaderboard.slice(0, 3).map((entry, index) => (
                            <Card 
                                key={entry.id} 
                                sx={{ 
                                    flex: 1,
                                    maxWidth: { xs: '100%', md: 300 },
                                    borderColor: getPositionColor(index + 1),
                                    border: 2,
                                    position: 'relative'
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                        <Typography variant="h4">
                                            {getPositionIcon(index + 1)}
                                        </Typography>
                                    </Box>
                                    <Typography 
                                        variant="h4" 
                                        color={getPositionColor(index + 1)}
                                        sx={{ fontWeight: 'bold', mb: 2 }}
                                    >
                                        #{index + 1}
                                    </Typography>
                                    <Avatar 
                                        src={entry.imageUrl} 
                                        sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            mx: 'auto', 
                                            mb: 2,
                                            border: 2,
                                            borderColor: getPositionColor(index + 1)
                                        }}
                                    >
                                        {entry.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {entry.name}
                                    </Typography>
                                    <Chip 
                                        label={`${entry.totalPoints} poäng`}
                                        color="primary"
                                        sx={{ 
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            mb: 1
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {entry.totalBets} tips • {entry.totalBets > 0 
                                            ? (entry.totalPoints / entry.totalBets).toFixed(1)
                                            : '0.0'
                                        } poäng/tips
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Full Leaderboard Table */}
            <Box>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Fullständig resultattavla
                </Typography>
                
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width="80px">Plats</TableCell>
                                <TableCell>Användare</TableCell>
                                <TableCell align="center">Tips</TableCell>
                                <TableCell align="center">Poäng</TableCell>
                                <TableCell align="center">Snitt</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((entry, index) => (
                                <TableRow 
                                    key={entry.id}
                                    sx={{ 
                                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                        ...(index < 3 && { 
                                            bgcolor: 'rgba(255, 215, 0, 0.1)',
                                            '&:hover': { bgcolor: 'rgba(255, 215, 0, 0.2)' }
                                        })
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography 
                                                variant="h6" 
                                                color={getPositionColor(index + 1)}
                                                fontWeight="bold"
                                            >
                                                {index + 1}
                                            </Typography>
                                            {index < 10 && (
                                                <Typography variant="body2">
                                                    {getPositionIcon(index + 1)}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                src={entry.imageUrl} 
                                                sx={{ width: 32, height: 32 }}
                                            >
                                                {entry.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body1" fontWeight={index < 3 ? 'bold' : 'normal'}>
                                                {entry.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {entry.totalBets}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography 
                                            variant="body1" 
                                            fontWeight="bold"
                                            color={index < 3 ? 'primary' : 'text.primary'}
                                        >
                                            {entry.totalPoints}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            {entry.totalBets > 0 
                                                ? (entry.totalPoints / entry.totalBets).toFixed(1)
                                                : '0.0'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leaderboard.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>
                                            Inga användare med poäng än
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {leaderboard.length > 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Poäng beräknas automatiskt när matchresultat läggs till av administratörer.<br />
                        Gruppspel: 3 poäng för exakt resultat, 1 poäng för rätt utgång (vinst/förlust/oavgjort).
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
