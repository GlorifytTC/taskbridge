import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import moment from 'moment';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [branches, setBranches] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branch: '',
    jobDescription: '',
    date: '',
    startTime: '',
    endTime: '',
    maxEmployees: 1,
    location: '',
  });

  useEffect(() => {
    fetchTasks();
    if (user.role !== 'employee') {
      fetchBranches();
      fetchJobDescriptions();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data.data);
    } catch (error) {
      console.error('Failed to fetch branches', error);
    }
  };

  const fetchJobDescriptions = async () => {
    try {
      const response = await api.get('/job-descriptions');
      setJobDescriptions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch job descriptions', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created successfully');
      }
      fetchTasks();
      handleCloseDialog();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      branch: '',
      jobDescription: '',
      date: '',
      startTime: '',
      endTime: '',
      maxEmployees: 1,
      location: '',
    });
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Tasks</Typography>
        {user.role !== 'employee' && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Create Task
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{moment(task.date).format('MMM DD, YYYY')}</TableCell>
                <TableCell>{task.startTime} - {task.endTime}</TableCell>
                <TableCell>{task.branch?.name}</TableCell>
                <TableCell>
                  <Chip label={task.status} color={task.status === 'open' ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => {
                    setEditingTask(task);
                    setFormData(task);
                    setOpenDialog(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(task._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" fullWidth value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <TextField label="Description" multiline rows={3} fullWidth value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <FormControl fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})}>
                {branches.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Job Description</InputLabel>
              <Select value={formData.jobDescription} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}>
                {jobDescriptions.map(jd => <MenuItem key={jd._id} value={jd._id}>{jd.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            <TextField label="Start Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
            <TextField label="End Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
            <TextField label="Max Employees" type="number" fullWidth value={formData.maxEmployees} onChange={(e) => setFormData({...formData, maxEmployees: parseInt(e.target.value)})} />
            <TextField label="Location" fullWidth value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;