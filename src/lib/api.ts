import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getFilePreviewUrl = (fileUrl: string) => {
  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${backendOrigin}${fileUrl}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Extract meaningful error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message ||
                        'An error occurred while processing your request';
    
    // Create a new error with better message
    const enhancedError = new Error(errorMessage);
    return Promise.reject(enhancedError);
  }
);

export const authAPI = {
  signup: (data: Record<string, unknown>) => api.post('/auth/signup', data),
  login: (data: Record<string, unknown>) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

export const studentAPI = {
  addInternship: (data: Record<string, unknown>) => api.post('/student/internships', data),
  getMyInternships: () => api.get('/student/internships'),
  getInternshipDetails: (id: string) => api.get(`/student/internships/${id}`),
  updateInternship: (id: string, data: Record<string, unknown>) => api.put(`/student/internships/${id}`, data),
  deleteInternship: (id: string) => api.delete(`/student/internships/${id}`),
  submitReport: (data: Record<string, unknown>) => api.post('/student/reports', data),
  getReportsByInternship: (internshipId: string) => api.get(`/student/reports/${internshipId}`),
  deleteReport: (id: string) => api.delete(`/student/reports/${id}`),
  uploadFile: (data: FormData) =>
    api.post('/student/files/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getFilesByInternship: (internshipId: string) => api.get(`/student/files/${internshipId}`),
  downloadFile: (id: string) => api.get(`/student/files/download/${id}`, { responseType: 'blob' }),
  deleteFile: (id: string) => api.delete(`/student/files/${id}`)
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getAllStudents: () => api.get('/admin/students'),
  getStudentDetails: (studentId: string) => api.get(`/admin/students/${studentId}`),
  getAllInternships: () => api.get('/admin/internships'),
  approveInternship: (id: string, feedback: string) =>
    api.post(`/admin/internships/${id}/approve`, { feedback }),
  rejectInternship: (id: string, feedback: string) =>
    api.post(`/admin/internships/${id}/reject`, { feedback }),
  getAllReports: () => api.get('/admin/reports'),
  getReportsByInternshipAdmin: (internshipId: string) =>
    api.get(`/admin/internships/${internshipId}/reports`),
  feedbackOnReport: (id: string, feedback: string) =>
    api.post(`/admin/reports/${id}/feedback`, { feedback })
};

export default api;
