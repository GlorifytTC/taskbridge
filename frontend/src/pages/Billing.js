import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Billing = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Billing & Subscription
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Billing management - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Billing;