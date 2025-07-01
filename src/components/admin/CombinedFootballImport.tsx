import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  Button,
} from '@mui/material';
import { CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import ApiFootballImport from './ApiFootballImport';
import { FootballDataImport } from './FootballDataImport';
import ExcelImport from './ExcelImport';

interface CombinedFootballImportProps {
  onImportComplete?: () => void;
}

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
      id={`football-import-tabpanel-${index}`}
      aria-labelledby={`football-import-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `football-import-tab-${index}`,
    'aria-controls': `football-import-tabpanel-${index}`,
  };
}

const CombinedFootballImport: React.FC<CombinedFootballImportProps> = ({ onImportComplete }) => {
  const [tabValue, setTabValue] = useState(0);
  const [footballDataDialogOpen, setFootballDataDialogOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFootballDataImportComplete = () => {
    onImportComplete?.();
    setFootballDataDialogOpen(false);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CloudDownloadIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Importera Lag och Matcher
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Välj mellan olika fotbollsdata-källor för att importera lag och matcher.
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>API-Football</strong> - Bredare utbud av ligor och mästerskap, inklusive dam-EM och internationella turneringar.<br />
          <strong>Football-Data.org</strong> - Fokuserad på europeiska ligor och vissa mästerskap.
        </Alert>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="football import tabs">
            <Tab label="API-Football" {...a11yProps(0)} />
            <Tab label="Football-Data.org" {...a11yProps(1)} />
            <Tab label="Excel Import" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ApiFootballImport onImportComplete={onImportComplete} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Football-Data.org tillhandahåller data för europeiska ligor och vissa mästerskap.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setFootballDataDialogOpen(true)}
              startIcon={<CloudDownloadIcon />}
            >
              Öppna Football-Data Import
            </Button>
          </Box>
          
          <FootballDataImport
            open={footballDataDialogOpen}
            onClose={() => setFootballDataDialogOpen(false)}
            onSuccess={handleFootballDataImportComplete}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ExcelImport onImportComplete={onImportComplete} />
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default CombinedFootballImport;
