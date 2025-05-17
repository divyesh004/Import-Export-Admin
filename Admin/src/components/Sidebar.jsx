import { useState, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Button,
  Avatar,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import ProfileDialog from './ProfileDialog';
import { useAuth } from '../services/AuthContext';
import { Login as LoginIcon } from '@mui/icons-material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  QuestionAnswer as QuestionAnswerIcon,
  BarChart as BarChartIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Report as ReportIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  RequestQuote as RequestQuoteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

const drawerWidth = 260;

// Logo component with minimal design
const LogoComponent = memo(({ children }) => {
  const Logo = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.primary.main,
    position: 'relative',
    overflow: 'hidden'
  }));

  return (
    <Logo sx={{ flex: 1 }}>
      {children}
    </Logo>
  );
});

// Menu item component with minimal design
const MenuItem = memo(({ item, isActive, onClick, index }) => {
  return (
    <div>
      <ListItem
        button
        onClick={onClick}
        selected={isActive}
        sx={{
          my: 0.5,
          borderRadius: 0,
          pl: 2,
          transition: 'all 0.2s ease',
          borderLeft: isActive ? '3px solid' : '3px solid transparent',
          borderLeftColor: isActive ? 'primary.main' : 'transparent',
          backgroundColor: 'transparent',
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            color: 'primary.main',
          },
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <ListItemIcon sx={{ 
          minWidth: 40, 
          color: isActive ? 'primary.main' : 'text.secondary',
        }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.text} 
          primaryTypographyProps={{ 
            fontSize: '0.85rem',
            fontWeight: isActive ? 'bold' : 'medium',
            color: isActive ? 'primary.main' : 'text.primary',
            fontFamily: '"Inter", sans-serif'
          }}
        />
        {item.text === 'Product Moderation' && (
          <Badge 
            variant="dot"
            color="error" 
          />
        )}
      </ListItem>
    </div>
  );
});

// User profile component with minimal design
const UserProfile = memo(({ user, onClick }) => {
  if (!user) return null;
  
  return (
    <div>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5, 
          mb: 1, 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
        onClick={onClick}
      >
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            width: 32, 
            height: 32 
          }}
        >
          {user?.name?.charAt(0) || 'A'}
        </Avatar>
        <Box sx={{ ml: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {user?.name || 'Admin User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role || 'Administrator'}
          </Typography>
        </Box>
      </Box>
    </div>
  );
});

const menuItems = [
  { text: 'Dashboard', path: '/', roles: ['admin', 'sub-admin'], icon: <DashboardIcon fontSize="small" /> },
  { text: 'User Management', path: '/users', roles: ['admin'], icon: <PeopleIcon fontSize="small" /> },
  { text: 'Product Moderation', path: '/products', roles: ['admin', 'sub-admin'], icon: <InventoryIcon fontSize="small" /> },
  { text: 'Approved Products', path: '/approved-products', roles: ['admin', 'sub-admin'], icon: <CheckCircleIcon fontSize="small" /> },
  { text: 'Buyer Requests', path: '/product-requests', roles: ['admin', 'sub-admin'], icon: <RequestQuoteIcon fontSize="small" /> },
  { text: 'Order Management', path: '/orders', roles: ['admin', 'sub-admin'], icon: <ShoppingCartIcon fontSize="small" /> },
  { text: 'Analytics', path: '/analytics', roles: ['admin', 'sub-admin'], icon: <BarChartIcon fontSize="small" /> },
  { text: 'Role Management', path: '/roles', roles: ['admin', 'sub-admin'], icon: <AdminPanelSettingsIcon fontSize="small" /> },
  { text: 'Q&A Management', path: '/questions/all', roles: ['admin', 'sub-admin'], icon: <QuestionAnswerIcon fontSize="small" /> },
  { text: 'QA Moderation', path: '/qa-moderation', roles: ['admin', 'sub-admin'], icon: <QuestionAnswerIcon fontSize="small" /> },
  { text: 'Profile', path: '/profile', roles: ['admin', 'sub-admin'], icon: <PersonIcon fontSize="small" /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileClick = () => {
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleViewFullProfile = () => {
    navigate('/profile');
  };
  
  const handleMenuItemClick = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  // Memoize the drawer content to prevent unnecessary re-renders
  const drawer = useMemo(() => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8f9fa', fontFamily: '"Inter", sans-serif' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoComponent>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white', 
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                zIndex: 1,
                letterSpacing: 1,
              }}
            >
              <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
              Admin Panel
            </Typography>
          </LogoComponent>
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ 
              display: { xs: 'flex', sm: 'none' },
              mr: 1,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              },
              zIndex: 2,
              position: 'absolute',
              right: 10,
              top: 10
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <UserProfile user={user} onClick={handleProfileClick} />
        </Box>
        
        <Divider sx={{ mx: 2, mb: 2 }} />
        
        <List sx={{ px: 1 }}>
          <AnimatePresence>
            {menuItems
              .filter(item => {
                // Get user role from localStorage or user object
                const userRole = user?.role || localStorage.getItem('userRole');
                // Show menu item only if user role is included in the item's roles array
                return item.roles.includes(userRole);
              })
              .map((item, index) => (
                <MenuItem 
                  key={item.text}
                  item={item} 
                  index={index}
                  isActive={location.pathname === item.path}
                  onClick={() => handleMenuItemClick(item.path)}
                />
              ))}
          </AnimatePresence>
        </List>
        
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          {!user ? (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
            </motion.div>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Tooltip title="Settings">
                  <IconButton 
                    sx={{ 
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="View Profile">
                  <IconButton 
                    sx={{ 
                      bgcolor: 'rgba(25, 118, 210, 0.04)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                    }}
                    onClick={handleViewFullProfile}
                  >
                    <PersonIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={<ExitToAppIcon />}
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Logout
                </Button>
              </motion.div>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 2, 
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}
              >
                @2025 Indibridge Admin Side
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }, [user, location.pathname, handleDrawerToggle, handleProfileClick, handleViewFullProfile, logout, navigate]);

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Profile Dialog */}
      <ProfileDialog open={profileOpen} onClose={handleProfileClose} />
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          mr: 2, 
          display: { sm: 'none' },
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.1)' }
        }}
      >
        <MenuIcon />
      </IconButton>
      {/* Mobile drawer with improved performance */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer with improved performance */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            border: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default memo(Sidebar);