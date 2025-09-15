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
import * as storeService from '../../services/storeService';
import * as userService from '../../services/userService';

const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [debouncedFilters, setDebouncedFilters] = useState(filters); 
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [storeOwners, setStoreOwners] = useState([]); 

  const [openStoreDialog, setOpenStoreDialog] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [dialogFormData, setDialogFormData] = useState({
    name: '',
    address: '',
    owner_id: '',
  });
  const [dialogError, setDialogError] = useState('');

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [filters]);


  const fetchStoresAndOwners = async () => {
    setLoading(true);
    setError('');
    try {
      const [fetchedStores, fetchedUsers] = await Promise.all([
        storeService.getAllStoresAdmin(debouncedFilters, sort),
        userService.getAllUsersAdmin({ role: 'Store Owner' }),
      ]);
      setStores(fetchedStores || []);
      setStoreOwners(fetchedUsers || []);
    } catch (err) {
      console.error('Failed to fetch stores or owners:', err);
      setError(err.response?.data?.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresAndOwners();
}, [debouncedFilters, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (field, order) => {
    setSort({ field, order });
  };

  const handleOpenAddStore = () => {
    setCurrentStore(null);
    setDialogFormData({
      name: '', address: '', owner_id: '',
    });
    setDialogError('');
    setOpenStoreDialog(true);
  };

  const handleOpenEditStore = (store) => {
    setCurrentStore(store);
    setDialogFormData({
      name: store.name,
      address: store.address,
      owner_id: store.owner_id || '', 
    });
    setDialogError('');
    setOpenStoreDialog(true);
  };

  const handleCloseStoreDialog = () => {
    setOpenStoreDialog(false);
  };

  const handleDialogFormChange = (e) => {
    const { name, value } = e.target;
    setDialogFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateDialogForm = () => {
    const errors = [];
    if (!dialogFormData.name || dialogFormData.name.length < 20 || dialogFormData.name.length > 60) {
      errors.push('Store name must be between 20 and 60 characters.');
    }
    if (!dialogFormData.address || dialogFormData.address.length > 400) {
      errors.push('Store address cannot exceed 400 characters.');
    }
    return errors;
  };

  const handleSaveStore = async () => {
    setDialogError('');
    const validationErrors = validateDialogForm();
    if (validationErrors.length > 0) {
      setDialogError(validationErrors.join('\n'));
      return;
    }

    try {
      const dataToSave = {
        name: dialogFormData.name,
        address: dialogFormData.address,
        owner_id: dialogFormData.owner_id === '' ? null : dialogFormData.owner_id,
      };

      if (currentStore) {
        await storeService.updateStoreAdmin(currentStore.id, dataToSave);
        setError('Store updated successfully!');
      } else {
        await storeService.addStoreAdmin(dataToSave);
        setError('Store added successfully!');
      }
      handleCloseStoreDialog();
      fetchStoresAndOwners();
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Failed to save store:', err);
      setDialogError(err.response?.data?.message || 'Failed to save store.');
    }
  };

  const handleOpenDeleteConfirm = (store) => {
    setStoreToDelete(store);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setStoreToDelete(null);
  };

  const handleDeleteStore = async () => {
    if (storeToDelete) {
      try {
        await storeService.deleteStoreAdmin(storeToDelete.id);
        setError('Store deleted successfully!');
        fetchStoresAndOwners();
        setTimeout(() => setError(''), 3000);
      } catch (err) {
        console.error('Failed to delete store:', err);
        setError(err.response?.data?.message || 'Failed to delete store.');
      } finally {
        handleCloseDeleteConfirm();
      }
    }
  };

  const columns = [
    { id: 'name', label: 'Store Name', sortable: true },
    { id: 'address', label: 'Address', sortable: true },
    {
      id: 'owner_id',
      label: 'Owner',
      render: (row) => storeOwners.find(owner => owner.id === row.owner_id)?.name || 'N/A'
    },
    {
        id: 'overall_rating', label: 'Overall Rating', sortable: true,
        render: (row) => {
          if (row.overall_rating != null) {
            const rating = parseFloat(row.overall_rating);
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
          <IconButton color="primary" size="small" onClick={() => handleOpenEditStore(row)}>
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
        Store Management
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
          label="Filter by Address"
          name="address"
          value={filters.address}
          onChange={handleFilterChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 180 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddStore}
          sx={{ ml: 'auto' }}
        >
          Add Store
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          data={stores}
          columns={columns}
          sort={sort}
          onSort={handleSort}
          totalRows={stores.length}
        />
      )}

      <Dialog open={openStoreDialog} onClose={handleCloseStoreDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentStore ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogContent dividers>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Store Name"
              name="name"
              value={dialogFormData.name}
              onChange={handleDialogFormChange}
              fullWidth
              required
            />
            <TextField
              label="Address"
              name="address"
              value={dialogFormData.address}
              onChange={handleDialogFormChange}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Store Owner (Optional)</InputLabel>
              <Select
                name="owner_id"
                value={dialogFormData.owner_id}
                onChange={handleDialogFormChange}
                label="Store Owner (Optional)"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {storeOwners.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>{owner.name} ({owner.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStoreDialog}>Cancel</Button>
          <Button onClick={handleSaveStore} variant="contained" color="primary">
            {currentStore ? 'Update' : 'Add'} Store
          </Button>
        </DialogActions>
      </Dialog>

      <AlertDialog
        open={openDeleteConfirm}
        handleClose={handleCloseDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete store "${storeToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteStore}
        showCancel={true}
      />
    </Box>
  );
};

export default StoreManagementPage;