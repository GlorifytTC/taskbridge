import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Employees = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Employees
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Employee management - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Employees;