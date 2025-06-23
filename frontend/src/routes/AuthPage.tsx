import { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import Logo from '../components/Logo/Logo';
import LoginForm from '../components/LoginForm/LoginForm';
import RegisterForm from '../components/RegisterForm/RegisterForm';
import { useUser } from '../UserContext';
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';

function AuthPage(): ReactElement {
  const [tab, setTab] = useState(0);
  const { user } = useUser();
  if (user) return <Navigate to="/board" replace />;

  return (
    <Box minHeight="100vh" width="100vw" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default">
      <Paper elevation={3} sx={{ p: 4, width: '90%', maxWidth: 400 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Logo />
          <Typography variant="h5" fontWeight={700} mt={1} mb={2} color="primary">SprintSync</Typography>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        {tab === 0 ? <LoginForm /> : <RegisterForm />}
      </Paper>
    </Box>
  );
}

export default AuthPage; 