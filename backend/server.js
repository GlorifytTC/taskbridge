const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Import mongoose and models
const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');

// Import all routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const applicationRoutes = require('./routes/applications');
const organizationRoutes = require('./routes/organizations');
const branchRoutes = require('./routes/branches');
const jobDescriptionRoutes = require('./routes/jobDescriptions');
const subscriptionRoutes = require('./routes/subscriptions');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// ============ MOUNT ALL API ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============ SIMPLE TEST ROUTES ============
app.get('/', (req, res) => {
  res.json({ 
    name: 'TaskBridge API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, name: 1, role: 1, password: 1 });
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
        hasPassword: !!u.password,
        passwordLength: u.password ? u.password.length : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ AUTH ENDPOINTS (keep existing) ============
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('========================================');
    console.log('🔐 Login attempt for:', email);
    console.log('Password received:', password ? 'Yes (length: ' + password.length + ')' : 'No');
    
    // Check if User model is loaded
    const User = require('./models/User');
    console.log('User model loaded:', typeof User);
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('✅ User found:', user.email);
    console.log('User password field exists:', !!user.password);
    console.log('User password type:', typeof user.password);
    console.log('User password length:', user.password ? user.password.length : 0);
    
    // Check if password field is a string
    if (typeof user.password !== 'string') {
      console.log('❌ Password is not a string:', typeof user.password);
      return res.status(500).json({ success: false, message: 'Invalid password format' });
    }
    
    // Compare password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
    } catch (compareError) {
      console.error('❌ Bcrypt compare error details:', compareError);
      console.error('Error stack:', compareError.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'Password verification error',
        error: compareError.message 
      });
    }
    
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey123',
      { expiresIn: '30d' }
    );
    
    console.log('✅ Login successful!');
    console.log('========================================');
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    console.log('========================================');
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password').populate('organization');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ============ CONNECT TO MONGODB AND START SERVER ============
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health: https://taskbridge-production-9d91.up.railway.app/health`);
      console.log(`🔑 Login: https://taskbridge-production-9d91.up.railway.app/api/auth/login`);
      console.log(`🏢 Organizations: https://taskbridge-production-9d91.up.railway.app/api/organizations`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });