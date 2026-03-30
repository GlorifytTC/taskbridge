import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Calendar = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Calendar
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Calendar view - Coming soon</Typography>
      </Paper>
    </Box>
  );
};

export default Calendar;