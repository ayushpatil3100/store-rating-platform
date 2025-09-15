import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import Navbar from '../components/Nav/Navbar';

const NotFoundPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Navbar />
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
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', color: 'primary.main', fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'text.primary' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '400px' }}>
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/">
          Go to Homepage
        </Button>
      </Container>
      <Box component="footer" sx={{ p: 2, mt: 'auto', bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Rating Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFoundPage;