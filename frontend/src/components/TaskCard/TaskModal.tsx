import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, InputAdornment } from '@mui/material';
import AISuggestButton from './AISuggestButton';

interface UserInfo {
  id: number;
  name: string;
  email?: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task: {
    id: number;
    title: string;
    description: string;
    totalMinutes: number;
    status: string;
    userId: number;
    user?: UserInfo;
  };
  onSave: (data: { title: string; description: string; totalMinutes: number; status: string; userId?: number }) => void;
  onDelete: () => void;
  statuses: { key: string; label: string }[];
  users?: UserInfo[];
  isAdmin?: boolean;
}

export default function TaskModal({ open, onClose, task, onSave, onDelete, statuses, users, isAdmin }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [totalMinutes, setTotalMinutes] = useState(task.totalMinutes);
  const [status, setStatus] = useState(task.status);
  const [assignedUserId, setAssignedUserId] = useState(task.userId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isNaN(Number(totalMinutes))) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave({ title: title.trim(), description: description.trim(), totalMinutes: Number(totalMinutes), status, userId: isAdmin ? assignedUserId : undefined });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            required
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
          <TextField
            label="Total Minutes"
            value={totalMinutes}
            onChange={e => setTotalMinutes(Number(e.target.value.replace(/[^0-9]/g, '')))}
            fullWidth
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              label="Status"
              onChange={e => setStatus(e.target.value)}
              required
            >
              {statuses.map(s => (
                <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {isAdmin && users ? (
            <FormControl fullWidth margin="normal">
              <InputLabel id="assigned-user-select-label">Assigned To</InputLabel>
              <Select
                labelId="assigned-user-select-label"
                value={assignedUserId}
                label="Assigned To"
                onChange={e => setAssignedUserId(Number(e.target.value))}
                required
              >
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Assigned To"
              value={task.user?.name || ''}
              fullWidth
              margin="normal"
              disabled
              InputProps={{ readOnly: true }}
            />
          )}
          {error && <Typography color="error" mt={1}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onDelete} color="error" disabled={loading}>Delete</Button>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 