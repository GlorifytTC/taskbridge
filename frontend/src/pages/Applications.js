import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import moment from 'moment';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [tabValue]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let response;
      if (user.role === 'employee') {
        response = await api.get('/applications/my-applications');
      } else {
        if (tabValue === 0) {
          response = await api.get('/applications/pending');
        } else {
          response = await api.get('/applications');
        }
      }
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (taskId) => {
    try {
      await api.post('/applications/apply', { taskId });
      toast.success('Application submitted successfully');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  const handleApprove = async (appId) => {
    try {
      const response = await api.put(`/applications/${appId}/approve`);
      if (response.data.success) {
        toast.success('Application approved successfully!');
        // Refresh all data
        fetchApplications();
        // Also refresh tasks if needed
        window.dispatchEvent(new Event('applicationUpdated'));
      } else {
        toast.error(response.data.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/applications/${selectedApp._id}/reject`, { reason: rejectReason });
      toast.success('Application rejected');
      setOpenDialog(false);
      setRejectReason('');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Applications
      </Typography>

      {user.role !== 'employee' && (
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label="Pending Applications" />
          <Tab label="All Applications" />
        </Tabs>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {user.role !== 'employee' && <TableCell>Employee</TableCell>}
              <TableCell>Task</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              {user.role !== 'employee' && tabValue === 0 && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                {user.role !== 'employee' && (
                  <TableCell>{app.employee?.name || 'N/A'}</TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {app.task?.title}
                  </Typography>
                  {app.task?.description && (
                    <Typography variant="caption" color="textSecondary">
                      {app.task.description.substring(0, 50)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {app.task?.date ? moment(app.task.date).format('MMM DD, YYYY') : 'N/A'}
                </TableCell>
                <TableCell>
                  {app.task?.startTime && app.task?.endTime 
                    ? `${app.task.startTime} - ${app.task.endTime}`
                    : 'N/A'}
                </TableCell>
                <TableCell>{moment(app.appliedAt).format('MMM DD, YYYY HH:mm')}</TableCell>
                <TableCell>
                  <Chip
                    label={app.status.toUpperCase()}
                    color={getStatusColor(app.status)}
                    size="small"
                  />
                  {app.reviewNotes && app.status === 'rejected' && (
                    <Typography variant="caption" color="error" display="block">
                      Reason: {app.reviewNotes}
                    </Typography>
                  )}
                </TableCell>
                {user.role !== 'employee' && tabValue === 0 && app.status === 'pending' && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleApprove(app._id)}
                      title="Approve Application"
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedApp(app);
                        setOpenDialog(true);
                      }}
                      title="Reject Application"
                    >
                      <Cancel />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reject Application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;