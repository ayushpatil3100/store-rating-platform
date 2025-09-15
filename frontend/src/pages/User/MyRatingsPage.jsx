import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Rating, Alert } from '@mui/material';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import * as storeService from '../../services/storeService';

const MyRatingsPage = () => {
  const { user } = useAuth();
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyRatings = async () => {
      setLoading(true);
      setError('');
      try {
        const allStores = await storeService.getAllStores();

        const ratedStores = allStores
          .filter(store => store.user_submitted_rating != null)
          .map(store => ({
            id: store.id, 
            store_name: store.name,
            store_address: store.address,
            rating: store.user_submitted_rating,
          }));

        setMyRatings(ratedStores || []);
      } catch (err) {
        console.error('Failed to fetch my ratings:', err);
        setError(err.response?.data?.message || 'Failed to fetch your ratings.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
        fetchMyRatings();
      }
    }, [user?.id]);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Ratings
      </Typography>

      {myRatings.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          You haven't submitted any ratings yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {myRatings.map((rating) => (
            <Grid item key={rating.id} xs={12} sm={6} md={4}>
              <Card raised>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {rating.store_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {rating.store_address}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" component="legend" mr={1}>Your Rating:</Typography>
                    <Rating value={rating.rating || 0} readOnly precision={1} />
                    <Typography variant="body1" ml={1}>({rating.rating})</Typography>
                  </Box>
                  </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyRatingsPage;