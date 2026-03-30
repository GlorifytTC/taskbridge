import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Applications = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Applications
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Applications management - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Applications;