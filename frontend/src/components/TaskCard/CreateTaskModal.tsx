import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, Typography } from '@mui/material';
import AISuggestButton from './AISuggestButton';
import InputAdornment from '@mui/material/InputAdornment';

interface UserInfo {
  id: number;
  name: string;
  email?: string;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string; userId: number }) => void;
  users?: UserInfo[];
  currentUser: UserInfo;
}

export default function CreateTaskModal({ open, onClose, onCreate, users, currentUser }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(currentUser.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreate({ title: title.trim(), description: description.trim(), userId });
      setTitle('');
      setDescription('');
      setUserId(currentUser.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setUserId(currentUser.id);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create Task</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
            inputProps={{ style: { wordBreak: 'break-word', overflowWrap: 'break-word' } }}
            sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            required
            inputProps={{ style: { wordBreak: 'break-word', overflowWrap: 'break-word' } }}
            sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <AISuggestButton
                    title={title}
                    onSuggestion={desc => setDescription(desc)}
                    disabled={!title.trim()}
                  />
                </InputAdornment>
              ),
            }}
          />
          {users ? (
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-select-label">Assign to</InputLabel>
              <Select
                labelId="user-select-label"
                value={userId}
                label="Assign to"
                onChange={e => setUserId(Number(e.target.value))}
                required
                MenuProps={{
                  PaperProps: {
                    sx: {
                      width: 320,
                      maxWidth: '90vw',
                      minWidth: 200,
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  disableScrollLock: true,
                  MenuListProps: {
                    sx: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box mt={2} mb={1}>
              <Typography variant="body2" color="text.secondary">Assigned to</Typography>
              <Typography fontWeight={600}>{currentUser.name}</Typography>
            </Box>
          )}
          {error && <Typography color="error" mt={1}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 