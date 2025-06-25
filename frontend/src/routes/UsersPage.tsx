import { useEffect, useState, Suspense, lazy } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllUsers, deleteUser } from '../utils/api';

const LazyDialog = lazy(() => import('@mui/material/Dialog'));
const LazyDialogTitle = lazy(() => import('@mui/material/DialogTitle'));
const LazyDialogContent = lazy(() => import('@mui/material/DialogContent'));
const LazyDialogActions = lazy(() => import('@mui/material/DialogActions'));

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      // Exclude admins from the list
      setUsers(data.filter((u: any) => !u.isAdmin));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleDeleteClick = (userId: number) => {
    setPendingDeleteId(userId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleting(pendingDeleteId);
    setError('');
    setSuccess('');
    setConfirmOpen(false);
    try {
      await deleteUser(pendingDeleteId);
      setSuccess('User deleted successfully.');
      setUsers(users.filter(u => u.id !== pendingDeleteId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setDeleting(null);
      setPendingDeleteId(null);
    }
  };

  return (
    <Box width="100%" maxWidth={900} mx="auto">
      <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
        User Management
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete user">
                      <span>
                        <IconButton
                          color="error"
                          onClick={e => {
                            handleDeleteClick(u.id);
                            e.currentTarget.blur();
                          }}
                          disabled={deleting === u.id}
                        >
                          {deleting === u.id ? <CircularProgress size={24} /> : <DeleteIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      <Suspense fallback={<div>Loading...</div>}>
        <LazyDialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <LazyDialogTitle>Delete User</LazyDialogTitle>
          <LazyDialogContent>
            <Typography>Are you sure you want to delete this user?</Typography>
          </LazyDialogContent>
          <LazyDialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
          </LazyDialogActions>
        </LazyDialog>
      </Suspense>
    </Box>
  );
} 