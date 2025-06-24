import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    Stack
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!email.trim()) {
            setError('E-post krävs');
            return;
        }

        if (!email.includes('@')) {
            setError('Ange en giltig e-postadress');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await authService.forgotPassword(email.trim());
            setSuccess(response.message);
        } catch (err: any) {
            console.error('Error requesting password reset:', err);
            setError(err.message || 'Kunde inte skicka återställningslänk');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <EmailIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1">
                            Glömt lösenord
                        </Typography>
                    </Box>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    {!success && (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    label="E-postadress"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    disabled={loading}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : undefined}
                                    sx={{ py: 1.5 }}
                                >
                                    {loading ? 'Skickar...' : 'Skicka återställningslänk'}
                                </Button>
                            </Stack>
                        </Box>
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
