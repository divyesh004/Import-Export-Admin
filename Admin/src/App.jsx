import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './services/AuthContext';

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
import ApprovedProducts from './pages/ApprovedProducts';
import ProfilePage from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');

  if (userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');

  if (userRole === 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ display: 'flex' }}>
            {isAdmin && <Sidebar />}
            <Box component="main" sx={{ flexGrow: 1 }}>
              {isAdmin && <Navbar />}
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
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;