import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Avatar,
    TextField,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Reply as ReplyIcon,
    Delete as DeleteIcon 
} from '@mui/icons-material';
import { forumService } from '../../services/forumService';
import { useApp } from '../../context/AppContext';

interface ForumPost {
    id: number;
    title: string;
    content: string;
    user_id: number;
    username: string;
    image_url?: string;
    reply_count: number;
    created_at: string;
    updated_at: string;
    replies?: ForumReply[];
}

interface ForumReply {
    id: number;
    post_id: number;
    user_id: number;
    username: string;
    image_url?: string;
    content: string;
    created_at: string;
}

export function ForumPostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useApp();
    const [post, setPost] = useState<ForumPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const isLoggedIn = state.isAuthenticated;
    const isAdmin = state.user?.role === 'admin';

    useEffect(() => {
        if (id) {
            loadPost();
        }
    }, [id]);

    const loadPost = async () => {
        if (!id || !Number(id)) {
            setError('Ogiltigt inläggs-ID');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const postData = await forumService.getPostById(Number(id));
            setPost(postData);
            setError(null);
        } catch (err: any) {
            console.error('Error loading forum post:', err);
            setError(err.message || 'Kunde inte ladda foruminlägget');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim() || !post) {
            setError('Svarinnehåll krävs');
            return;
        }

        try {
            setSubmitting(true);
            await forumService.createReply(post.id, {
                content: replyContent.trim()
            });
            
            setReplyContent('');
            await loadPost(); // Reload to get updated replies
            setError(null);
        } catch (err: any) {
            console.error('Error creating reply:', err);
            setError(err.message || 'Kunde inte skapa svar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!post) return;

        try {
            await forumService.deletePost(post.id);
            navigate('/forum');
        } catch (err: any) {
            console.error('Error deleting post:', err);
            setError(err.message || 'Kunde inte ta bort inlägget');
        }
        setDeleteDialogOpen(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!post) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    Foruminlägget kunde inte hittas.
                </Alert>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/forum')}
                    sx={{ mt: 2 }}
                >
                    Tillbaka till forum
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/forum')}
                    sx={{ mr: 2 }}
                >
                    Tillbaka
                </Button>
                {isAdmin && (
                    <IconButton 
                        color="error" 
                        onClick={() => setDeleteDialogOpen(true)}
                        sx={{ ml: 'auto' }}
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Main Post */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                        src={post.image_url}
                        sx={{ mr: 2, mt: 0.5 }}
                    >
                        {post.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            {post.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Av {post.username} • {formatDate(post.created_at)}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                </Typography>
            </Paper>

            {/* Replies Section */}
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <ReplyIcon sx={{ mr: 1 }} />
                Svar ({post.replies?.length || 0})
            </Typography>

            {post.replies && post.replies.length > 0 && (
                <List sx={{ mb: 3 }}>
                    {post.replies.map((reply) => (
                        <Paper key={reply.id} sx={{ mb: 2 }}>
                            <ListItem alignItems="flex-start" sx={{ p: 2 }}>
                                <Avatar
                                    src={reply.image_url}
                                    sx={{ mr: 2, mt: 0.5 }}
                                >
                                    {reply.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" color="textSecondary">
                                            {reply.username} • {formatDate(reply.created_at)}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body1" sx={{ mt: 1 }}>
                                            {reply.content}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}

            {/* Reply Form */}
            {isLoggedIn ? (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Skriv ett svar
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Skriv ditt svar här..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleReplySubmit}
                        disabled={submitting || !replyContent.trim()}
                        startIcon={submitting ? <CircularProgress size={20} /> : <ReplyIcon />}
                    >
                        {submitting ? 'Skickar...' : 'Skicka svar'}
                    </Button>
                </Paper>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                        Du måste vara inloggad för att svara på inlägg.
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/login')}
                        sx={{ mt: 1 }}
                    >
                        Logga in
                    </Button>
                </Paper>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Ta bort inlägg</DialogTitle>
                <DialogContent>
                    <Typography>
                        Är du säker på att du vill ta bort detta inlägg? 
                        Alla svar kommer också att tas bort. Denna åtgärd kan inte ångras.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button 
                        onClick={handleDeletePost} 
                        color="error" 
                        variant="contained"
                    >
                        Ta bort
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
