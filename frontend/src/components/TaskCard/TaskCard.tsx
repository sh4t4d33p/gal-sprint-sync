import { Paper, Typography, Box, Avatar, TextField, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

interface UserInfo {
  name: string;
  email?: string;
  id: number;
}

interface TaskCardProps {
  title: string;
  description: string;
  totalMinutes?: number;
  user?: UserInfo;
  onClick?: () => void;
  onDelete?: () => void;
  onUpdateTotalMinutes?: (newMinutes: number) => void;
  children?: React.ReactNode;
}

export default function TaskCard({ title, description, totalMinutes, user, onClick, onDelete, onUpdateTotalMinutes, children }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [minutesValue, setMinutesValue] = useState(totalMinutes ?? 0);
  const [originalValue, setOriginalValue] = useState(totalMinutes ?? 0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleEdit = () => {
    setEditing(true);
    setOriginalValue(minutesValue);
  };

  const handleCancel = () => {
    setMinutesValue(originalValue);
    setEditing(false);
  };

  const handleSave = () => {
    if (onUpdateTotalMinutes && minutesValue !== originalValue) {
      onUpdateTotalMinutes(minutesValue);
    }
    setEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    if (onDelete) onDelete();
  };

  return (
    <Paper
      sx={{ p: 1.5, mb: 1, boxShadow: 1, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: onClick ? 4 : 1 } }}
      onClick={e => {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag === 'button' || tag === 'input' || tag === 'svg' || tag === 'path') {
          return;
        }
        if (onClick) onClick();
      }}
      aria-label={`Task: ${title}`}
    >
      {user && (
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Avatar sx={{ width: 24, height: 24 }}>{user.name ? user.name[0].toUpperCase() : '?'}</Avatar>
          <Typography fontWeight={500} fontSize={14}>{user.name}</Typography>
        </Box>
      )}
      <Typography fontWeight={600}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
      {(typeof totalMinutes === 'number' || onDelete) && (
        <Box display="flex" alignItems="center" mt={1} width="100%">
          {typeof totalMinutes === 'number' && (
            <TextField
              label="Total Minutes"
              value={editing ? minutesValue : totalMinutes}
              margin="dense"
              size="small"
              type="number"
              disabled={false}
              InputProps={{ readOnly: false }}
              sx={{ width: 120 }}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setMinutesValue(val === '' ? 0 : Number(val));
                if (!editing) handleEdit();
              }}
              onClick={e => e.stopPropagation()}
            />
          )}
          {editing && minutesValue !== originalValue && (
            <>
              <IconButton size="small" color="success" onClick={e => { e.stopPropagation(); handleSave(); }} sx={{ ml: 1 }}>
                <CheckIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleCancel(); }}>
                <CloseIcon />
              </IconButton>
            </>
          )}
          <Box flexGrow={1} />
          {onDelete && (
            <Box
              onClick={e => {
                e.stopPropagation();
              }}
              onMouseDown={e => {
                e.stopPropagation();
              }}
            >
              <Tooltip title="Delete Task">
                <IconButton
                  onClick={e => {
                    handleDeleteClick(e);
                    e.currentTarget.blur();
                  }}
                  onMouseDown={e => {
                    e.stopPropagation();
                  }}
                  onFocus={e => {
                    e.stopPropagation();
                  }}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      )}
      {children}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 