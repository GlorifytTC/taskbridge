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

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Simple test routes
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('========================================');
    console.log('🔐 Login attempt for:', email);
    console.log('Password received length:', password ? password.length : 0);
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('✅ User found in database');
    console.log('Stored password hash exists:', !!user.password);
    console.log('Stored hash length:', user.password ? user.password.length : 0);
    console.log('Stored hash preview:', user.password ? user.password.substring(0, 20) : 'N/A');
    
    // Compare password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isMatch);
    } catch (compareError) {
      console.error('❌ Bcrypt compare error:', compareError);
      return res.status(500).json({ success: false, message: 'Password verification error' });
    }
    
    if (!isMatch) {
      console.log('❌ Password does not match');
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
    console.log('========================================');
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Get current user
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health: https://taskbridge-production-9d91.up.railway.app/health`);
      console.log(`🔑 Login: https://taskbridge-production-9d91.up.railway.app/api/auth/login`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User');
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