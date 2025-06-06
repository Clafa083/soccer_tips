import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    Chip,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { Delete, AdminPanelSettings, Person, PersonAdd } from '@mui/icons-material';
import { adminService } from '../../services/adminService';

interface User {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    isAdmin: boolean;
    createdAt: Date;
    totalBets: number;
    totalPoints: number;
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adminDialogOpen, setAdminDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToPromote, setUserToPromote] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Kunde inte ladda användare');
        } finally {
            setLoading(false);
        }
    };    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handlePromoteClick = (user: User) => {
        setUserToPromote(user);
        setAdminDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await adminService.deleteUser(userToDelete.id);
            await loadUsers();
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Kunde inte ta bort användare');
        }
    };

    const handlePromoteConfirm = async () => {
        if (!userToPromote) return;

        try {
            await adminService.updateUserAdminStatus(userToPromote.id, true);
            await loadUsers();
            setAdminDialogOpen(false);
            setUserToPromote(null);
            setError(null);
        } catch (err) {
            console.error('Error promoting user to admin:', err);
            setError('Kunde inte göra användaren till admin');
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    if (loading) {
        return <Typography>Laddar användare...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Användarhantering
            </Typography>            <Typography variant="body2" color="text.secondary" paragraph>
                Hantera användarkonton och se statistik. Du kan göra användare till admins eller ta bort icke-admin användare.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Användare</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Roll</TableCell>
                            <TableCell align="center">Tips</TableCell>
                            <TableCell align="center">Poäng</TableCell>
                            <TableCell>Registrerad</TableCell>
                            <TableCell align="right">Åtgärder</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar 
                                            src={user.imageUrl} 
                                            sx={{ width: 32, height: 32 }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="body2">
                                            {user.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.isAdmin ? (
                                        <Chip 
                                            icon={<AdminPanelSettings />}
                                            label="Admin" 
                                            color="primary" 
                                            size="small" 
                                        />
                                    ) : (
                                        <Chip 
                                            icon={<Person />}
                                            label="Användare" 
                                            color="default" 
                                            size="small" 
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {user.totalBets}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        {user.totalPoints}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDate(user.createdAt)}
                                    </Typography>
                                </TableCell>                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {!user.isAdmin && (
                                            <>
                                                <IconButton
                                                    onClick={() => handlePromoteClick(user)}
                                                    size="small"
                                                    color="primary"
                                                    title="Gör till admin"
                                                >
                                                    <PersonAdd />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(user)}
                                                    size="small"
                                                    color="error"
                                                    title="Ta bort användare"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </>
                                        )}
                                        {user.isAdmin && (
                                            <Typography variant="body2" color="text.secondary">
                                                Admin-användare
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        Inga användare hittades
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Ta bort användare</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Är du säker på att du vill ta bort användaren "{userToDelete?.name}"? 
                        Detta kommer också att ta bort alla deras tips. Denna åtgärd kan inte ångras.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                    >
                        Ta bort
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={adminDialogOpen}
                onClose={() => setAdminDialogOpen(false)}
            >
                <DialogTitle>Gör till admin</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Är du säker på att du vill göra "{userToPromote?.name}" till admin? 
                        Denna användare kommer att få tillgång till alla admin-funktioner.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAdminDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button 
                        onClick={handlePromoteConfirm} 
                        color="primary"
                        variant="contained"
                    >
                        Gör till admin
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}