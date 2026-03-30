import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome, {user?.name}!
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Your Information</Typography>
        <Typography>Email: {user?.email}</Typography>
        <Typography>Role: {user?.role}</Typography>
        <Button 
          variant="contained" 
          color="error" 
          onClick={logout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">TaskBridge is Working! 🎉</Typography>
        <Typography>Backend: Connected</Typography>
        <Typography>API: {process.env.REACT_APP_API_URL}</Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;