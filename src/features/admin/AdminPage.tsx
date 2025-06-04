import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress
} from '@mui/material';
import { TeamManagement } from './TeamManagement';
import { MatchManagement } from './MatchManagement';
import { ResultsManagement } from './ResultsManagement';
import { ScoringManagement } from './ScoringManagement';
import { KnockoutScoringManagement } from './KnockoutScoringManagement';
import { UserManagement } from './UserManagement';
import { adminService } from '../../services/adminService';

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
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
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

export function AdminPage() {
    const [currentTab, setCurrentTab] = useState(0);
    const [betsLocked, setBetsLocked] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        adminService.getBetsLocked().then(setBetsLocked).catch(() => setError('Kunde inte hämta betting-lås.'));
    }, []);

    const handleToggle = async () => {
        if (betsLocked === null) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await adminService.setBetsLocked(!betsLocked);
            setBetsLocked(!betsLocked);
            setSuccess(!betsLocked ? 'Betting är nu låst.' : 'Betting är nu öppen.');
        } catch {
            setError('Kunde inte ändra betting-lås.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Administration
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Hantera lag, matcher och resultat för VM-tipset.
            </Typography>
            <Box sx={{ mb: 2 }}>
                <FormControlLabel
                    control={<Switch checked={!!betsLocked} onChange={handleToggle} disabled={betsLocked === null || loading} />}
                    label={betsLocked ? 'Betting är låst (användare kan EJ ändra sina tips)' : 'Betting är öppen (användare kan ändra sina tips)'}
                />
                {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
            </Box>

            <Paper sx={{ width: '100%' }}>                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    aria-label="admin tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Lag" />
                    <Tab label="Matcher" />
                    <Tab label="Resultat" />
                    <Tab label="Poäng" />
                    <Tab label="Knockout Poäng" />
                    <Tab label="Användare" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    <TeamManagement />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    <MatchManagement />
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    <ResultsManagement />
                </TabPanel>                <TabPanel value={currentTab} index={3}>
                    <ScoringManagement />
                </TabPanel>

                <TabPanel value={currentTab} index={4}>
                    <KnockoutScoringManagement />
                </TabPanel>

                <TabPanel value={currentTab} index={5}>
                    <UserManagement />
                </TabPanel>
            </Paper>
        </Container>
    );
}