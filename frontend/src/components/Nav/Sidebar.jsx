import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
    const { user, isAdmin, isStoreOwner, isNormalUser } = useAuth();
  const location = useLocation();

  let navItems = [];
  if (isAdmin) {
    navItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
      { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
      { text: 'Store Management', icon: <StorefrontIcon />, path: '/admin/stores' },
    ];
  } else if (isStoreOwner) {
    navItems = [
      { text: 'Owner Dashboard', icon: <DashboardIcon />, path: '/owner/dashboard' },
      { text: 'My Stores', icon: <StorefrontIcon />, path: '/stores' },
    ];
  } else if (isNormalUser) {
    navItems = [
      { text: 'All Stores', icon: <StorefrontIcon />, path: '/stores' },
      { text: 'My Ratings', icon: <StarIcon />, path: '/my-ratings' },
    ];
  }

  if (user) {
    navItems.push({ text: 'Profile', icon: <AccountCircleIcon />, path: isAdmin ? '/admin/profile' : '/profile' });
  }

  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Rating Platform
          </Link>
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    borderRight: `3px solid`,
                    borderColor: 'primary.main',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                },
                '& .MuiListItemIcon-root': { color: location.pathname === item.path ? 'primary.main' : 'inherit' }
            }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );


  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>

  );
};

export default Sidebar;