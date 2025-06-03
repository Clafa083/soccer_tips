import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Container,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { matchService } from '../../services/matchService';
import { betService } from '../../services/betService';
import { adminService } from '../../services/adminService';
import { Match, Bet, MatchType } from '../../types/models';
import { BettingMatchCard } from '../../components/betting/BettingMatchCard';
import { useApp } from '../../context/AppContext';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`betting-tabpanel-${index}`}
            aria-labelledby={`betting-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function BettingPage() {
    const [currentTab, setCurrentTab] = useState(0);
    const [matches, setMatches] = useState<Match[]>([]);
    const [userBets, setUserBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [betsLocked, setBetsLocked] = useState<boolean | undefined>(undefined);
    const { state } = useApp();    useEffect(() => {
        loadData();
        adminService.getBetsLocked().then(setBetsLocked).catch(() => setBetsLocked(undefined));
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [matchesData, betsData] = await Promise.all([
                matchService.getAllMatches(),
                betService.getUserBets()
            ]);
            setMatches(matchesData);            setUserBets(betsData.map(betWithMatch => ({
                id: betWithMatch.id,
                userId: betWithMatch.userId,
                matchId: betWithMatch.matchId,
                homeScoreBet: betWithMatch.homeScoreBet,
                awayScoreBet: betWithMatch.awayScoreBet,
                homeTeamId: betWithMatch.homeTeamId,
                awayTeamId: betWithMatch.awayTeamId,
                points: betWithMatch.points,
                createdAt: betWithMatch.createdAt,
                updatedAt: betWithMatch.updatedAt
            })));
            setError(null);
        } catch (err) {
            console.error('Error loading betting data:', err);
            setError('Failed to load betting data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };    const getUserBetForMatch = (matchId: number): Bet | undefined => {
        return userBets.find(bet => bet.matchId === matchId);
    };    const handleBetUpdate = async (matchId: number, betData: any) => {
        try {
            if (!state.user?.id) {
                setError('Du måste vara inloggad för att tippa');
                return;
            }
            
            await betService.createOrUpdateBet({
                matchId,
                userId: state.user.id,
                homeScoreBet: betData.homeScore,
                awayScoreBet: betData.awayScore,
                homeTeamId: betData.homeTeamId,
                awayTeamId: betData.awayTeamId
            });
            // Reload bets to get updated data
            await loadData();
        } catch (err) {
            console.error('Error updating bet:', err);
            setError('Failed to update bet');
        }
    };

    const groupMatches = matches.filter(match => match.matchType === MatchType.GROUP);
    const knockoutMatches = matches.filter(match => match.matchType !== MatchType.GROUP);

    const groupsByLetter = groupMatches.reduce((acc, match) => {
        const group = match.group || 'Unknown';
        if (!acc[group]) acc[group] = [];
        acc[group].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

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
            {betsLocked === true && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Betting är <b>låst</b> av administratör. Du kan inte lägga till eller ändra tips just nu.
                </Alert>
            )}

            <Typography variant="h4" component="h1" gutterBottom>
                VM-Tipset
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Placera dina tips på VM-matcherna. Du kan tippa resultatet på gruppspelsmatcher och vilka lag som går vidare i slutspelet.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ width: '100%' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    aria-label="betting tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Gruppspel" />
                    <Tab label="Slutspel" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    {Object.keys(groupsByLetter).sort().map(group => (
                        <Box key={group} sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Grupp {group}
                            </Typography>
                            {groupsByLetter[group]
                                .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                .map(match => (
                                    <BettingMatchCard
                                        key={match.id}
                                        match={match}
                                        userBet={getUserBetForMatch(match.id)}
                                        onBetUpdate={handleBetUpdate}
                                        betsLocked={betsLocked}
                                    />
                                ))
                            }
                        </Box>
                    ))}
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    {['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'].map(stage => {
                        const stageMatches = knockoutMatches.filter(match => match.matchType === stage);
                        if (stageMatches.length === 0) return null;

                        const stageNames = {
                            'ROUND_OF_16': 'Åttondelsfinaler',
                            'QUARTER_FINAL': 'Kvartsfinaler',
                            'SEMI_FINAL': 'Semifinaler',
                            'FINAL': 'Final'
                        };

                        return (
                            <Box key={stage} sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    {stageNames[stage as keyof typeof stageNames]}
                                </Typography>
                                {stageMatches
                                    .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                    .map(match => (
                                        <BettingMatchCard
                                            key={match.id}
                                            match={match}
                                            userBet={getUserBetForMatch(match.id)}
                                            onBetUpdate={handleBetUpdate}
                                            betsLocked={betsLocked}
                                        />
                                    ))
                                }
                            </Box>
                        );
                    })}
                </TabPanel>
            </Paper>
        </Container>
    );
}