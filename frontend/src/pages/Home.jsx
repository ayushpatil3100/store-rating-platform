import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import Navbar from '../components/Nav/Navbar';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'System Administrator') return '/admin/dashboard';
    if (user.role === 'Store Owner') return '/owner/dashboard';
    if (user.role === 'Normal User') return '/stores';
    return '/';
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
          background: 'linear-gradient(45deg, #CFE8FC 30%, #F1F6F9 90%)',
        }}
      />
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'primary.dark', fontWeight: 700, letterSpacing: '-1px' }}>
        Welcome to the Store Rating Platform
        </Typography>
        <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 4, maxWidth: '700px', fontWeight: 300 }}>
          Discover, rate, and share your experiences. Find the best stores recommended by a community you trust.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to={getDashboardLink()}
              sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/signup"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/login"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Container>
      <Box component="footer" sx={{ p: 3, mt: 'auto', bgcolor: 'transparent', textAlign: 'center' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Rating Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;