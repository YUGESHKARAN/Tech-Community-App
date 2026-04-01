// utils/axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:3000/',
  baseURL: 'https://node-blog-app-seven.vercel.app/',
  withCredentials: true, // needed for cookies
});

// ✅ Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Only set Content-Type for non-FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
