import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  CalendarToday,
  Assignment,
  People,
  Business,
  Work,
  BarChart,
  Settings,
  Payment,
  Logout,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const drawerWidth = 280;

const menuItems = {
  employee: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Available Tasks', icon: <Event />, path: '/tasks' },
    { text: 'My Calendar', icon: <CalendarToday />, path: '/calendar' },
    { text: 'My Applications', icon: <Assignment />, path: '/applications' },
  ],
  admin: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tasks', icon: <Event />, path: '/tasks' },
    { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
    { text: 'Applications', icon: <Assignment />, path: '/applications' },
    { text: 'Employees', icon: <People />, path: '/employees' },
    { text: 'Branches', icon: <Business />, path: '/branches' },
    { text: 'Job Descriptions', icon: <Work />, path: '/job-descriptions' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ],
  superadmin: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tasks', icon: <Event />, path: '/tasks' },
    { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
    { text: 'Applications', icon: <Assignment />, path: '/applications' },
    { text: 'Employees', icon: <People />, path: '/employees' },
    { text: 'Branches', icon: <Business />, path: '/branches' },
    { text: 'Job Descriptions', icon: <Work />, path: '/job-descriptions' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
    { text: 'Billing', icon: <Payment />, path: '/billing' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ],
  master: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Organizations', icon: <Business />, path: '/organizations' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
    { text: 'Billing', icon: <Payment />, path: '/billing' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ],
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'employee':
        return menuItems.employee;
      case 'admin':
        return menuItems.admin;
      case 'superadmin':
        return menuItems.superadmin;
      case 'master':
        return menuItems.master;
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          TaskBridge
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton color="inherit" onClick={handleNotificationOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 },
            }}
          >
            {notifications.slice(0, 5).map((notification) => (
              <MenuItem
                key={notification._id}
                onClick={() => {
                  markAsRead(notification._id);
                  handleNotificationClose();
                }}
                sx={{
                  whiteSpace: 'normal',
                  backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                }}
              >
                <Box>
                  <Typography variant="subtitle2">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            {notifications.length === 0 && (
              <MenuItem disabled>No notifications</MenuItem>
            )}
            {notifications.length > 0 && (
              <Divider />
            )}
            {notifications.length > 0 && (
              <MenuItem onClick={() => { handleNavigation('/notifications'); handleNotificationClose(); }}>
                <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
                  View All
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;