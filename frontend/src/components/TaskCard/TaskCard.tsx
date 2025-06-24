import { Paper, Typography, Box, Avatar } from '@mui/material';

interface UserInfo {
  name: string;
  email?: string;
  id: number;
}

interface TaskCardProps {
  title: string;
  description: string;
  user?: UserInfo;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function TaskCard({ title, description, user, onClick, children }: TaskCardProps) {
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
      {children}
    </Paper>
  );
} 