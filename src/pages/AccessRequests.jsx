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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon } from '@mui/icons-material';
import API from '../api/axios';

const AccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [role, setRole] = useState('IT Staff');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState(null);

  // Notification handlers
  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch access requests when the component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  // Function to fetch access requests from the API
  const fetchRequests = async () => {
    try {
      const response = await API.get('/users/requests');
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle opening the approval dialog
  const handleOpenApprove = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  // Function to handle closing the dialog and resetting state
  const handleClose = () => {
    setOpen(false);
    setSelectedRequest(null);
    setRole('IT Staff');
  };

  // Function to handle approving or rejecting a request
  const handleAction = async (requestId, action) => {
    try {
      if (action === 'Approve') {
        await API.post('/users/approve', { requestId, action, role });
        showNotification("Request approved successfully.");
      } else {
        await API.post('/users/approve', { requestId, action });
        showNotification("Request rejected.", "warning");
      }
      fetchRequests();
      handleClose();
      setConfirmOpen(false);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleOpenReject = (id) => {
    setPendingRejectId(id);
    setConfirmOpen(true);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* Page header with title and description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Access Requests</Typography>
        <Typography variant="body2" color="text.secondary">Review and approve employee account requests.</Typography>
      </Box>

      {/* Table to display access requests */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No pending requests found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => handleOpenApprove(request)}
                        sx={{ borderRadius: 2 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenReject(request._id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approve Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>Assign Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Approving access for <strong>{selectedRequest?.name}</strong>. Please assign a system role.
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>System Role</InputLabel>
            <Select
              value={role}
              label="System Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="IT Manager">IT Manager</MenuItem>
              <MenuItem value="IT Staff">IT Staff</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleAction(selectedRequest?._id, 'Approve')}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>Reject Access Request?</DialogTitle>
        <DialogContent>
          Are you sure you want to reject this request? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAction(pendingRejectId, 'Reject')}
          >
            Reject Request
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

export default AccessRequests;
