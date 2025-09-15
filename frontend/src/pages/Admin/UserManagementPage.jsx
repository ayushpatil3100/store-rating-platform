
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, IconButton,
  MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../components/Table/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import AlertDialog from '../../components/Common/AlertDialog';
import * as userService from '../../services/userService';


const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' }); 
  const [debouncedFilters, setDebouncedFilters] = useState(filters); 
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });

  
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [dialogFormData, setDialogFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'Normal User',
  });
  const [dialogError, setDialogError] = useState('');

  
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const roles = ['System Administrator', 'Normal User', 'Store Owner'];

  
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); 
    return () => {
      clearTimeout(timerId);
    };
  }, [filters]);


  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
        const fetchedUsers = await userService.getAllUsersAdmin(debouncedFilters, sort);
        setUsers(fetchedUsers || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
}, [debouncedFilters, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (field, order) => {
    setSort({ field, order });
  };

  const handleOpenAddUser = () => {
    setCurrentUser(null);
    setDialogFormData({
      name: '', email: '', password: '', confirmPassword: '', address: '', role: 'Normal User',
    });
    setDialogError('');
    setOpenUserDialog(true);
  };

  const handleOpenEditUser = (user) => {
    setCurrentUser(user);
    setDialogFormData({
      name: user.name,
      email: user.email,
      password: '', 
      confirmPassword: '',
      address: user.address,
      role: user.role,
    });
    setDialogError('');
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleDialogFormChange = (e) => {
    const { name, value } = e.target;
    setDialogFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateDialogForm = () => {
    const errors = [];
    if (!dialogFormData.name || dialogFormData.name.length < 20 || dialogFormData.name.length > 60) {
      errors.push('Name must be between 20 and 60 characters.');
    }
    if (!dialogFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dialogFormData.email)) {
      errors.push('Invalid email format.');
    }
    if (!currentUser || dialogFormData.password) { 
      if (dialogFormData.password.length < 8 || dialogFormData.password.length > 16 || !/[A-Z]/.test(dialogFormData.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(dialogFormData.password)) {
        errors.push('Password must be 8-16 characters, include one uppercase, and one special character.');
      }
      if (dialogFormData.password !== dialogFormData.confirmPassword) {
        errors.push('Passwords do not match.');
      }
    }
    if (dialogFormData.address && dialogFormData.address.length > 400) {
      errors.push('Address cannot exceed 400 characters.');
    }
    if (!roles.includes(dialogFormData.role)) {
      errors.push('Invalid user role selected.');
    }
    return errors;
  };

  const handleSaveUser = async () => {
    setDialogError('');
    const validationErrors = validateDialogForm();
    if (validationErrors.length > 0) {
        setDialogError(validationErrors.join('\n'));
        return;
    }

    try {
        if (currentUser) {
            
            const userDataToUpdate = {
                name: dialogFormData.name,
                email: dialogFormData.email,
                address: dialogFormData.address,
                role: dialogFormData.role,
            };
            if (dialogFormData.password) { 
                userDataToUpdate.password = dialogFormData.password;
            }
            await userService.updateUserAdmin(currentUser.id, userDataToUpdate);
            setError('User updated successfully!');
        } else {
            
            const dataToAdd = {
                name: dialogFormData.name,
                email: dialogFormData.email,
                password: dialogFormData.password,
                address: dialogFormData.address,
                role: dialogFormData.role,
            };
            await userService.addUserAdmin(dataToAdd);
            setError('User added successfully!');
        }
        handleCloseUserDialog();
        fetchUsers(); 
        setTimeout(() => setError(''), 3000);
    } catch (err) {
        console.error('Failed to save user:', err);
        setDialogError(err.response?.data?.message || 'Failed to save user.');
    }
};

  const handleOpenDeleteConfirm = (user) => {
    setUserToDelete(user);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUserAdmin(userToDelete.id);
        setError('User deleted successfully!');
        fetchUsers(); 
        setTimeout(() => setError(''), 3000);
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError(err.response?.data?.message || 'Failed to delete user.');
      } finally {
        handleCloseDeleteConfirm();
      }
    }
  };

  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'address', label: 'Address', sortable: true, render: (row) => row.address || 'N/A' },
    { id: 'role', label: 'Role', sortable: true },
    {
        id: 'owned_stores_average_rating',
        label: 'Store Owner Rating',
        render: (row) => {
          if (row.role === 'Store Owner' && row.owned_stores_average_rating != null) {
            const rating = parseFloat(row.owned_stores_average_rating);
            if (!isNaN(rating)) {
                return rating.toFixed(2);
            }
        }
            return 'N/A';
        }
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="primary" size="small" onClick={() => handleOpenEditUser(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleOpenDeleteConfirm(row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Filter by Name"
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Filter by Email"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Filter by Address"
          name="address"
          value={filters.address}
          onChange={handleFilterChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 180 }}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            label="Filter by Role"
          >
            <MenuItem value=""><em>Any</em></MenuItem>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddUser}
          sx={{ ml: 'auto' }}
        >
          Add User
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          data={users}
          columns={columns}
          sort={sort}
          onSort={handleSort}
          totalRows={users.length} 
        />
      )}

      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent dividers>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={dialogFormData.name}
              onChange={handleDialogFormChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={dialogFormData.email}
              onChange={handleDialogFormChange}
              fullWidth
              required
            />
            <TextField
              label="Password (leave blank to keep current)"
              name="password"
              type="password"
              value={dialogFormData.password}
              onChange={handleDialogFormChange}
              fullWidth
              helperText={!currentUser ? "Required for new users" : "8-16 chars, 1 uppercase, 1 special"}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={dialogFormData.confirmPassword}
              onChange={handleDialogFormChange}
              fullWidth
            />
            <TextField
              label="Address"
              name="address"
              value={dialogFormData.address}
              onChange={handleDialogFormChange}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={dialogFormData.role}
                onChange={handleDialogFormChange}
                label="Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            {currentUser ? 'Update' : 'Add'} User
          </Button>
        </DialogActions>
      </Dialog>

      <AlertDialog
        open={openDeleteConfirm}
        handleClose={handleCloseDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        showCancel={true}
      />
    </Box>
  );
};

export default UserManagementPage;