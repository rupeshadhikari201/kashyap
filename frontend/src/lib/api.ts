import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// an instance of axios with interceptors for handling auth tokens
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Request interceptor to add auth token 
api.interceptors.request.use((config) => {

    // 1. add Authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀  request url:', config.url);
    console.log('🔑  token found:', token);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
// What the interceptor does, When any request returns 401 it tries to refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or missing, clear storage and redirect to login (kick back to login)
        localStorage.removeItem('access_token'); 
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/api/user/register/', data),
  login: (data: any) => api.post('/api/user/login/', data),
  verifyEmail: (token: string) => api.get(`/api/user/verify-email/${token}/`),
  forgotPassword: (email: string) => api.post('/api/user/forgot-password/', { email }),
  resetPassword: ({uid, token, password, confirm_password} : {uid : string; token : string; password : string; confirm_password: string}) => api.post(`/api/user/reset-password/${uid}/${token}/`, {password, confirm_password}),
  logout: () => api.post('/api/user/logout/'),
  getCurrentUser: () => api.get('/api/user/me/'),
};

// Applicant API
export const applicantAPI = {

  // create applicant with multipart/form-data
  create: (data: FormData) => api.post('/applicants/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // fetch all applicants with optional query params
  getAll: (params?: any) => api.get('/applicants/', { params }),
  
  getById: (id: string) => api.get(`/applicants/${id}/`),
  update: (id: string, data: FormData) => api.put(`/applicants/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => api.delete(`/applicants/${id}/`),
  getAnalytics: () => api.get('/applicants/analytics/'),
};

// User API
export const userAPI = {
  updateProfile: (data: any) => api.put('/api/user/update-profile/', data),
  changePassword: (data: any) => api.post('/api/user/change-password/', data),
};

export default api;