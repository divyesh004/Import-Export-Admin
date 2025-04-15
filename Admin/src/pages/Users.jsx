import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Check, Block, Search, Refresh } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, userId: null });

  const fetchUsers = async (role = 'all') => {
    try {
      let response;
      if (showBannedOnly) {
        response = await axios.get(`${API_BASE_URL}auth/banned-users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        response = await axios.get(`${API_BASE_URL}auth/role/${role}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers(selectedRole);
  }, [selectedRole, showBannedOnly]);

  useEffect(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (showBannedOnly) {
      filtered = filtered.filter(user => user.is_banned);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, users, showBannedOnly]);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAction = async (action, userId) => {
    try {
      if (action === 'approve') {
        await axios.patch(`${API_BASE_URL}auth/approve/${userId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else if (action === 'ban') {
        const user = users.find(u => u.id === userId);
        await axios.patch(`${API_BASE_URL}auth/ban/${userId}`, {
          is_banned: !user.is_banned
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      fetchUsers(selectedRole);
      setConfirmDialog({ open: false, action: null, userId: null });
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select value={selectedRole} onChange={handleRoleChange} label="Role" disabled={showBannedOnly}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="seller">Seller</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search Users"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            endAdornment: <Search />
          }}
        />
        
        <Button 
          variant={showBannedOnly ? "contained" : "outlined"}
          color="error"
          startIcon={<Block />}
          onClick={() => setShowBannedOnly(!showBannedOnly)}
          sx={{ ml: 1 }}
        >
          {showBannedOnly ? "Show All Users" : "Show Banned Only"}
        </Button>

        <IconButton onClick={() => fetchUsers(selectedRole)} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'error' : user.role === 'seller' ? 'warning' : 'info'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_banned ? 'Banned' : user.role === 'seller' && !user.is_approved ? 'Pending' : 'Active'}
                    color={user.is_banned ? 'error' : user.role === 'seller' && !user.is_approved ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  {user.role === 'seller' && !user.is_approved && (
                    <Button
                      startIcon={<Check />}
                      onClick={() => setConfirmDialog({ open: true, action: 'approve', userId: user.id })}
                      color="success"
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    startIcon={<Block />}
                    onClick={() => setConfirmDialog({ open: true, action: 'ban', userId: user.id })}
                    color={user.is_banned ? 'primary' : 'error'}
                  >
                    {user.is_banned ? 'Unban' : 'Ban'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, userId: null })}
      >
        <DialogTitle>
          Confirm {confirmDialog.action === 'approve' ? 'Approval' : confirmDialog.action === 'ban' ? 'Ban' : 'Action'}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {confirmDialog.action === 'approve' ? 'approve this seller' : 'ban/unban this user'}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, userId: null })}>Cancel</Button>
          <Button onClick={() => handleAction(confirmDialog.action, confirmDialog.userId)} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;