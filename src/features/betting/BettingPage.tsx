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
import ReactMarkdown from 'react-markdown';
import { matchService } from '../../services/matchService';
import { betService } from '../../services/betService';
import { SystemConfigService } from '../../services/systemConfigService';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTournamentInfo } from '../../hooks/useTournamentInfo';
import { Match, Bet, MatchType } from '../../types/models';
import { BettingMatchCard } from '../../components/betting/BettingMatchCard';
import { KnockoutPredictionPage } from "../knockout/KnockoutPredictionPage";
import { SpecialBetsPage } from "./SpecialBetsPage";
import { useApp } from '../../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { siteContentService } from '../../services/siteContentService';
import { SiteContent } from '../../types/models';

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

export function BettingPage(props: { userId?: number }) {
    usePageTitle('Mina Tips');
    const { tournamentTipName } = useTournamentInfo();
    const { state } = useApp();
    const loggedInUser = state.user;
    const params = useParams<{ userId?: string }>();
    // userId to show/edit: from prop, or from route, or logged in user
    const userId = props.userId || (params.userId ? parseInt(params.userId, 10) : loggedInUser?.id);
    const isAdmin = loggedInUser?.role === 'admin';
    const [currentTab, setCurrentTab] = useState(0);
    const [matches, setMatches] = useState<Match[]>([]);
    const [userBets, setUserBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bettingLocked, setBettingLocked] = useState(false);
    const [pendingBets, setPendingBets] = useState<Map<number, any>>(new Map());
    const [savingAll, setSavingAll] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [rulesContent, setRulesContent] = useState<SiteContent | null>(null);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [rulesError, setRulesError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [userId]);
    const loadData = async () => {
        try {
            setLoading(true);
            const [matchesData, betsData, locked] = await Promise.all([
                matchService.getAllMatches(),
                isAdmin && userId && userId !== loggedInUser?.id ? betService.getUserBets(userId) : betService.getUserBets(),
                SystemConfigService.isBettingLocked(),
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
    };    const getUserBetForMatch = (matchId: number): Bet | undefined => {
        return userBets.find(bet => bet.match_id === matchId);
    };    const getPendingBetForMatch = (matchId: number): any => {
        return pendingBets.get(matchId);
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
                    ...betData,
                    ...(isAdmin && userId && userId !== loggedInUser?.id ? { user_id: userId } : {})
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

    const handleOpenRules = async () => {
        setRulesOpen(true);
        setRulesLoading(true);
        setRulesError(null);
        try {
            const content = await siteContentService.getContentByKey('homepage_rules');
            setRulesContent(content);
        } catch (err: any) {
            setRulesError('Kunde inte ladda reglerna.');
        } finally {
            setRulesLoading(false);
        }
    };
    const handleCloseRules = () => setRulesOpen(false);

    const groupMatches = matches.filter(match => match.matchType === MatchType.GROUP);

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

    // Visa varning om admin försöker redigera någon annans tips men inte är admin
    if (userId !== loggedInUser?.id && !isAdmin) {
        return <Alert severity="error">Du har inte behörighet att redigera andra användares tips.</Alert>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="outlined"
                    color="info"
                    startIcon={<InfoOutlinedIcon />}
                    onClick={handleOpenRules}
                    sx={{ fontWeight: 500 }}
                >
                    Poängberäkningsregler
                </Button>
            </Box>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
            >
                {tournamentTipName}
            </Typography>
            <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
                Tippa resultatet på samtliga gruppspelsmatcher. För slutspelet ska du välja vilka lag som går vidare till nästa omgång, se fliken Slutspel.
                Du ska även tippa ett antal specialtips, se fliken Specialtips.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {bettingLocked && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Tips är för tillfället låsta av administratören. Du kan inte lägga eller ändra dina tips.<br/>
                    {loggedInUser && (
                        <>
                            <br/>
                            <Link to={`/user/${loggedInUser.id}`} style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>
                                Gå till din resultatsida
                            </Link>
                        </>
                    )}
                </Alert>
            )}

            {!bettingLocked && pendingBets.size > 0 && (
                <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
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
                    variant="fullWidth"
                    sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            minHeight: { xs: 40, sm: 48 }
                        }
                    }}
                >
                    <Tab label="Gruppspel" />
                    <Tab label="Slutspel" />
                    <Tab label="Specialtips" />
                </Tabs>

                {/* Gruppspel-tabben */}
                <TabPanel value={currentTab} index={0}>
                    {Object.keys(groupsByLetter).sort().map(group => (
                        <Box key={group} sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Typography 
                                variant="h6" 
                                gutterBottom
                                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                            >
                                Grupp {group}
                            </Typography>
                            {groupsByLetter[group]
                                .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                .map(match => (
                                    <BettingMatchCard
                                        key={match.id}
                                        match={match}
                                        userBet={getUserBetForMatch(match.id)}
                                        onBetChange={handleBetChange}
                                        bettingLocked={bettingLocked}
                                        hasPendingChanges={pendingBets.has(match.id)}
                                        pendingBet={getPendingBetForMatch(match.id)}
                                    />
                                ))
                            }
                        </Box>
                    ))}
                </TabPanel>
                {/* Slutspel-tabben */}
                <TabPanel value={currentTab} index={1}>
                    <KnockoutPredictionPage userId={userId} />
                </TabPanel>
                {/* Special-tips-tabben */}
                <TabPanel value={currentTab} index={2}>
                    <SpecialBetsPage userId={userId} />
                </TabPanel>
            </Paper>

            {/* Sticky Save All Button - Improved for mobile */}
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
                        bottom: { xs: 16, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        zIndex: 1000,
                        boxShadow: 3,
                        minWidth: { xs: 'auto', sm: 'auto' },
                        '&:hover': {
                            boxShadow: 6,
                        },
                        // Hide text on very small screens, show only icon and count
                        '@media (max-width: 400px)': {
                            '& .MuiButton-startIcon': {
                                marginRight: 0.5
                            }
                        }
                    }}
                >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {savingAll ? 'Sparar...' : `Spara alla tips (${pendingBets.size})`}
                    </Box>
                    <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {savingAll ? 'Sparar...' : `Spara (${pendingBets.size})`}
                    </Box>
                </Button>
            )}

            <Dialog open={rulesOpen} onClose={handleCloseRules} maxWidth="md" fullWidth>
                <DialogTitle>Poängberäkningsregler</DialogTitle>
                <DialogContent dividers sx={{ background: 'background.paper' }}>
                    {rulesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                            <CircularProgress />
                        </Box>
                    ) : rulesError ? (
                        <Alert severity="error">{rulesError}</Alert>
                    ) : rulesContent ? (
                        rulesContent.content_type === 'html' ? (
                            <div className="mui-content" dangerouslySetInnerHTML={{ __html: rulesContent.content }} />
                        ) : rulesContent.content_type === 'markdown' ? (
                            <Box sx={{
                                '& h1': { fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 0 },
                                '& h2': { fontSize: '1.25rem', fontWeight: 600, mb: 1.5, mt: 2 },
                                '& h3': { fontSize: '1.1rem', fontWeight: 600, mb: 1 },
                                '& p': { mb: 1.5, lineHeight: 1.7 },
                                '& ul, & ol': { pl: 3, mb: 1.5 },
                                '& li': { mb: 0.5 },
                                '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
                                '& strong': { fontWeight: 600 },
                                '& code': { backgroundColor: 'grey.100', px: 0.5, py: 0.25, borderRadius: 0.5, fontSize: '0.9em' },
                                '& blockquote': { borderLeft: 4, borderColor: 'primary.main', pl: 2, ml: 0, fontStyle: 'italic', color: 'text.secondary' }
                            }}>
                                <ReactMarkdown>{rulesContent.content}</ReactMarkdown>
                            </Box>
                        ) : (
                            <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>{rulesContent.content}</Typography>
                        )
                    ) : null}
                </DialogContent>
            </Dialog>
        </Container>
    );
}