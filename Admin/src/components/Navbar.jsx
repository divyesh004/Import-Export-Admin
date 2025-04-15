import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  InputBase,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ProfileDialog from './ProfileDialog';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Mail as MailIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

const drawerWidth = 280;

// Styled search component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = ({ handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  const handleProfileMenuOpen = (event) => {
    // Open profile dialog instead of menu
    setProfileOpen(true);
    // Don't set anchor element for menu to prevent menu from opening
     setAnchorEl(event.currentTarget);
  };
  
  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 260px)` },
        ml: { sm: `260px` },
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            mr: 2, 
            display: { xs: 'flex', sm: 'none' },
            color: 'primary.main',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: 'rgba(33, 150, 243, 0.1)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Import-Export Admin
        </Typography>

        <Box sx={{ display: 'flex' }}>
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{
              ml: 1,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'primary.main',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <AccountCircle />
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 2,
              minWidth: 180,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
       
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>

    
      </Toolbar>
      
      {/* Profile Dialog */}
      <ProfileDialog open={profileOpen} onClose={handleProfileClose} />
    </AppBar>
  );
};

export default Navbar;