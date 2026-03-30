import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Reports = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Reports
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Reports and analytics - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Reports;