import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment, IconButton,
  Rating, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import * as storeService from '../../services/storeService';
import * as ratingService from '../../services/ratingService';
import { useAuth } from '../../context/AuthContext';

const StoreListPage = () => {
    const { isNormalUser } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState({ name: '', address: '' }); 
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [sort, setSort] = useState({ field: 'name', order: 'asc' }); 

  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
        const fetchedStores = await storeService.getAllStores(debouncedSearchQuery, sort);
        setStores(fetchedStores || []);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setError(err.response?.data?.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
}, [debouncedSearchQuery, sort]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenRatingDialog = (store) => {
    if (!isNormalUser) {
        setError('Only Normal Users can submit ratings.');
        setTimeout(() => setError(''), 3000);
        return;
    }
    setSelectedStore(store);
    setCurrentRating(store.user_submitted_rating || 0);
    setRatingError('');
    setOpenRatingDialog(true);
  };

  const handleCloseRatingDialog = () => {
    setOpenRatingDialog(false);
    setSelectedStore(null);
    setCurrentRating(0);
  };

  const handleSubmitRating = async () => {
    setRatingError('');
    if (currentRating < 1 || currentRating > 5) {
      setRatingError('Rating must be between 1 and 5 stars.');
      return;
    }
    try {
      await ratingService.submitRating(selectedStore.id, currentRating);
      setError('Rating submitted successfully!'); 
      handleCloseRatingDialog();
      fetchStores();
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
    }
  };


  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        All Stores
      </Typography>

      {error && <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Search by Name"
          name="name"
          value={searchQuery.name}
          onChange={handleSearchChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Search by Address"
          name="address"
          value={searchQuery.address}
          onChange={handleSearchChange}
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 200 }}
        />
      </Box>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Grid container spacing={3}>
          {stores.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No stores found matching your criteria.
              </Typography>

            </Grid>
                      ) : (
                        stores.map((store) => (
                          <Grid item key={store.id} xs={12} sm={6} md={4} lg={3}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="div" gutterBottom>
                                  {store.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {store.address}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" component="legend" mr={1}>Overall Rating:</Typography>
                                  <Rating value={store.overall_rating || 0} readOnly precision={0.5} emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                                  <Typography variant="body2" ml={1}>({typeof store.overall_rating === 'number' ? store.overall_rating.toFixed(1) : 'N/A'})</Typography>
                                </Box>
                                {isNormalUser && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Typography variant="body2" component="legend" mr={1}>Your Rating:</Typography>
                                      <Rating
                                        value={store.user_submitted_rating || 0}
                                        readOnly
                                        precision={1}
                                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                      />
                                      <Typography variant="body2" ml={1}>({typeof store.user_submitted_rating === 'number' ? store.user_submitted_rating.toFixed(0) : 'N/A'})</Typography>
                                      </Box>
                                )}
                                {isNormalUser && (
                                  <Button variant="outlined" size="small" onClick={() => handleOpenRatingDialog(store)}>
                                    {store.user_submitted_rating ? 'Edit Your Rating' : 'Submit Rating'}
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))
                      )}
                    </Grid>
                  )}
            

      <Dialog open={openRatingDialog} onClose={handleCloseRatingDialog}>
        <DialogTitle>{selectedStore ? `Rate ${selectedStore.name}` : 'Submit Rating'}</DialogTitle>
        <DialogContent dividers>
          {ratingError && <Alert severity="error" sx={{ mb: 2 }}>{ratingError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              How would you rate this store?
            </Typography>
            <Rating
              name="store-rating"
              value={currentRating}
              onChange={(event, newValue) => {
                setCurrentRating(newValue);
              }}
              size="large"
              precision={1}
              sx={{ '& .MuiRating-iconEmpty': { color: 'rgba(0, 0, 0, 0.26)' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingDialog}>Cancel</Button>
          <Button onClick={handleSubmitRating} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreListPage;