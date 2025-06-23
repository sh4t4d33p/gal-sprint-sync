import type { ReactNode } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, IconButton, Avatar, Menu, MenuItem, Divider, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUser } from '../UserContext';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 220;
const drawerWidthMobile = 64;

export default function AppLayout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isMobile = useMediaQuery('(max-width:425px)');

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const currentDrawerWidth = isMobile ? drawerWidthMobile : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: currentDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: currentDrawerWidth, boxSizing: 'border-box', borderRadius: 0, bgcolor: 'background.paper', transition: 'width 0.2s' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/board">
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                {!isMobile && <ListItemText primary="Sprint Board" />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/analytics">
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                {!isMobile && <ListItemText primary="Analytics" />}
              </ListItemButton>
            </ListItem>
            {/* Visible to admin only */}
            {user?.isAdmin && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/top-users">
                    <ListItemIcon><LeaderboardIcon /></ListItemIcon>
                    {!isMobile && <ListItemText primary="Top Users" />}
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/users">
                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                    {!isMobile && <ListItemText primary="User Management" />}
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header */}
        <AppBar
          position="fixed"
          color="inherit"
          elevation={2}
          sx={{
            borderRadius: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: { xs: `calc(100% - ${currentDrawerWidth}px)` },
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
          }}
        >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 2, sm: 4 },
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              color="primary"
              fontWeight={700}
              sx={{ letterSpacing: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
            >
              SprintSync
            </Typography>
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={handleAvatarClick}
                size="large"
                edge="end"
                color="primary"
                sx={{
                  ml: 1,
                  '&:hover, &:active': {
                    background: 'rgba(25, 118, 210, 0.08)',
                  },
                  '&:focus': { background: 'transparent' },
                  '&:focus:not(:focus-visible)': {
                    outline: 'none',
                    boxShadow: 'none',
                    border: 'none',
                    background: 'transparent',
                  },
                }}
                disableFocusRipple
                disableRipple
              >
                <Avatar sx={{ width: 40, height: 40 }}>
                  {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <MenuItem disabled>{user?.name || user?.email}</MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        {/* Page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            height: '100%',
            mt: { xs: 7, sm: 8 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
} 