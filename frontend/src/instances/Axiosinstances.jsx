// utils/axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:3000/',
  baseURL: 'https://node-blog-app-seven.vercel.app/',
  withCredentials: true, // needed for cookies
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('token');
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

    // Handle token expiry / invalid token
    if ( status === 401 &&
      (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN")) {
      console.warn("Session expired. Logging out...");

      // clear auth data
      Cookies.remove("token");
      localStorage.clear();

      // prevent infinite reload loop
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
