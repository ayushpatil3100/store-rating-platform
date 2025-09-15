import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Alert } from '@mui/material';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import * as storeService from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOwnerDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await storeService.getStoreOwnerDashboard();
        setDashboardData(response);
      } catch (err) {
        console.error('Failed to fetch owner dashboard:', err);
        setError(err.response?.data?.message || 'Failed to load owner dashboard.');
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'Store Owner') {
      fetchOwnerDashboard();
    } else {
        setLoading(false);
  }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!dashboardData) {
      return (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">No dashboard data available for your stores.</Typography>
          </Box>
      );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Overall Average Rating
              </Typography>
              <Typography variant="h3" color="primary">
              {typeof dashboardData.overall_average_rating_of_owned_stores === 'number'
                  ? dashboardData.overall_average_rating_of_owned_stores.toFixed(2)
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Card raised sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your Stores & Average Ratings
              </Typography>
              <List dense>
              {dashboardData?.owner_stores?.length > 0 ? (
                  dashboardData.owner_stores.map((store) => (
                    <ListItem key={store.id}>
                      <ListItemText
                        primary={store.name}
                        secondary={`Address: ${store.address} | Avg Rating: ${typeof store.average_rating === 'number' ? store.average_rating.toFixed(2) : 'N/A'}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No stores owned yet.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Users Who Rated Your Stores
      </Typography>
      <Card raised>
        <CardContent>
          <List dense>
          {dashboardData?.users_who_rated?.length > 0 ? (
              dashboardData.users_who_rated.map((rating) => (
                <ListItem key={`${rating.user_id}-${rating.store_id}`}>
                  <ListItemText
                    primary={`${rating.user_name} (${rating.user_email})`}
                    secondary={`Rated "${rating.store_name}" with ${rating.rating} star${rating.rating !== 1 ? 's' : ''}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No users have rated your stores yet.</Typography>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OwnerDashboardPage;