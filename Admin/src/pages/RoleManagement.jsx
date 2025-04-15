import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  Pagination,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Store as SellerIcon,
  Search as SearchIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { API_BASE_URL } from '../config/env';  // Updated import path

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [industries, setIndustries] = useState(['Electronics', 'Fashion', 'Food', 'Furniture', 'Health', 'Sports', 'Technology', 'Toys', 'Other']);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  
  const roles = ['customer', 'seller', 'admin', 'sub-admin'];
  const { user: currentUser, getToken } = useAuth();

  const roleIcons = {
    admin: <AdminIcon color="error" />,
    'sub-admin': <AdminIcon color="warning" />,
    seller: <SellerIcon color="primary" />,
    customer: <PersonIcon color="action" />
  };

  const roleColors = {
    admin: 'error',
    'sub-admin': 'warning',
    seller: 'primary',
    customer: 'default'
  };


  const location = useLocation();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    // Check if there's a user ID in the URL query params
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('user');
    
    if (userId && users.length > 0) {
      const userToSelect = users.find(user => user.id === userId);
      if (userToSelect) {
        openDialog(userToSelect);
      }
    }
  }, [location.search, users]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      setError('Access token required. Please login.');
      setLoading(false);
      return;
    }

    try {
      // Fetch all types of users
      const responses = await Promise.all(
        roles.map(role =>
          fetch(`${API_BASE_URL}auth/role/${role}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );

      // Check if any response failed
      const failedResponse = responses.find(response => !response.ok);
      if (failedResponse) {
        throw new Error('Error fetching users information');
      }

      // Get data from all responses
      const usersData = await Promise.all(
        responses.map(response => response.json())
      );

      // Combine all users
      const allUsers = usersData.flat();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const token = getToken();
    if (!token) {
      setError('Access token required. Please login.');
      return;
    }

    try {
      // Prevent changing admin roles
      const userToUpdate = users.find(u => u.id === userId);
      if (userToUpdate?.role === 'admin') {
        setError('Cannot change admin role');
        return;
      }

      // Prevent setting role to admin
      if (newRole === 'admin' && currentUser?.role !== 'admin') {
        setError('Only admins can assign admin roles');
        return;
      }
      
      // Allow both admin and sub-admin to assign sub-admin role
      if (newRole === 'sub-admin' && currentUser?.role !== 'admin' && currentUser?.role !== 'sub-admin') {
        setError('Only admins or sub-admins can assign sub-admin roles');
        return;
      }
      
      // For sub-admin role, industry is required
      if (newRole === 'sub-admin' && !selectedIndustry) {
        setError('Please select an industry for the sub-admin');
        return;
      }

      const requestBody = { role: newRole };
      
      // Add industry for sub-admin role
      if (newRole === 'sub-admin') {
        requestBody.industry = selectedIndustry;
      }
      
      const response = await fetch(`${API_BASE_URL}auth/role/change/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
      
      setSuccess(`Successfully updated user role to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const openDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setSelectedIndustry(user.industry || '');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setNewRole('');
    setSelectedIndustry('');
  };

  const confirmRoleChange = () => {
    handleRoleChange(selectedUser.id, newRole);
    closeDialog();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Check if current user is admin - use both currentUser and localStorage for reliability
  const userRoleFromStorage = localStorage.getItem('userRole');
  const isAdmin = currentUser?.role === 'admin' || userRoleFromStorage === 'admin';
   
  // For debugging
  console.log('Current User:', currentUser);
  console.log('Is Admin:', isAdmin);
  console.log('User Role from localStorage:', userRoleFromStorage);
  
  // Render loading state
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading user data...</Typography>
    </Box>
  );

  // Render permission restricted page for non-admin users
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Card 
          elevation={3} 
          sx={{ 
            maxWidth: 500, 
            width: '100%', 
            textAlign: 'center',
            p: 3,
            marginTop: '120px',
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #f44336, #ff9800)'
          }} />
          <CardContent sx={{ pt: 4 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'error.main', 
              mx: 'auto',
              mb: 2,
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)'
            }}>
              <LockIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
              Access Restricted
            </Typography>
            <Divider sx={{ my: 2, width: '60%', mx: 'auto' }} />
            <Typography variant="body1" paragraph sx={{ mb: 3, fontSize: '1.1rem', maxWidth: '90%', mx: 'auto' }}>
              Role management can only be performed by administrators. You do not have permission to access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please contact your system administrator if you believe you should have access to this feature.
            </Typography>
          </CardContent>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ 
              mt: 2, 
              mb: 2, 
              px: 3, 
              py: 1, 
              borderRadius: '24px',
              boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 14px rgba(63, 81, 181, 0.3)'
              }
            }}
          >
            Go Back
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 ,width:'500px' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name, email or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'background.paper' }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Current Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Typography variant="body1">{user.name || 'Unknown'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip
                        icon={roleIcons[user.role]}
                        label={user.role}
                        color={roleColors[user.role]}
                        variant="outlined"
                      />
                      {user.role === 'sub-admin' && user.industry && (
                        <Chip
                          size="small"
                          label={`Industry: ${user.industry}`}
                          variant="outlined"
                          color="info"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Change role">
                      <IconButton
                        onClick={() => openDialog(user)}
                        disabled={user.role === 'admin' && currentUser?.role !== 'admin'}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Change User Role
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              User: <strong>{selectedUser?.name}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Email: {selectedUser?.email}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Current Role: {selectedUser?.role}
            </Typography>
            {selectedUser?.role === 'sub-admin' && selectedUser?.industry && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Current Industry: {selectedUser?.industry}
              </Typography>
            )}
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Select New Role</InputLabel>
              <Select
                value={newRole}
                label="Select New Role"
                onChange={(e) => setNewRole(e.target.value)}
                fullWidth
              >
                {roles.map((role) => (
                  <MenuItem 
                    key={role} 
                    value={role}
                    disabled={(role === 'admin' || role === 'sub-admin') && currentUser?.role !== 'admin'}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {roleIcons[role]}
                      <Typography sx={{ ml: 1 }}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {newRole === 'sub-admin' && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  label="Select Industry"
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  fullWidth
                  required
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={confirmRoleChange} 
            color="primary" 
            variant="contained"
            disabled={!newRole || newRole === selectedUser?.role || (newRole === 'sub-admin' && !selectedIndustry)}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;