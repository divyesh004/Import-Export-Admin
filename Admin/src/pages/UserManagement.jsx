import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  AdminPanelSettings as AdminIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { API_BASE_URL } from '../config/env';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Login required. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (showBannedOnly) {
        const response = await fetch(`${API_BASE_URL}auth/banned-users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch banned users');
        }
        
        const bannedUsers = await response.json();
        setUsers(bannedUsers);
        setError(null);
      } else {
        const roles = ['customer', 'seller', 'admin'];
        const responses = await Promise.all(
          roles.map(role =>
            fetch(`${API_BASE_URL}auth/role/${role}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
          )
        );

        const results = await Promise.all(
          responses.map(async (response, index) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${roles[index]} users`);
            }
            return response.json();
          })
        );

        const allUsers = results.flat();
        setUsers(allUsers);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
      setUsers([]); // Moved inside catch block
    } finally {
      setLoading(false);
    }
  }, [getToken, showBannedOnly]);

  const handleBanUser = useCallback(async (userId) => {
    const token = getToken();
    if (!token) {
      setError('Login required. Please log in.');
      return;
    }
    try {
      const user = users.find(u => u.id === userId);
      const response = await fetch(`${API_BASE_URL}auth/ban/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_banned: !user.is_banned
        })
      });
      
      if (!response.ok) throw new Error('Failed to update user status');
      
      // Show success message
      alert(`User ${user.is_banned ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
      if (!response.ok) throw new Error('Failed to update user status');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }, [getToken, fetchUsers, users]);

  const handleApproveSeller = useCallback(async (userId) => {
    const token = getToken();
    if (!token) {
      setError('Login required. Please log in.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}auth/approve/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to approve seller');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }, [getToken, fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (!user) return false;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (user.name?.toLowerCase() || '').includes(searchLower) ||
        (user.email?.toLowerCase() || '').includes(searchLower);
      const matchesBanStatus = !showBannedOnly || user.is_banned;
      return matchesRole && matchesSearch && matchesBanStatus;
    });
  }, [users, roleFilter, searchQuery, showBannedOnly]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'seller': return <StoreIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'seller': return 'primary';
      default: return 'default';
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading data...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 } }}>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
        <TextField
          select
          label="Filter by Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          size="small"
          sx={{ width: 200 }}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
          disabled={showBannedOnly}
        >
          <MenuItem value="all">All Roles</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="seller">Seller</MenuItem>
          <MenuItem value="customer">Customer</MenuItem>
        </TextField>
        
        <Button
          variant={showBannedOnly ? "contained" : "outlined"}
          color="error"
          startIcon={<BlockIcon />}
          onClick={() => setShowBannedOnly(!showBannedOnly)}
          size="small"
          sx={{ ml: 1, borderRadius: 2 }}
        >
          {showBannedOnly ? "Show All Users" : "Show Banned Only"}
        </Button>
      </Box>

      {filteredUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary">
            No users found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                },
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={getRoleIcon(user.role)}
                    >
                      <Avatar
                        alt={user.name}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          bgcolor: user.is_banned ? 'error.light' : 'primary.light'
                        }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </Badge>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" component="div">
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                      icon={getRoleIcon(user.role)}
                      sx={{ borderRadius: 1 }}
                    />
                    <Chip
                      label={user.is_banned ? 'Banned' : 'Active'}
                      color={user.is_banned ? 'error' : 'success'}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>                 
                </CardContent>
                <Divider />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserManagement;