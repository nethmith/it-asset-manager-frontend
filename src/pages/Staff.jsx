import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import { Download as DownloadIcon, PersonAdd as PersonAddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import API from '../api/axios';

const Staff = () => {
  // State variables for users and loading state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userRole = localStorage.getItem('role');

  // Fetch users when the component mounts
  // Notification handlers
  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to export staff to CSV
  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status'];
    const rows = users.map(user => [
      user.name,
      user.email,
      user.role,
      user.department || 'N/A',
      'Active'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `staff_export_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', staffForm);
      fetchUsers();
      setAddOpen(false);
      setStaffForm({ name: '', email: '', password: '', role: 'IT Staff', department: '' });
      showNotification("Staff member added successfully!");
    } catch (err) {
      console.error('Error adding staff:', err);
      showNotification(err.response?.data?.message || 'Failed to add staff member.', 'error');
    }
  };
  const handleDelete = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      showNotification("User deleted successfully!");
      fetchUsers();
      setConfirmOpen(false);
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to delete user.", "error");
    }
  };

  const openDeleteConfirm = (id) => {
    setSelectedUserId(id);
    setConfirmOpen(true);
  };

  // Show loading
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* Page header with title and description */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Staff Directory</Typography>
          <Typography variant="body2" color="text.secondary">Manage and view all registered system users.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={downloadCSV}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Add New Staff
          </Button>
        </Box>
      </Box>

      {/* Table to display user information */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              {userRole === 'Admin' && <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === 'IT Manager' ? 'primary' : 'secondary'}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      bgcolor: (theme) => user.role === 'IT Manager' ? theme.palette.primary.light : '#f1f5f9',
                      color: (theme) => user.role === 'IT Manager' ? theme.palette.primary.dark : theme.palette.secondary.dark,
                      border: 'none'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{user.department || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      bgcolor: '#ecfdf5',
                      color: '#065f46',
                      border: 'none'
                    }}
                  />
                </TableCell>
                {userRole === 'Admin' && (
                  <TableCell align="right">
                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteConfirm(user._id)}
                        disabled={user.email === 'admin@kenora.lk'}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleAddSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Add New Staff Member
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField
                label="Full Name"
                required
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              />
              <TextField
                label="Email Address"
                type="email"
                required
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                required
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              />
              <TextField
                label="Department"
                required
                value={staffForm.department}
                onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={staffForm.role}
                  label="Role"
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="IT Manager">IT Manager</MenuItem>
                  <MenuItem value="IT Staff">IT Staff</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAddOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Add Member</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>Delete User?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be undone and will fail if the user still has assigned assets.
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(selectedUserId)}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Staff;
