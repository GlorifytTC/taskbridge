import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      let tasksData;
      if (user.role === 'employee') {
        const response = await api.get('/applications/my-applications');
        tasksData = response.data.data
          .filter(app => app.status === 'approved')
          .map(app => app.task);
      } else {
        const response = await api.get('/tasks');
        tasksData = response.data.data;
      }

      const formattedEvents = tasksData.map(task => ({
        id: task._id,
        title: task.title,
        start: new Date(`${moment(task.date).format('YYYY-MM-DD')}T${task.startTime}`),
        end: new Date(`${moment(task.date).format('YYYY-MM-DD')}T${task.endTime}`),
        allDay: false,
        status: task.status,
        location: task.location,
        description: task.description,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#4F46E5';
    if (event.status === 'filled') backgroundColor = '#F59E0B';
    if (event.status === 'completed') backgroundColor = '#10B981';
    if (event.status === 'cancelled') backgroundColor = '#EF4444';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Shift Calendar
      </Typography>
      
      <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          tooltipAccessor={(event) => `${event.title}\n${event.location ? `Location: ${event.location}` : ''}`}
        />
      </Paper>
    </Box>
  );
};

export default Calendar;