import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for common error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Error]:', message);
    return Promise.reject(error);
  }
);

export default apiClient;
