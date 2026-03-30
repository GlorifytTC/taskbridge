import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Branches = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Branches
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Branch management - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Branches;