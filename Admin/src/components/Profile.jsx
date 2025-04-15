import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Container,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Store as SellerIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const Profile = () => {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const roleIcons = {
    admin: <AdminIcon color="error" />,
    seller: <SellerIcon color="primary" />,
    customer: <PersonIcon color="action" />
  };

  const roleColors = {
    admin: 'error',
    seller: 'primary',
    customer: 'default'
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || ''
      });
    }
  }, [userData]);

  const fetchUserData = async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      setError('You need to be logged in');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to fetch profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        location: userData?.location || '',
        bio: userData?.bio || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = getToken();
    if (!token) {
      setError('You need to be logged in');
      setLoading(false);
      return;
    }

    try {
      // Import userService and use it instead of direct axios call
      const userService = (await import('../services/userService')).default;
      const response = await userService.updateUser(formData);
      
      // Refresh user data after update
      await fetchUserData();
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match');
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setError('You need to be logged in');
      setLoading(false);
      return;
    }

    try {
      // Try with the standard auth endpoint for password update
      await axios.patch(`${API_BASE_URL}auth/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh user data after password update
      await fetchUserData();
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '180px',
              background: 'linear-gradient(135deg, #3f51b5 0%, #6573c3 100%)',
              zIndex: 0,
            }
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Profile Header */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'center', md: 'flex-start' },
              pt: 4,
              pb: 2,
              gap: 3
            }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  border: '4px solid white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
              >
                {userData?.name?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </Avatar>
              
              <Box sx={{ 
                flex: 1,
                color: 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'center', sm: 'flex-start' }, 
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {userData?.name || user?.name || 'User'}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      mt: 1.5
                    }}>
                      <Chip
                        icon={roleIcons[userData?.role || user?.role] || <AdminIcon />}
                        label={(userData?.role || user?.role || 'admin').toUpperCase()}
                        color={roleColors[userData?.role || user?.role] || 'error'}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255,255,255,0.2)'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Button
                    variant={editMode ? "outlined" : "contained"}
                    color={editMode ? "error" : "primary"}
                    startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                    onClick={handleEditToggle}
                    sx={{ 
                      borderRadius: 2,
                      alignSelf: { xs: 'center', sm: 'flex-start' },
                      backgroundColor: editMode ? 'white' : '',
                      '&:hover': {
                        backgroundColor: editMode ? '#ffeeee' : ''
                      }
                    }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ 
              mt: 4,
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              p: 3
            }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    height: 3,
                    backgroundColor: 'primary.main'
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    minWidth: 120,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main'
                    }
                  },
                }}
              >
                <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
              </Tabs>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Information Tab */}
              {tabValue === 0 && (
                <Box>
                  {editMode ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          variant="outlined"
                          margin="normal"
                          disabled
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          variant="outlined"
                          margin="normal"
                          multiline
                          rows={4}
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            sx={{ 
                              borderRadius: 2,
                              px: 4,
                              py: 1
                            }}
                          >
                            {loading ? 'Updating...' : 'Save Changes'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ 
                          height: '100%', 
                          borderRadius: 2, 
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
                          }
                        }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                              Personal Information
                            </Typography>
                            <List disablePadding>
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <PersonIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Name" 
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                  secondary={userData?.name || user?.name || 'Not available'} 
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <EmailIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Email" 
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                  secondary={userData?.email || user?.email || 'Not available'} 
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <PhoneIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Phone" 
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                  secondary={userData?.phone || user?.phone || 'Not available'} 
                                />
                              </ListItem>
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ 
                          height: '100%', 
                          borderRadius: 2, 
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
                          }
                        }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                              Additional Information
                            </Typography>
                            <List disablePadding>
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <LocationIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Location" 
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                  secondary={userData?.location || user?.location || 'Not available'} 
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <AdminIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Role" 
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                  secondary={userData?.role || user?.role || 'admin'} 
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <CalendarIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Join Date" 
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                  secondary={userData?.joinDate || user?.joinDate || new Date().toLocaleDateString()} 
                                />
                              </ListItem>
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}

              {/* Security Tab */}
              {tabValue === 1 && (
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    Choose a strong password to secure your account.
                  </Typography>
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Current Password"
                    name="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="New Password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                  
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<KeyIcon />}
                      onClick={handleUpdatePassword}
                      disabled={loading}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        py: 1
                      }}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Notifications Tab */}
              {tabValue === 2 && (
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Notification Preferences
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    Customize your notification settings according to your preferences.
                  </Typography>
                  
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="System Updates" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Receive notifications about system updates and maintenance" 
                      />
                      <Switch defaultChecked color="primary" />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="New User Registrations" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Get notified when new users sign up" 
                      />
                      <Switch defaultChecked color="primary" />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Product Approval Requests" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Receive notifications for new product approval requests" 
                      />
                      <Switch defaultChecked color="primary" />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <NotificationsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email Notifications" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Get email notifications for important updates" 
                      />
                      <Switch defaultChecked color="primary" />
                    </ListItem>
                  </List>
                  
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        py: 1
                      }}
                    >
                      Save Settings
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Profile;