import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Store as SellerIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileDialog = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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

  const handleViewFullProfile = () => {
    onClose();
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(to bottom right, #f9f9f9, #ffffff)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
        color: 'white',
        py: 2,
        px: 3
      }}>
        <Typography variant="h6" fontWeight="600">Profile Details</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'center', 
              mb: 3,
              gap: 3
            }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#3f51b5',
                  fontSize: '2.5rem',
                  boxShadow: '0 4px 20px rgba(63, 81, 181, 0.3)',
                  border: '3px solid white'
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
              
              <Box sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                flex: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {user?.name || 'Admin User'}
                  </Typography>
                  <IconButton size="small" sx={{ ml: 'auto' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  alignItems: 'center', 
                  gap: 1,
                  mt: 1.5
                }}>
                  <Chip
                    icon={roleIcons[user?.role] || <AdminIcon />}
                    label={user?.role?.toUpperCase() || 'ADMIN'}
                    color={roleColors[user?.role] || 'error'}
                    size="small"
                    sx={{ 
                      textTransform: 'capitalize',
                      fontWeight: 600
                    }}
                  />
                  <Chip
                    icon={<CalendarIcon fontSize="small" />}
                    label={`Joined: ${new Date().toLocaleDateString()}`}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(63, 81, 181, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(63, 81, 181, 0.1)',
                  height: '100%'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#3f51b5' }} />
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{user?.email || 'admin@example.com'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(63, 81, 181, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(63, 81, 181, 0.1)',
                  height: '100%'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#3f51b5' }} />
                    Phone Number
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{user?.phone || 'Not available'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(63, 81, 181, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(63, 81, 181, 0.1)',
                  height: '100%'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#3f51b5' }} />
                    Location
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{user?.location || 'Not available'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(63, 81, 181, 0.03)', 
                  borderRadius: 2,
                  border: '1px solid rgba(63, 81, 181, 0.1)',
                  height: '100%'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <AdminIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#3f51b5' }} />
                    Permissions
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user?.role === 'admin' ? 'Full access' : 'Limited access'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="primary"
          sx={{
            borderRadius: '8px',
            px: 3,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
        <Button 
          onClick={handleViewFullProfile} 
          variant="contained" 
          color="primary"
          startIcon={<PersonIcon />}
          sx={{
            borderRadius: '8px',
            px: 3,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)'
          }}
        >
          View Full Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;