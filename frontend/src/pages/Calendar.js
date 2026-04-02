import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, IconButton } from '@mui/material';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import { ArrowBack } from '@mui/icons-material';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const localizer = momentLocalizer(moment);

const Calendar = ({ onBack }) => {
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
        // Employee: only see their approved shifts
        const response = await api.get('/applications/my-applications');
        tasksData = response.data.data
          .filter(app => app.status === 'approved')
          .map(app => app.task);
      } else if (user.role === 'admin') {
        // Admin: only see tasks from their assigned branches
        const adminRes = await api.get('/auth/me');
        const assignedBranchIds = adminRes.data.user.assignedBranches?.map(b => b._id) || [];
        
        if (assignedBranchIds.length > 0) {
          const response = await api.get(`/tasks?branches=${assignedBranchIds.join(',')}`);
          tasksData = response.data.data;
        } else {
          tasksData = [];
        }
      } else {
        // Super Admin / Master: see all tasks
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
        branch: task.branch?.name,
        jobRole: task.jobDescription?.name,
        currentEmployees: task.currentEmployees,
        maxEmployees: task.maxEmployees
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
        fontSize: '11px',
        padding: '2px 4px',
      },
    };
  };

  // Custom event component to show more details
  const EventComponent = ({ event }) => {
    return (
      <div>
        <strong>{event.title}</strong>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          {event.location && `📍 ${event.location.substring(0, 15)}`}
        </div>
      </div>
    );
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        {onBack && (
          <IconButton onClick={onBack} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Shift Calendar
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', color: 'white' }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          tooltipAccessor={(event) => `${event.title}\nTime: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}\nLocation: ${event.location || 'Not specified'}\nStatus: ${event.status}\nEmployees: ${event.currentEmployees}/${event.maxEmployees}`}
          popup
        />
      </Paper>
    </Box>
  );
};

export default Calendar;