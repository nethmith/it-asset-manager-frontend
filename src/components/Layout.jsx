import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Stack,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  HowToReg as HowToRegIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

//Drawer Width
const drawerWidth = 240;

const Layout = () => {

  // Mobile Drawer State
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation and Location
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending requests count for Admin
  useEffect(() => {
    if (userRole === 'Admin') {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await API.get('/users/requests');
      setPendingCount(response.data.length);
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  };

  // User Data from Local Storage
  const userName = localStorage.getItem('name') || 'User';
  const userRole = localStorage.getItem('role') || 'Staff';

  // Mobile Drawer Toggle Handler
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Menu Items Data
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Asset Inventory', icon: <InventoryIcon />, path: '/assets' },
    { text: 'Staff', icon: <PeopleIcon />, path: '/staff' },
    ...(userRole === 'Admin' ? [{
      text: 'Access Requests',
      icon: <Badge badgeContent={pendingCount} color="error"><HowToRegIcon /></Badge>,
      path: '/requests'
    }] : [])
  ];

  // Drawer Content
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          IT Asset Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {/* Menu Items */}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
                '&:hover': {
                  bgcolor: 'primary.light',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  }
                }
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? 'white' : 'inherit',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 700 : 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    // Main Container
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 10px rgba(0,0,0,0.05)',
          border: 'none',
          borderBottom: 'none'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'IT Asset Manager'}
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: 'text.primary' }}>
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {userRole}
                </Typography>
              </Box>
              <Avatar sx={{
                width: 38,
                height: 38,
                bgcolor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {userName.charAt(0)}
              </Avatar>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: 1, display: { xs: 'none', md: 'block' } }} />
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                borderColor: 'divider'
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          px: 4,
          py: 3,
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          border: 'none',
          borderLeft: 0,
          borderRight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>

        {/* Footer Section */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2026 IT Asset Management System | Built for Kenora (Pvt) Ltd Technical Assessment
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
