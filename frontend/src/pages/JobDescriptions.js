import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const JobDescriptions = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Job Descriptions
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Job description management - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default JobDescriptions;