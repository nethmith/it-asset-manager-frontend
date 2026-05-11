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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  History as HistoryIcon, 
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Build as BuildIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import API from '../api/axios';

const AssetList = () => {

  // State variables for assets, users, search, dialogs, forms, and filters
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    assetTag: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseCost: '',
    type: 'Laptop'
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState('');
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const userRole = localStorage.getItem('role');

  // Function to show notification
  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch assets and users on component mount
  useEffect(() => {
    fetchAssets();
    fetchUsers();
  }, []);

  // Function to fetch from backend API
  const fetchAssets = async () => {
    try {
      const response = await API.get('/assets');
      setAssets(response.data);
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Handlers for opening
  const handleOpenAssign = (asset) => {
    setSelectedAsset(asset);
    setOpen(true);
  };

  // Handler for closing assign dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedAsset(null);
    setSelectedEmployee('');
  };

  // Handler for viewing asset history
  const handleViewHistory = async (asset) => {
    setSelectedAsset(asset);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const response = await API.get(`/assignments/history/${asset._id}`);
      console.log("Backend History Data:", response.data);
      const data = response.data;
      if (data && Array.isArray(data) && data.length > 0) {
        setHistoryData(data);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handler for opening return dialog
  const handleOpenReturn = async (asset) => {
    setSelectedAsset(asset);
    setReturnOpen(true);
    try {
      const response = await API.get(`/assignments/history/${asset._id}`);
      const active = response.data.find(h => !h.returnDate);
      if (active) {
        setActiveAssignmentId(active._id);
      }
    } catch (err) {
      console.error('Error finding active assignment:', err);
    }
  };

  // Handler for closing return dialog
  const handleCloseReturn = () => {
    setReturnOpen(false);
    setSelectedAsset(null);
    setReturnCondition('Good');
    setActiveAssignmentId(null);
  };

  // Handler for submitting return form
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!activeAssignmentId) {
      showNotification("Active assignment not found.", "error");
      return;
    }
    try {
      await API.post('/assignments/return', {
        assignmentId: activeAssignmentId,
        conditionOnReturn: returnCondition
      });
      fetchAssets();
      handleCloseReturn();
      showNotification("Asset returned successfully!");
    } catch (err) {
      console.error('Error returning asset:', err);
      showNotification(err.response?.data?.message || "Error returning asset.", "error");
    }
  };

  // Handler for closing history dialog
  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
    setSelectedAsset(null);
    setHistoryData([]);
  };

  // Handler for submitting assign form
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const assetId = selectedAsset?._id;
    const employeeId = selectedEmployee;

    console.log("Submitting with:", { assetId, employeeId });

    try {
      await API.post(`/assets/assign`, { assetId, employeeId });
      fetchAssets();
      handleClose();
      showNotification("Asset assigned successfully!");
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      showNotification(err.response?.data?.message || "Assignment failed.", "error");
    }
  };

  // Handler for submitting add asset form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/assets/add', assetForm);
      fetchAssets();
      handleAddClose();
      showNotification("New asset added successfully!");
    } catch (err) {
      console.error('Error adding asset:', err);
      showNotification(err.response?.data?.message || "Failed to add asset.", "error");
    }
  };

  // Handler for maintenance toggle
  const handleToggleMaintenance = async (asset) => {
    const newStatus = asset.status === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      await API.patch(`/assets/${asset._id}/status`, { status: newStatus });
      fetchAssets();
      showNotification(`Asset status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Error updating asset status:', err);
      showNotification("Failed to update status.", "error");
    }
  };

  // Function to export table to CSV
  const downloadCSV = () => {
    const headers = ['Asset Tag', 'Brand', 'Model', 'Serial Number', 'Cost', 'Status', 'Assigned To'];
    const rows = filteredAssets.map(asset => [
      asset.assetTag,
      asset.brand,
      asset.model,
      asset.serialNumber,
      asset.purchaseCost,
      asset.status,
      asset.currentAssignedTo?.name || '-'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `assets_export_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for opening and closing add asset dialog
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setAssetForm({
      assetTag: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseCost: '',
      type: 'Laptop'
    });
  };

  // Filter assets based on search and type
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  // Determine if the user can modify assets based on their role
  const canModify = userRole !== 'IT Manager';

  // Function to get status color and label
  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return { color: 'success', label: 'Available' };
      case 'assigned': return { color: 'info', label: 'Assigned' };
      case 'maintenance': return { color: 'warning', label: 'In Maintenance' };
      default: return { color: 'default', label: status };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Asset Inventory</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Filter and search controls */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Laptop">Laptops</MenuItem>
                <MenuItem value="Mobile">Mobiles</MenuItem>
                <MenuItem value="Monitor">Monitors</MenuItem>
                <MenuItem value="Other">Others</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search by Tag or Serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: 1, width: 400 }}
            />
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={downloadCSV}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              Export CSV
            </Button>
            {canModify && (
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<span>+</span>}
                onClick={handleAddOpen}
                sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
              >
                Add New Asset
              </Button>
            )}
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              {/* Table headers with bold styling */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Asset Tag</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Brand/Model</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cost</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset._id} hover>
                  {/* Asset tag with monospace font and primary color */}
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                    {asset.assetTag}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{asset.brand} {asset.model}</TableCell>
                  <TableCell>{asset.serialNumber}</TableCell>
                  <TableCell>${asset.purchaseCost?.toLocaleString()}</TableCell>
                  <TableCell>
                    {(() => {
                      const statusInfo = getStatusInfo(asset.status);
                      return (
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            bgcolor: (theme) => theme.palette[statusInfo.color].light,
                            color: (theme) => theme.palette[statusInfo.color].dark,
                            border: 'none'
                          }}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{asset.currentAssignedTo?.name || '-'}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="View History">
                        <IconButton size="small" onClick={() => handleViewHistory(asset)}>
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canModify && (
                        <>
                          {asset.status.toLowerCase() === 'assigned' ? (
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              onClick={() => handleOpenReturn(asset)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Return
                            </Button>
                          ) : asset.status.toLowerCase() === 'maintenance' ? (
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => handleToggleMaintenance(asset)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Repair Completed
                            </Button>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenAssign(asset)}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                              >
                                Assign
                              </Button>
                              <Tooltip title="Mark Maintenance">
                                <IconButton 
                                  size="small" 
                                  color="warning" 
                                  onClick={() => handleToggleMaintenance(asset)}
                                  sx={{ bgcolor: 'warning.light', '&:hover': { bgcolor: 'warning.main', color: 'white' } }}
                                >
                                  <BuildIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Assign Asset Dialog */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
          <form onSubmit={handleAssignSubmit}>
            <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Assign Asset
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Assigning: <strong>{selectedAsset?.assetTag}</strong> - {selectedAsset?.brand} {selectedAsset?.model}
              </Typography>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedEmployee}
                  label="Select User"
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  {users.map(user => (
                    <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClose} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" disabled={!selectedEmployee}>
                Submit
              </Button>
            </DialogActions>
          </form>
        </Dialog>


        <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
          <form onSubmit={handleAddSubmit}>
            <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Add New Asset
            </DialogTitle>
            <DialogContent>
              {/* Asset form fields arranged in a grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                <TextField
                  label="Asset Tag"
                  required
                  value={assetForm.assetTag}
                  onChange={(e) => setAssetForm({ ...assetForm, assetTag: e.target.value })}
                />
                <TextField
                  label="Serial Number"
                  required
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                />
                <TextField
                  label="Brand"
                  required
                  value={assetForm.brand}
                  onChange={(e) => setAssetForm({ ...assetForm, brand: e.target.value })}
                />
                <TextField
                  label="Model"
                  required
                  value={assetForm.model}
                  onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })}
                />
                <TextField
                  label="Purchase Cost"
                  type="number"
                  required
                  value={assetForm.purchaseCost}
                  onChange={(e) => setAssetForm({ ...assetForm, purchaseCost: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={assetForm.type}
                    label="Type"
                    onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}
                  >
                    <MenuItem value="Laptop">Laptop</MenuItem>
                    <MenuItem value="Mobile">Mobile</MenuItem>
                    <MenuItem value="Monitor">Monitor</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleAddClose} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained">
                Add Asset
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* History Modal */}
        <Dialog open={isHistoryOpen} onClose={handleCloseHistory} fullWidth maxWidth="md">
          <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Asset Assignment History - {selectedAsset?.assetTag}
          </DialogTitle>
          <DialogContent dividers>
            {historyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : historyData.length === 0 ? (
              <Typography sx={{ p: 4, textAlign: 'center', color: 'text.primary' }}>
                No assignment history available for this asset.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Assigned By</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Assigned Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Returned Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.map((history) => (
                      <TableRow key={history._id}>
                        <TableCell>{history.employee?.name || 'N/A'}</TableCell>
                        <TableCell>{history.assignedBy?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(history.assignedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {history.returnDate
                            ? new Date(history.returnDate).toLocaleDateString()
                            : <Chip label="Currently Assigned" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem' }} />}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={history.returnDate ? 'Returned' : 'Active'}
                            size="small"
                            color={history.returnDate ? 'default' : 'success'}
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHistory}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Return Asset Dialog */}
        <Dialog open={returnOpen} onClose={handleCloseReturn} fullWidth maxWidth="xs">
          <form onSubmit={handleReturnSubmit}>
            <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Return Asset
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Confirm return for: <strong>{selectedAsset?.assetTag}</strong>
              </Typography>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Condition of the device</InputLabel>
                <Select
                  value={returnCondition}
                  label="Condition of the device"
                  onChange={(e) => setReturnCondition(e.target.value)}
                  required
                >
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Damaged">Damaged</MenuItem>
                  <MenuItem value="Lost">Lost</MenuItem>
                  <MenuItem value="Maintenance Required">Maintenance Required</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseReturn} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" color="warning" disabled={!returnCondition}>
                Confirm Return
              </Button>
            </DialogActions>
          </form>
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
    </Box>
  );
};

export default AssetList;
