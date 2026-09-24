// utils/axiosInstance.js
import axios from 'axios';
import { getSessionItem, removeSessionItem } from '../utils/sessionEncode';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:3000/',
  baseURL: 'https://node-blog-app-seven.vercel.app/',
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = getSessionItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});


// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.error;
    // console.log("error code", errorCode)

    // Handle token expiry / invalid token
    if ( status === 401 &&
      (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN")) {
      console.warn("Session expired. Logging out...");

      // clear auth data
      removeSessionItem("token");
      removeSessionItem("isAuthenticated");
      sessionStorage.clear();

      // prevent infinite reload loop
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
