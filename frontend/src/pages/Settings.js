import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>System settings - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Settings;