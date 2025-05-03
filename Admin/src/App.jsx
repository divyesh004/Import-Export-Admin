import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, Typography, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AuthProvider, useAuth } from './services/AuthContext';

// Auth components
import Login from './components/Login';

// Layout components
import Dashboard from './layouts/Dashboard';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import UserManagement from './pages/UserManagement';
import ProductModeration from './pages/ProductModeration';
import Analytics from './pages/Analytics';
import RoleManagement from './pages/RoleManagement';
import QASystem from './components/QASystem';
import QAModeration from './pages/QAModeration';
import ApprovedProducts from './pages/ApprovedProducts';
import ProfilePage from './pages/Profile';
import OrderManagement from './pages/OrderManagement';
import ProductRequests from './pages/ProductRequests';

const theme = createTheme({
  palette: {
    primary: {
      light: '#4dabf5',
      main: '#1976d2',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff4081',
      main: '#f50057',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#03a9f4',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.05)',
    '0px 6px 12px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.08)',
    // Keep the rest of the shadows as default
    ...Array(20).fill('').map((_, i) => i > 4 ? createTheme().shadows[i] : '')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 8px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 12px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          },
          '&.MuiButton-containedSecondary': {
            background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  if (userRole !== 'admin' && userRole !== 'sub-admin') {
    return <Navigate to="/login" replace />;
  }

  // Define routes that are restricted to admin only
  const adminOnlyRoutes = ['/users'];
  
  // Restrict sub-admin from accessing admin-only pages
  if (userRole === 'sub-admin' && adminOnlyRoutes.includes(location.pathname)) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          mt: 8, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            maxWidth: 500, 
            mx: 'auto',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '8px',
              background: 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)',
            }
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              color: '#f44336',
              textShadow: '0px 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            Access Restricted
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
            Sorry, as a sub-admin you do not have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 4 }}>
            This feature is only available to admin users.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => window.history.back()}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              px: 4, 
              py: 1.2,
              borderRadius: 3,
              fontWeight: 'bold'
            }}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');

  if (userRole === 'admin' || userRole === 'sub-admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // Remove this line that's causing the error
  // const { user } = useAuth();
  const userRole = localStorage.getItem('userRole');
  const isAdminOrSubAdmin = userRole === 'admin' || userRole === 'sub-admin';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent isAdminOrSubAdmin={isAdminOrSubAdmin} />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Create a new component that will be a child of AuthProvider
const AppContent = ({ isAdminOrSubAdmin: propIsAdminOrSubAdmin }) => {
  const { user } = useAuth(); // Now useAuth is used within AuthProvider
  
  // Use user state from AuthContext instead of just props
  const isAdminOrSubAdmin = user?.role === 'admin' || user?.role === 'sub-admin' || propIsAdminOrSubAdmin;
  
  return (
    <Box sx={{ display: 'flex' }}>
      {isAdminOrSubAdmin && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {isAdminOrSubAdmin && <Navbar />}
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/approved-products"
            element={
              <PrivateRoute>
                <ApprovedProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <ProductModeration />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <PrivateRoute>
                <RoleManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/questions/*"
            element={
              <PrivateRoute>
                <QASystem />
              </PrivateRoute>
            }
          />
          <Route
            path="/qa-moderation"
            element={
              <PrivateRoute>
                <QAModeration />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrderManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/product-requests"
            element={
              <PrivateRoute>
                <ProductRequests />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;