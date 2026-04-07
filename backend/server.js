const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Import models
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

// ============ CORS ============
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ============ TEST ROUTES ============
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
    const users = await User.find({}, { email: 1, name: 1, role: 1 });
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ SUBSCRIPTION CHECK ============
const checkSubscriptions = async () => {
  const Subscription = require('./models/Subscription');
  const subscriptions = await Subscription.find({ status: 'active', autoRenew: true });
  
  for (const subscription of subscriptions) {
    await subscription.renewIfNeeded();
  }
  console.log('Subscription check completed');
};

setInterval(checkSubscriptions, 24 * 60 * 60 * 1000);

// ============ CONNECT TO MONGODB ============
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });