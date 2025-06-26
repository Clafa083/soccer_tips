import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { Edit, Delete, Add, Preview } from '@mui/icons-material';
import { siteContentService } from '../../services/siteContentService';
import { SiteContent, CreateSiteContentDto, UpdateSiteContentDto } from '../../types/models';

export function SiteContentManagement() {
    const [content, setContent] = useState<SiteContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
    const [previewContent, setPreviewContent] = useState<SiteContent | null>(null);
    const [formData, setFormData] = useState<CreateSiteContentDto>({
        content_key: '',
        title: '',
        content: '',
        content_type: 'html'
    });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            const data = await siteContentService.getAllContent();
            setContent(data);
            setError(null);
        } catch (err) {
            console.error('Error loading content:', err);
            setError('Kunde inte ladda innehåll');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (contentItem?: SiteContent) => {
        if (contentItem) {
            setEditingContent(contentItem);
            setFormData({
                content_key: contentItem.content_key,
                title: contentItem.title,
                content: contentItem.content,
                content_type: contentItem.content_type
            });
        } else {
            setEditingContent(null);
            setFormData({
                content_key: '',
                title: '',
                content: '',
                content_type: 'html'
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingContent(null);
    };

    const handlePreview = (contentItem: SiteContent) => {
        setPreviewContent(contentItem);
        setPreviewOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.content_key || !formData.title || !formData.content) {
                setError('Alla fält är obligatoriska');
                return;
            }

            if (editingContent) {
                // Update existing content
                const updateData: UpdateSiteContentDto = {
                    title: formData.title,
                    content: formData.content,
                    content_type: formData.content_type
                };
                await siteContentService.updateContent(editingContent.content_key, updateData);
            } else {
                // Create new content
                await siteContentService.createContent(formData);
            }
            
            await loadContent();
            handleCloseDialog();
            setError(null);
        } catch (err) {
            console.error('Error saving content:', err);
            setError('Kunde inte spara innehåll');
        }
    };

    const handleDelete = async (contentKey: string) => {
        if (window.confirm('Är du säker på att du vill ta bort detta innehåll?')) {
            try {
                await siteContentService.deleteContent(contentKey);
                await loadContent();
                setError(null);
            } catch (err) {
                console.error('Error deleting content:', err);
                setError('Kunde inte ta bort innehåll');
            }
        }
    };

    const renderContent = (content: string, type: string) => {
        if (type === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
        return <pre style={{ whiteSpace: 'pre-wrap' }}>{content}</pre>;
    };

    if (loading) return <Typography>Laddar...</Typography>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Hantera Sidinnehåll
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Lägg till innehåll
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nyckel</TableCell>
                            <TableCell>Titel</TableCell>
                            <TableCell>Typ</TableCell>
                            <TableCell>Senast uppdaterad</TableCell>
                            <TableCell align="right">Åtgärder</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {content.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Chip label={item.content_key} variant="outlined" size="small" />
                                </TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={item.content_type.toUpperCase()} 
                                        size="small"
                                        color={item.content_type === 'html' ? 'primary' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(item.updated_at).toLocaleDateString('sv-SE')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        onClick={() => handlePreview(item)}
                                        size="small"
                                        title="Förhandsgranska"
                                    >
                                        <Preview />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleOpenDialog(item)}
                                        size="small"
                                        title="Redigera"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(item.content_key)}
                                        size="small"
                                        color="error"
                                        title="Ta bort"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {content.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography color="text.secondary">
                                        Inget innehåll hittades
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit/Create Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingContent ? 'Redigera innehåll' : 'Lägg till nytt innehåll'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Innehållsnyckel"
                            value={formData.content_key}
                            onChange={(e) => setFormData({ ...formData, content_key: e.target.value })}
                            disabled={!!editingContent}
                            fullWidth
                            helperText="Unik identifierare för innehållet (t.ex. 'homepage_welcome')"
                        />
                        <TextField
                            label="Titel"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Innehållstyp</InputLabel>
                            <Select
                                value={formData.content_type}
                                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as 'text' | 'html' | 'markdown' })}
                                label="Innehållstyp"
                            >
                                <MenuItem value="text">Text</MenuItem>
                                <MenuItem value="html">HTML</MenuItem>
                                <MenuItem value="markdown">Markdown</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Innehåll"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            multiline
                            rows={10}
                            fullWidth
                            helperText={formData.content_type === 'html' ? 'Du kan använda HTML-taggar' : 'Skriv som vanlig text'}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Avbryt</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingContent ? 'Uppdatera' : 'Skapa'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{previewContent?.title}</DialogTitle>
                <DialogContent>
                    {previewContent && renderContent(previewContent.content, previewContent.content_type)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Stäng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
