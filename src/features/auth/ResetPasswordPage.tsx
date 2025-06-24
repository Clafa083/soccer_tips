import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Stack
} from '@mui/material';
import {
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            setError('Ogiltig återställningslänk');
            return;
        }
        setToken(tokenParam);
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!newPassword.trim()) {
            setError('Nytt lösenord krävs');
            return;
        }

        if (newPassword.length < 6) {
            setError('Lösenordet måste vara minst 6 tecken');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Lösenorden matchar inte');
            return;
        }

        if (!token) {
            setError('Ogiltig återställningslänk');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await authService.resetPassword(token, newPassword.trim());
            setSuccess(response.message);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            console.error('Error resetting password:', err);
            setError(err.message || 'Kunde inte återställa lösenordet');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (field: 'new' | 'confirm') => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (field === 'new') {
            setNewPassword(value);
        } else {
            setConfirmPassword(value);
        }
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    if (!token && !error) {
        return (
            <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <LockIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1">
                            Återställ lösenord
                        </Typography>
                    </Box>

                    {!token && error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {token && (
                        <>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Ange ditt nya lösenord nedan.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    {success}
                                    <br />
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Du omdirigeras till inloggningssidan om 3 sekunder...
                                    </Typography>
                                </Alert>
                            )}

                            {!success && (
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Nytt lösenord"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={handlePasswordChange('new')}
                                            disabled={loading}
                                            autoFocus
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            edge="end"
                                                        >
                                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Bekräfta nytt lösenord"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={handlePasswordChange('confirm')}
                                            disabled={loading}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            edge="end"
                                                        >
                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : undefined}
                                            sx={{ py: 1.5 }}
                                        >
                                            {loading ? 'Återställer...' : 'Återställ lösenord'}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                        </>
                    )}

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            component={Link}
                            to="/login"
                            startIcon={<ArrowBackIcon />}
                            variant="text"
                        >
                            Tillbaka till inloggning
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}
