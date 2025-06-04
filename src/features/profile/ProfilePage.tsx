import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Avatar,
    Stack,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import { 
    Person, 
    Email, 
    Image, 
    Save, 
    PhotoCamera, 
    AdminPanelSettings
} from '@mui/icons-material';
import { authService } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import { validateEmail, validateName } from '../../utils/validation';
import { AVATAR_OPTIONS, isEmojiAvatar, getAvatarProps } from '../../utils/avatarUtils';

interface ProfileFormData {
    name: string;
    email: string;
    imageUrl: string;
}

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { state: { user }, dispatch } = useApp();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
    const [customImageUrl, setCustomImageUrl] = useState('');
    
    const [formData, setFormData] = useState<ProfileFormData>({
        name: user?.name || '',
        email: user?.email || '',
        imageUrl: user?.imageUrl || ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = (): string => {
        if (!formData.name.trim()) {
            return 'Namnet får inte vara tomt';
        }
        
        if (!validateName(formData.name)) {
            return 'Namnet får endast innehålla bokstäver, mellanslag och bindestreck';
        }
        
        if (!formData.email.trim()) {
            return 'E-postadressen får inte vara tom';
        }
        
        if (!validateEmail(formData.email)) {
            return 'Ogiltig e-postadress';
        }
        
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const updatedUser = await authService.updateProfile(formData);
            dispatch({ type: 'SET_USER', payload: updatedUser });
            setSuccess('Profilen har uppdaterats framgångsrikt!');
        } catch (err) {
            setError(err instanceof Error 
                ? err.message 
                : 'Ett fel uppstod vid uppdateringen. Försök igen.');
        } finally {
            setLoading(false);
        }
    };    const handleAvatarSelect = (avatar: string) => {
        setFormData(prev => ({
            ...prev,
            imageUrl: avatar
        }));
        setAvatarDialogOpen(false);
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleCustomImageSubmit = () => {
        if (customImageUrl.trim()) {
            setFormData(prev => ({
                ...prev,
                imageUrl: customImageUrl.trim()
            }));
        }
        setCustomImageUrl('');
        setAvatarDialogOpen(false);
        if (error) setError('');
        if (success) setSuccess('');
    };

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Min Profil
            </Typography>            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Profile Summary Card */}
                <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
                    <Card elevation={3}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>                            <Avatar 
                                {...getAvatarProps(formData.imageUrl, user.name)}
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    mx: 'auto', 
                                    mb: 2,
                                    ...(isEmojiAvatar(formData.imageUrl) && { fontSize: '48px' })
                                }}
                            />
                            
                            <Typography variant="h6" gutterBottom>
                                {user.name}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {user.email}
                            </Typography>

                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                                {user.isAdmin && (
                                    <Chip 
                                        icon={<AdminPanelSettings />}
                                        label="Admin" 
                                        color="primary" 
                                        size="small" 
                                    />
                                )}
                                <Chip 
                                    icon={<Person />}
                                    label="Användare" 
                                    color="default" 
                                    size="small" 
                                />
                            </Stack>

                            <Button
                                startIcon={<PhotoCamera />}
                                variant="outlined"
                                onClick={() => setAvatarDialogOpen(true)}
                                fullWidth
                            >
                                Ändra Profilbild                            </Button>
                        </CardContent>
                    </Card>
                </Box>

                {/* Profile Edit Form */}
                <Box sx={{ flex: 1 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                            Redigera Profil
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

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Namn"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />

                                <TextField
                                    label="E-postadress"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<Save />}
                                    disabled={loading}
                                    sx={{ mt: 3 }}
                                >
                                    {loading ? 'Sparar...' : 'Spara Ändringar'}
                                </Button>                            </Stack>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Avatar Selection Dialog */}
            <Dialog 
                open={avatarDialogOpen} 
                onClose={() => setAvatarDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Välj Profilbild
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Välj en emoji eller lägg till en egen bild-URL
                    </Typography>
                    
                    {/* Emoji avatars */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Emoji Avatarer
                        </Typography>                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                            gap: 1
                        }}>
                            {AVATAR_OPTIONS.map((emoji, index) => (
                                <Box key={index}>
                                    <IconButton
                                        onClick={() => handleAvatarSelect(emoji)}
                                        sx={{ 
                                            fontSize: '24px',
                                            border: formData.imageUrl === emoji ? '2px solid' : '1px solid',
                                            borderColor: formData.imageUrl === emoji ? 'primary.main' : 'divider',
                                            borderRadius: '50%',
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        {emoji}
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Custom image URL */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Egen Bild-URL
                        </Typography>
                        <TextField
                            label="Bild-URL (t.ex. https://example.com/image.jpg)"
                            value={customImageUrl}
                            onChange={(e) => setCustomImageUrl(e.target.value)}
                            fullWidth
                            placeholder="https://..."
                            InputProps={{
                                startAdornment: <Image sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAvatarDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button 
                        onClick={handleCustomImageSubmit}
                        variant="contained"
                        disabled={!customImageUrl.trim()}
                    >
                        Använd URL
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
