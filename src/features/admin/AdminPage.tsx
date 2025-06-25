import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import { TeamManagement } from './TeamManagement';
import { MatchManagement } from './MatchManagement';
import { ResultsManagement } from './ResultsManagement';
import { ScoringManagement } from './ScoringManagement';
import { UserManagement } from './UserManagement';
import SystemSettings from './SystemSettings';
import { SpecialBetsManagement } from './SpecialBetsManagement';

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

            <Paper sx={{ width: '100%' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    aria-label="admin tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                    variant="scrollable"
                    scrollButtons="auto"
                >                    <Tab label="Lag" />
                    <Tab label="Matcher" />
                    <Tab label="Resultat" />
                    <Tab label="Poäng" />
                    <Tab label="Special-tips" />
                    <Tab label="Användare" />
                    <Tab label="Inställningar" />
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
                    <SpecialBetsManagement />
                </TabPanel>

                <TabPanel value={currentTab} index={5}>
                    <UserManagement />
                </TabPanel>

                <TabPanel value={currentTab} index={6}>
                    <SystemSettings />
                </TabPanel>
            </Paper>
        </Container>
    );
}