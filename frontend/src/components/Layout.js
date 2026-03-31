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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

const menuItems = {
  master: [
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
  employee: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Available Tasks', icon: <Event />, path: '/tasks' },
    { text: 'My Calendar', icon: <CalendarToday />, path: '/calendar' },
    { text: 'My Applications', icon: <Assignment />, path: '/applications' },
  ],
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
      case 'master': return menuItems.master;
      case 'admin': return menuItems.admin;
      case 'employee': return menuItems.employee;
      default: return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00d1ff' }}>
          TaskBridge
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {getMenuItems().map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&:hover': { backgroundColor: 'rgba(0, 209, 255, 0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: '#00d1ff' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: 'white' }} />
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
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ bgcolor: '#00d1ff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, backgroundColor: '#111827' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, backgroundColor: '#111827', borderRight: '1px solid rgba(255,255,255,0.1)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;