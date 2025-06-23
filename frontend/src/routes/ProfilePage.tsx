import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useUser } from '../UserContext';
import { updateUser } from '../utils/api';
import { validateEmail } from '../utils/validation';

export default function ProfilePage() {
  const { user, refreshUser } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    const emailErr = validateEmail(email);
    setEmailError(emailErr);
    if (emailErr) {
      setLoading(false);
      return;
    }
    try {
      await updateUser(user?.userId!, name, email);
      setSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto',
        p: { xs: 2, sm: 4 },
        boxShadow: 0,
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={2} textAlign="center">
        Profile
      </Typography>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoComplete="name"
        />
        <TextField
          label="Email"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          required
          type="email"
          autoComplete="email"
          error={!!emailError}
          helperText={emailError || ' '}
        />
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Saving...' : 'Update Profile'}
        </Button>
      </form>
    </Box>
  );
} 