import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Link, Paper, Avatar, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import AlertDialog from '../Common/AlertDialog';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccessMessage('');
    try {
        const loggedInUser = await login(email, password);
        if (loggedInUser.role === 'System Administrator') {
          navigate('/admin/dashboard');
        } else if (loggedInUser.role === 'Store Owner') {
            navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || String(err);
      setError(errorMessage);
  } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Login
      </Typography>
      {successMessage && <Alert severity="success" sx={{ my: 2, width: '100%' }}>{successMessage}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
          Login
        </Button>
        <Typography variant="body2" align="center">
          Don't have an account?{' '}
          <Link component="button" type="button" onClick={() => navigate('/signup')} underline="hover">
            Sign Up
          </Link>
        </Typography>
      </Box>
      <AlertDialog
        open={!!error}
        handleClose={() => setError('')}
        title="Login Failed"
        message={error}
        showCancel={false}
      />
    </Paper>
  );
};

export default LoginForm;