import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Snackbar,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Login = () => {
  // State variables for email, password, and error message
  const [email, setEmail] = useState('admin@kenora.lk');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestData, setRequestData] = useState({ name: '', email: '', department: '', password: '' });
  const [requestSent, setRequestSent] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRequestPassword, setShowRequestPassword] = useState(false);
  const navigate = useNavigate();

  // Notification handlers
  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.post('/users/login', { email, password });
      const { token, role, name } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (requestData.password.length < 6) {
      showNotification("Password must be at least 6 characters long.", "error");
      return;
    }

    try {
      await API.post('/users/request', requestData);
      setRequestOpen(false);
      setRequestSent(true);
      setRequestData({ name: '', email: '', department: '', password: '' });
      showNotification("Request sent successfully!");
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to submit request.', 'error');
    }
  };

  return (
    <Container maxWidth="xs">
      {/* Centered box for the login form */}
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            Asset Manager
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Sign in to manage IT assets
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Login form with email and password fields */}
          <form onSubmit={handleLogin}>
            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <TextField
              label="Password"
              fullWidth
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showLoginPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowLoginPassword(!showLoginPassword)} edge="end">
                      {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 1, py: 1.5, fontWeight: 'bold' }}
            >
              Sign In
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                New employee?{' '}
                <Link 
                  component="button" 
                  type="button"
                  variant="body2" 
                  onClick={(e) => {
                    e.preventDefault();
                    setRequestOpen(true);
                  }}
                  sx={{ fontWeight: 'bold', textDecoration: 'none' }}
                >
                  Request Access
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>

        {/* Request Access Dialog */}
        <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} fullWidth maxWidth="xs">
          <form onSubmit={handleRequestSubmit}>
            <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Request System Access
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Enter your details to request an account from the IT Department.
              </Typography>
              <TextField
                label="Full Name"
                fullWidth
                required
                margin="normal"
                value={requestData.name}
                onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
              />
              <TextField
                label="Email Address"
                fullWidth
                required
                margin="normal"
                type="email"
                value={requestData.email}
                onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
              />
              <TextField
                label="Department"
                fullWidth
                required
                margin="normal"
                value={requestData.department}
                onChange={(e) => setRequestData({ ...requestData, department: e.target.value })}
              />
              <TextField
                label="Create Password"
                fullWidth
                required
                margin="normal"
                type={showRequestPassword ? 'text' : 'password'}
                value={requestData.password}
                onChange={(e) => setRequestData({ ...requestData, password: e.target.value })}
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowRequestPassword(!showRequestPassword)} edge="end">
                        {showRequestPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setRequestOpen(false)} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained">Submit Request</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Success Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Login;