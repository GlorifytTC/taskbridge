const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
  try {
    // Test health endpoint
    const health = await axios.get('http://localhost:5000/health');
    console.log('Health check:', health.data);
    
    // Test login
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@school.com',
      password: 'Admin@123'
    });
    
    console.log('Login successful:', login.data.user.email);
    const token = login.data.token;
    
    // Test get current user
    const me = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Current user:', me.data.user.name);
    
    // Test dashboard stats
    const stats = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dashboard stats:', stats.data);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testAPI();