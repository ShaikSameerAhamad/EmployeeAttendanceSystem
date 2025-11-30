import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'employee' | 'manager';
    department: string;
  }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Attendance API (Employee)
export const attendanceAPI = {
  checkIn: async () => {
    const response = await api.post('/attendance/checkin');
    return response.data.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data.data;
  },

  getMyHistory: async (month?: number, year?: number) => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/attendance/my-history', { params });
    return response.data.data;
  },

  getMySummary: async (month?: number, year?: number) => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/attendance/my-summary', { params });
    return response.data.data;
  },

  getToday: async () => {
    const response = await api.get('/attendance/today');
    return response.data.data;
  },
};

// Attendance API (Manager)
export const managerAttendanceAPI = {
  getAll: async (params?: {
    date?: string;
    status?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  },

  getEmployeeAttendance: async (id: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(`/attendance/employee/${id}`, { params });
    return response.data;
  },

  getTeamSummary: async (date?: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (date) params.date = date;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/attendance/summary', { params });
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today-status');
    return response.data;
  },

  exportAttendance: async (startDate: string, endDate: string, employeeId?: string) => {
    const params: any = { startDate, endDate };
    if (employeeId) params.employeeId = employeeId;
    const response = await api.get('/attendance/export', { params });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getEmployeeDashboard: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },

  getManagerDashboard: async () => {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },
};

export default api;

