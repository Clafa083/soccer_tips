import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { excelImportService, ExcelTeam, ExcelMatch } from '../../services/excelImportService';

interface ExcelImportProps {
  onImportComplete?: () => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImportComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // File data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedTeams, setParsedTeams] = useState<ExcelTeam[]>([]);
  const [parsedMatches, setParsedMatches] = useState<ExcelMatch[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Kontrollera filtyp
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Ogiltig filtyp. Endast Excel-filer (.xlsx, .xls) och CSV-filer stöds.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setSuccess(null);
    setParsedTeams([]);
    setParsedMatches([]);
    setShowPreview(false);
    
    // Parse filen automatiskt
    await parseFile(file);
  };

  const parseFile = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const { teams, matches } = await excelImportService.readExcelFile(file);
      setParsedTeams(teams);
      setParsedMatches(matches);
      
      if (teams.length === 0 && matches.length === 0) {
        setError('Ingen giltig data hittades i filen. Kontrollera att kolumnerna har rätt namn.');
      } else {
        setSuccess(`Filen parsades framgångsrikt! Hittade ${teams.length} lag och ${matches.length} matcher.`);
      }
    } catch (err) {
      setError(`Fel vid parsing av fil: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const importTeams = async () => {
    if (parsedTeams.length === 0) {
      setError('Inga lag att importera.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await excelImportService.importTeamsToDatabase(parsedTeams);
      
      if (result.success) {
        setSuccess(result.message);
        onImportComplete?.();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Fel vid import: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const importMatches = async () => {
    if (parsedMatches.length === 0) {
      setError('Inga matcher att importera.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await excelImportService.importMatchesToDatabase(parsedMatches);
      
      if (result.success) {
        let message = result.message;
        if (result.errors && result.errors.length > 0) {
          message += '\n\nVarningar:\n' + result.errors.join('\n');
        }
        setSuccess(message);
        onImportComplete?.();
      } else {
        let errorMessage = result.message;
        if (result.errors && result.errors.length > 0) {
          errorMessage += '\n\nDetaljer:\n' + result.errors.join('\n');
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError(`Fel vid import: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadExampleFile = (type: 'teams' | 'matches') => {
    excelImportService.generateExampleFile(type);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CloudUploadIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Excel Import
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Importera lag och matcher från Excel-filer (.xlsx, .xls) eller CSV-filer.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Steg 1: Ladda ner exempel-filer */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              1. Ladda ner exempel-filer (valfritt)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ladda ner exempel-filer för att se vilka kolumner som stöds:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadExampleFile('teams')}
                size="small"
              >
                Exempel Lag
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadExampleFile('matches')}
                size="small"
              >
                Exempel Matcher
              </Button>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Kolumner som stöds för lag:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Namn/Name/Team (obligatorisk), Kort_namn/Short_name, Grupp/Group, Flagga_url/Flag_url
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Kolumner som stöds för matcher:
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                Hemmalag/HomeTeam (obligatorisk), Bortalag/AwayTeam (obligatorisk), Datum/Date (obligatorisk), MatchType/Typ, Grupp/Group
                <br />
                <strong>⚠️ Viktigt:</strong> Om du får felmeddelande om datum, formatera datum-kolumnen som Text i Excel och använd YYYY-MM-DD format.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Steg 2: Välj fil */}
        <Accordion expanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              2. Välj Excel-fil
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="excel-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="excel-file-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                  disabled={loading}
                  size="large"
                >
                  Välj Excel-fil
                </Button>
              </label>
              
              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={selectedFile.name}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Steg 3: Förhandsgranska data */}
        {(parsedTeams.length > 0 || parsedMatches.length > 0) && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                3. Förhandsgranska data
              </Typography>
              <Tooltip title="Förhandsgranska">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(!showPreview);
                  }}
                  sx={{ ml: 1 }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Hittade {parsedTeams.length} lag och {parsedMatches.length} matcher i filen.
                </Typography>
              </Box>

              {showPreview && (
                <Box>
                  {/* Lag-förhandsgranskning */}
                  {parsedTeams.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Lag ({parsedTeams.length}):
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Namn</TableCell>
                              <TableCell>Kort namn</TableCell>
                              <TableCell>Grupp</TableCell>
                              <TableCell>Flagga URL</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parsedTeams.slice(0, 5).map((team, index) => (
                              <TableRow key={index}>
                                <TableCell>{team.name}</TableCell>
                                <TableCell>{team.short_name || '-'}</TableCell>
                                <TableCell>{team.group || '-'}</TableCell>
                                <TableCell>{team.flag_url || '-'}</TableCell>
                              </TableRow>
                            ))}
                            {parsedTeams.length > 5 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="caption" color="text.secondary">
                                    ... och {parsedTeams.length - 5} till
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  
                  {/* Match-förhandsgranskning */}
                  {parsedMatches.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Matcher ({parsedMatches.length}):
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Hemmalag</TableCell>
                              <TableCell>Bortalag</TableCell>
                              <TableCell>Datum</TableCell>
                              <TableCell>Typ</TableCell>
                              <TableCell>Grupp</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parsedMatches.slice(0, 5).map((match, index) => (
                              <TableRow key={index}>
                                <TableCell>{match.homeTeam}</TableCell>
                                <TableCell>{match.awayTeam}</TableCell>
                                <TableCell>{match.date}</TableCell>
                                <TableCell>{match.matchType || '-'}</TableCell>
                                <TableCell>{match.group || '-'}</TableCell>
                              </TableRow>
                            ))}
                            {parsedMatches.length > 5 && (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  <Typography variant="caption" color="text.secondary">
                                    ... och {parsedMatches.length - 5} till
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Steg 4: Importera */}
        {(parsedTeams.length > 0 || parsedMatches.length > 0) && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                4. Importera till databas
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {parsedTeams.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={importTeams}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  >
                    Importera {parsedTeams.length} Lag
                  </Button>
                )}
                
                {parsedMatches.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={importMatches}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  >
                    Importera {parsedMatches.length} Matcher
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelImport;
