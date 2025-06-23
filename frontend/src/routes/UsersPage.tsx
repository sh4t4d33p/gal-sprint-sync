import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllUsers, deleteUser } from '../utils/api';
import { useUser } from '../UserContext';

export default function UsersPage() {
  const { user } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

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

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeleting(userId);
    setError('');
    setSuccess('');
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully.');
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setDeleting(null);
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
                          onClick={() => handleDelete(u.id)}
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
    </Box>
  );
} 