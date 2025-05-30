import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor to add the token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // We'll store the token in localStorage after login
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;