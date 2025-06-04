import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Stack,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { Settings, Save } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { KnockoutScoringConfig, UpdateKnockoutScoringDto } from '../../types/models';

export function KnockoutScoringManagement() {
    const [config, setConfig] = useState<KnockoutScoringConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Form states
    const [roundOf16Points, setRoundOf16Points] = useState<number>(1);
    const [quarterFinalPoints, setQuarterFinalPoints] = useState<number>(2);
    const [semiFinalPoints, setSemiFinalPoints] = useState<number>(3);
    const [finalPoints, setFinalPoints] = useState<number>(4);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const configData = await adminService.getKnockoutScoringConfig();
            setConfig(configData);
            
            // Update form values from loaded config
            for (const item of configData) {
                switch (item.matchType) {
                    case 'ROUND_OF_16':
                        setRoundOf16Points(item.pointsPerCorrectTeam);
                        break;
                    case 'QUARTER_FINAL':
                        setQuarterFinalPoints(item.pointsPerCorrectTeam);
                        break;
                    case 'SEMI_FINAL':
                        setSemiFinalPoints(item.pointsPerCorrectTeam);
                        break;
                    case 'FINAL':
                        setFinalPoints(item.pointsPerCorrectTeam);
                        break;
                }
            }
            
            setError(null);
        } catch (err) {
            console.error('Error loading knockout scoring config:', err);
            setError('Kunde inte ladda poängkonfiguration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);
            
            const updateData: UpdateKnockoutScoringDto = {
                roundOf16Points,
                quarterFinalPoints,
                semiFinalPoints,
                finalPoints
            };
            
            const updatedConfig = await adminService.updateKnockoutScoringConfig(updateData);
            setConfig(updatedConfig);
            setSuccessMessage('Poängkonfiguration har uppdaterats!');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating knockout scoring config:', err);
            setError('Kunde inte uppdatera poängkonfiguration');
        } finally {
            setSaving(false);
        }
    };

    const getMatchTypeDisplayName = (matchType: string): string => {
        const names: Record<string, string> = {
            'ROUND_OF_16': 'Åttondelsfinaler',
            'QUARTER_FINAL': 'Kvartsfinaler',
            'SEMI_FINAL': 'Semifinaler',
            'FINAL': 'Final'
        };
        return names[matchType] || matchType;
    };

    if (loading) {
        return <Typography>Laddar poängkonfiguration...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Settings />
                <Typography variant="h6">Slutspelspoäng</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
                Konfigurera hur många poäng användare ska få för varje rätt lag som går vidare till nästa steg i slutspelet.
                Användare kan bara få poäng en gång per lag och turneringssteg.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {successMessage}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Poängkonfiguration
                    </Typography>
                    
                    <Stack spacing={3}>
                        <TextField
                            label="Åttondelsfinaler (poäng per rätt lag)"
                            type="number"
                            value={roundOf16Points}
                            onChange={(e) => setRoundOf16Points(Number(e.target.value))}
                            inputProps={{ min: 0, max: 10 }}
                            size="small"
                            helperText="Poäng för varje lag som användaren tippat rätt till åttondelsfinaler"
                        />
                        
                        <TextField
                            label="Kvartsfinaler (poäng per rätt lag)"
                            type="number"
                            value={quarterFinalPoints}
                            onChange={(e) => setQuarterFinalPoints(Number(e.target.value))}
                            inputProps={{ min: 0, max: 10 }}
                            size="small"
                            helperText="Poäng för varje lag som användaren tippat rätt till kvartsfinaler"
                        />
                        
                        <TextField
                            label="Semifinaler (poäng per rätt lag)"
                            type="number"
                            value={semiFinalPoints}
                            onChange={(e) => setSemiFinalPoints(Number(e.target.value))}
                            inputProps={{ min: 0, max: 10 }}
                            size="small"
                            helperText="Poäng för varje lag som användaren tippat rätt till semifinaler"
                        />
                        
                        <TextField
                            label="Final (poäng per rätt lag)"
                            type="number"
                            value={finalPoints}
                            onChange={(e) => setFinalPoints(Number(e.target.value))}
                            inputProps={{ min: 0, max: 10 }}
                            size="small"
                            helperText="Poäng för varje lag som användaren tippat rätt till finalen"
                        />
                        
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            {saving ? 'Sparar...' : 'Spara konfiguration'}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {config.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Aktuell konfiguration
                        </Typography>
                        
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Turneringssteg</TableCell>
                                        <TableCell align="center">Poäng per rätt lag</TableCell>
                                        <TableCell align="center">Senast uppdaterad</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {config.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {getMatchTypeDisplayName(item.matchType)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" color="primary" fontWeight="bold">
                                                    {item.pointsPerCorrectTeam}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(item.updatedAt).toLocaleDateString('sv-SE')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                    <strong>Så här fungerar poängsystemet:</strong><br />
                    • Användare får poäng för varje lag de tippat rätt som går vidare till nästa steg<br />
                    • Samma lag kan bara ge poäng en gång per turneringssteg (även om användaren tippat det på flera platser)<br />
                    • Gruppspelsmatcher använder det gamla systemet (3p för exakt resultat, 1p för rätt utgång)<br />
                    • Kör "Beräkna alla poäng" efter att ha ändrat konfigurationen för att uppdatera befintliga poäng
                </Typography>
            </Alert>
        </Box>
    );
}
