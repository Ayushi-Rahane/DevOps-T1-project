import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api', // Maps through gateway (Updated to 5005)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired, or DB was wiped. Auto logout.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;