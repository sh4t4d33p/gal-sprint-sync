import { Paper, Typography, Box, Avatar, TextField, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
  children?: React.ReactNode;
}

export default function TaskCard({ title, description, totalMinutes, user, onClick, onDelete, children }: TaskCardProps) {
  return (
    <Paper
      sx={{ p: 1.5, mb: 1, boxShadow: 1, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: onClick ? 4 : 1 } }}
      onClick={onClick}
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
      {typeof totalMinutes === 'number' && (
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <TextField
            label="Total Minutes"
            value={totalMinutes}
            fullWidth
            margin="dense"
            size="small"
            disabled
            InputProps={{ readOnly: true }}
          />
          {onDelete && (
            <Tooltip title="Delete Task">
              <IconButton onClick={e => { e.stopPropagation(); onDelete(); }} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
      {children}
    </Paper>
  );
} 