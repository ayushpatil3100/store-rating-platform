import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Grid, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import * as userService from '../../services/userService';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProfileForm = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await userService.updateMyProfile(updateData);
      refreshUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField label="Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address" name="address" value={formData.address || ''} onChange={handleChange} fullWidth multiline rows={3} />
          </Grid>
          <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Update Password</Typography></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth helperText="Leave blank to keep current password" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Confirm New Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading} sx={{ py: 1.5 }}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Grid>
        </Grid>
        </Box>
    </Paper>

  );
};

export default ProfileForm;
