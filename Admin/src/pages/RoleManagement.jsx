import React, { useState, useEffect } from 'react';
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
  Pagination
} from '@mui/material';
import {
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Store as SellerIcon,
  Search as SearchIcon
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  
  const roles = ['customer', 'seller', 'admin'];
  const { user: currentUser, getToken } = useAuth();

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
    fetchUsers();
  }, []);

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
        setError('Only admins can assign admin role');
        return;
      }

      const response = await fetch(`${API_BASE_URL}auth/role/change/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
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
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setNewRole('');
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading user data...</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Role Management
        </Typography>
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

      <Box sx={{ mb: 3 }}>
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
                    <Chip
                      icon={roleIcons[user.role]}
                      label={user.role}
                      color={roleColors[user.role]}
                      variant="outlined"
                    />
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
                    disabled={role === 'admin' && currentUser?.role !== 'admin'}
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
            disabled={!newRole || newRole === selectedUser?.role}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;