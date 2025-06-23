import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Container,
    Paper,
    Alert,
    CircularProgress,
    Button,
    Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { matchService } from '../../services/matchService';
import { betService } from '../../services/betService';
import { SystemConfigService } from '../../services/systemConfigService';
import { Match, Bet, MatchType } from '../../types/models';
import { BettingMatchCard } from '../../components/betting/BettingMatchCard';

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

export function BettingPage() {    const [currentTab, setCurrentTab] = useState(0);
    const [matches, setMatches] = useState<Match[]>([]);
    const [userBets, setUserBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bettingLocked, setBettingLocked] = useState(false);
    const [pendingBets, setPendingBets] = useState<Map<number, any>>(new Map());
    const [savingAll, setSavingAll] = useState(false);

    useEffect(() => {
        loadData();
    }, []);    const loadData = async () => {
        try {
            setLoading(true);
            const [matchesData, betsData, locked] = await Promise.all([
                matchService.getAllMatches(),
                betService.getUserBets(),
                SystemConfigService.isBettingLocked()
            ]);
            
            setMatches(matchesData);
            setBettingLocked(locked);
            setUserBets(betsData.map(betWithMatch => ({
                id: betWithMatch.id,
                user_id: betWithMatch.user_id,
                match_id: betWithMatch.match_id,
                home_score: betWithMatch.home_score,
                away_score: betWithMatch.away_score,
                home_team_id: betWithMatch.home_team_id,
                away_team_id: betWithMatch.away_team_id,
                points: betWithMatch.points,
                created_at: betWithMatch.created_at,
                updated_at: betWithMatch.updated_at
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
    };

    const getUserBetForMatch = (matchId: number): Bet | undefined => {
        return userBets.find(bet => bet.match_id === matchId);
    };    const handleBetUpdate = async (matchId: number, betData: any) => {
        if (bettingLocked) {
            setError('Betting is currently locked by administrator');
            return;
        }
        
        try {
            await betService.createOrUpdateBet({
                match_id: matchId,
                ...betData
            });
            // Reload bets to get updated data
            await loadData();
        } catch (err) {
            console.error('Error updating bet:', err);
            setError('Failed to update bet');
        }
    };

    // New function to handle pending bet changes without immediately saving
    const handleBetChange = (matchId: number, betData: any) => {
        setPendingBets(prev => {
            const newPending = new Map(prev);
            // Merge with existing pending data to preserve all fields
            const existingData = newPending.get(matchId) || {};
            newPending.set(matchId, { ...existingData, ...betData });
            return newPending;
        });
    };

    // Function to save all pending bets
    const handleSaveAllBets = async () => {
        if (bettingLocked || pendingBets.size === 0) {
            return;
        }

        setSavingAll(true);
        setError(null);

        try {
            // Save all pending bets in parallel
            const savePromises = Array.from(pendingBets.entries()).map(([matchId, betData]) =>
                betService.createOrUpdateBet({
                    match_id: matchId,
                    ...betData
                })
            );

            await Promise.all(savePromises);
            
            // Clear pending bets and reload data
            setPendingBets(new Map());
            await loadData();
        } catch (err) {
            console.error('Error saving all bets:', err);
            setError('Kunde inte spara alla tips');
        } finally {
            setSavingAll(false);
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
            <Typography variant="h4" component="h1" gutterBottom>
                VM-Tipset
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Placera dina tips på VM-matcherna. Du kan tippa resultatet på gruppspelsmatcher och vilka lag som går vidare i slutspelet.
            </Typography>            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {bettingLocked && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Betting is currently locked by the administrator. You cannot place or modify bets at this time.
                </Alert>
            )}

            {!bettingLocked && pendingBets.size > 0 && (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                        label={`${pendingBets.size} osparade ändringar`} 
                        color="warning" 
                        size="medium"
                    />
                </Box>
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
                            </Typography>                            {groupsByLetter[group]
                                .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                .map(match => (
                                    <BettingMatchCard
                                        key={match.id}
                                        match={match}
                                        userBet={getUserBetForMatch(match.id)}
                                        onBetUpdate={handleBetUpdate}
                                        onBetChange={handleBetChange}
                                        bettingLocked={bettingLocked}
                                        hasPendingChanges={pendingBets.has(match.id)}
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
                                </Typography>                                {stageMatches
                                    .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                    .map(match => (
                                        <BettingMatchCard
                                            key={match.id}
                                            match={match}
                                            userBet={getUserBetForMatch(match.id)}
                                            onBetUpdate={handleBetUpdate}
                                            onBetChange={handleBetChange}
                                            bettingLocked={bettingLocked}
                                            hasPendingChanges={pendingBets.has(match.id)}
                                        />
                                    ))
                                }
                            </Box>
                        );
                    })}
                </TabPanel>
            </Paper>

            {/* Sticky Save All Button */}
            {!bettingLocked && pendingBets.size > 0 && (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAllBets}
                    disabled={savingAll}
                    sx={{ 
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontSize: '1.1rem',
                        zIndex: 1000,
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        }
                    }}
                >
                    {savingAll ? 'Sparar...' : `Spara alla tips (${pendingBets.size})`}
                </Button>
            )}
        </Container>
    );
}