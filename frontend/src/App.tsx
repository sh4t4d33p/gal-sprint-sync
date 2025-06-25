import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Suspense, lazy } from 'react';
import { UserProvider } from './UserContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';
import theme from './theme';

const BoardPage = lazy(() => import('./routes/BoardPage'));
const AnalyticsPage = lazy(() => import('./routes/AnalyticsPage'));
const AuthPage = lazy(() => import('./routes/AuthPage'));
const ProfilePage = lazy(() => import('./routes/ProfilePage'));
const TopUsersPage = lazy(() => import('./routes/TopUsersPage'));
const UsersPage = lazy(() => import('./routes/UsersPage'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><AuthPage /></Suspense>} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/board" element={<Suspense fallback={<div>Loading...</div>}><BoardPage /></Suspense>} />
              <Route path="/analytics" element={<Suspense fallback={<div>Loading...</div>}><AnalyticsPage /></Suspense>} />
              <Route path="/users" element={<Suspense fallback={<div>Loading...</div>}><UsersPage /></Suspense>} />
              <Route path="/top-users" element={<Suspense fallback={<div>Loading...</div>}><TopUsersPage /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<div>Loading...</div>}><ProfilePage /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
