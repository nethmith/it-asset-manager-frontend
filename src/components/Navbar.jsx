import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  // Get the navigate function 
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'User';

  // Handle logout 
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/*  Logo and title */}
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            AssetManager
          </Typography>

          {/* Navigation links and user info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={Link} to="/dashboard" color="inherit">Dashboard</Button>
            <Button component={Link} to="/assets" color="inherit">Assets</Button>
            <Typography variant="body2" sx={{ ml: 2, fontWeight: 'medium', color: 'text.secondary' }}>
              Hi, {userName}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleLogout}
              sx={{ borderRadius: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;