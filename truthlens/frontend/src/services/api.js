import axios from 'axios';

// Backend API Base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health check service to verify backend connectivity.
 * @returns {Promise<{status: string, service: string}>}
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return {
      connected: true,
      data: response.data,
      url: API_BASE_URL,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message || 'Unable to connect to backend',
      url: API_BASE_URL,
    };
  }
};

export default apiClient;
