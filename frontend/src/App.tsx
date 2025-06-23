import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import AuthPage from './routes/AuthPage';
import theme from './theme';
import { UserProvider } from './UserContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';
import BoardPage from './routes/BoardPage';
import AnalyticsPage from './routes/AnalyticsPage';
import UsersPage from './routes/UsersPage';
import ProfilePage from './routes/ProfilePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/board" element={<BoardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
