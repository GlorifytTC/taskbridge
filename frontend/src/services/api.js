import axios from 'axios';

// Get the API URL based on environment
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://taskbridge-api.onrender.com';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something else happened
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;