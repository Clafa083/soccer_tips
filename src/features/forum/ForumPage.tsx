import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Fab,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon, Forum as ForumIcon, Reply as ReplyIcon } from '@mui/icons-material';
import { forumService } from '../../services/forumService';

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
}

export function ForumPage() {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const postsData = await forumService.getAllPosts();
            setPosts(postsData);
            setError(null);
        } catch (err: any) {
            console.error('Error loading forum posts:', err);
            setError(err.message || 'Failed to load forum posts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Titel och innehåll krävs');
            return;
        }

        try {
            setSubmitting(true);
            await forumService.createPost({
                title: formData.title.trim(),
                content: formData.content.trim()
            });
            
            setFormData({ title: '', content: '' });
            setDialogOpen(false);
            await loadPosts();
            setError(null);
        } catch (err: any) {
            console.error('Error creating post:', err);
            setError(err.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
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

    const handleDialogClose = () => {
        setDialogOpen(false);
        setFormData({ title: '', content: '' });
        setError(null);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <ForumIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    Forum
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {posts.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        Inga foruminlägg än
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Var den första att starta en diskussion!
                    </Typography>
                </Paper>
            ) : (
                <List sx={{ mb: 4 }}>
                    {posts.map((post) => (
                        <Paper key={post.id} sx={{ mb: 2 }}>
                            <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                                <Avatar
                                    src={post.image_url}
                                    sx={{ mr: 2, mt: 0.5 }}
                                >
                                    {post.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="h3">
                                                {post.title}
                                            </Typography>
                                            <Chip 
                                                icon={<ReplyIcon />}
                                                label={post.reply_count}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                {post.content}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Av {post.username} • {formatDate(post.created_at)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}

            <Fab
                color="primary"
                aria-label="create post"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => setDialogOpen(true)}
            >
                <AddIcon />
            </Fab>

            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Skapa nytt inlägg</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Titel"
                        fullWidth
                        variant="outlined"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Innehåll"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Avbryt</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                    >
                        {submitting ? <CircularProgress size={20} /> : 'Skapa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
