import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Stack
} from '@mui/material';
import API from '../api/axios';
import {
  Devices,
  CheckCircle,
  Error,
  Person,
  Add,
  History,
  PeopleAlt
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  // State variables for stats, recent assignments, and loading state
  const [stats, setStats] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || 'User';

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          API.get('/assets/stats'),
          API.get('/assignments/recent')
        ]);
        setStats(statsRes.data);
        setRecentAssignments(recentRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for the pie chart
  const chartData = stats ? [
    { name: 'Available', value: stats.available || 0, color: '#10b981' },
    { name: 'Assigned', value: stats.assigned || 0, color: '#2f55d4' },
    { name: 'Maintenance', value: stats.maintenance || 0, color: '#f59e0b' },
  ] : [
    { name: 'Available', value: 0, color: '#10b981' },
    { name: 'Assigned', value: 0, color: '#2f55d4' },
    { name: 'Maintenance', value: 0, color: '#f59e0b' },
  ];

  // Component for displaying individual statistic cards
  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: 'none' }}>
      <Box sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: `${color}.light`,
        color: `${color}.main`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <CardContent sx={{ flex: '1 0 auto', p: '0 16px !important' }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          {value || 0}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Main container with padding */}
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ textAlign: 'left' }}>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'left' }}>
            Here is your enterprise asset overview for today.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Row 1: Summary Cards (8) + Distribution Chart (4) */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StatCard title="Total Assets" value={stats?.total} icon={<Devices />} color="primary" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard title="Available" value={stats?.available} icon={<CheckCircle />} color="success" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard title="Assigned" value={stats?.assigned} icon={<Person />} color="info" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard title="Maintenance" value={stats?.maintenance} icon={<Error />} color="warning" />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: 'none' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                {chartData.map(item => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Row 2: Recent Assignments (8) + Quick Actions (4) */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Assignments
                </Typography>
                <Button size="small" onClick={() => navigate('/assets')}>View All</Button>
              </Box>
              <List sx={{ pt: 0 }}>
                {recentAssignments.length > 0 ? (
                  recentAssignments.map((assignment, index) => (
                    <React.Fragment key={assignment._id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}>
                            <Person fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={700}>
                              {assignment.employee?.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Received {assignment.asset?.assetTag} • {new Date(assignment.assignedDate).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentAssignments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No recent assignments found.
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: 'none' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Management tools.
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Add />} 
                  onClick={() => navigate('/assets')}
                  sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', justifyContent: 'flex-start' }}
                >
                  Add Asset
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<PeopleAlt />} 
                  onClick={() => navigate('/staff')}
                  sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', justifyContent: 'flex-start' }}
                >
                  Manage Staff
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<History />} 
                  onClick={() => navigate('/assets')}
                  sx={{ py: 1.5, borderRadius: 3, borderColor: 'divider', justifyContent: 'flex-start' }}
                >
                  Audit History
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;