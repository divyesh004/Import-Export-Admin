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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

const drawerWidth = 260;

// Logo component with gradient
const LogoComponent = memo(({ children }) => {
  const Logo = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
      zIndex: 0,
    }
  }));

  return (
    <Logo sx={{ flex: 1 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </Logo>
  );
});

// Menu item component
const MenuItem = memo(({ item, isActive, onClick, index }) => {
  return (
    <motion.div
      key={item.text}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <ListItem
        button
        onClick={onClick}
        selected={isActive}
        sx={{
          my: 0.5,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: 'relative',
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50px',
              height: '100%',
              backgroundColor: '#fff',
              opacity: 0.5,
            },
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? 'white' : 'primary.main',
            minWidth: 40,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.text} 
          primaryTypographyProps={{ 
            fontSize: '0.9rem',
            fontWeight: isActive ? 'bold' : 'medium',
          }}
        />
        {item.text === 'Product Moderation' && (
          <Badge 
            badgeContent="New" 
            color="error" 
            sx={{ 
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 16,
                minWidth: 16,
              }
            }}
          />
        )}
      </ListItem>
    </motion.div>
  );
});

// User profile component
const UserProfile = memo(({ user, onClick }) => {
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5, 
          mb: 2, 
          borderRadius: 2,
          bgcolor: 'rgba(63, 81, 181, 0.05)',
          border: '1px dashed rgba(63, 81, 181, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(63, 81, 181, 0.1)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
          }
        }}
        onClick={onClick}
      >
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            boxShadow: '0 4px 8px rgba(63, 81, 181, 0.25)',
            width: 40, 
            height: 40 
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
    </motion.div>
  );
});

const menuItems = [
  { text: 'User Management', icon: <PeopleIcon />, path: '/users', roles: ['admin'] },
  { text: 'Product Moderation', icon: <InventoryIcon />, path: '/products', roles: ['admin', 'sub-admin'] },
  { text: 'Approved Products', icon: <InventoryIcon />, path: '/approved-products', roles: ['admin', 'sub-admin'] },
  { text: 'Order Management', icon: <ReceiptIcon />, path: '/orders', roles: ['admin', 'sub-admin'] },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['admin', 'sub-admin'] },
  { text: 'Role Management', icon: <AdminPanelSettingsIcon />, path: '/roles', roles: ['admin', 'sub-admin'] },
  { text: 'Q&A Management', icon: <QuestionAnswerIcon />, path: '/questions/all', roles: ['admin', 'sub-admin'] },
  { text: 'QA Moderation', icon: <ReportIcon />, path: '/qa-moderation', roles: ['admin', 'sub-admin'] },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile', roles: ['admin', 'sub-admin'] },
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
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8f9fa' }}>
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