import { Box, Typography } from '@mui/material';

function Logo() {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#1976d2" />
        <path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <Typography variant="h6" fontWeight={700} color="primary">SprintSync</Typography>
    </Box>
  );
}

export default Logo; 