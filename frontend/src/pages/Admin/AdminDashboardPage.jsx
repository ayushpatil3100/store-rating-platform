import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import * as userService from '../../services/userService';
import * as storeService from '../../services/storeService';
import * as ratingService from '../../services/ratingService';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true);
        const response = await userService.getAdminDashboardMetrics();
        setMetrics(response);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3" color="primary">
                {metrics?.total_users || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Stores
              </Typography>
              <Typography variant="h3" color="primary">
                {metrics?.total_stores || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card raised>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Submitted Ratings
              </Typography>
              <Typography variant="h3" color="primary">
                {metrics?.total_submitted_ratings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;