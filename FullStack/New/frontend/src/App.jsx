import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './auth/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import ProtectedRoute from './routes/ProtectedRoute';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box className="App">
            <Header />
            <Box className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;