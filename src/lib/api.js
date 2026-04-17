import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const getFilePreviewUrl = (fileUrl) => {
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
api.interceptors.response.use((response) => response, (error) => {
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
});
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    uploadProfileImage: (data) => api.put('/auth/profile/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};
export const studentAPI = {
    addInternship: (data) => api.post('/student/internships', data),
    getMyInternships: () => api.get('/student/internships'),
    getInternshipDetails: (id) => api.get(`/student/internships/${id}`),
    updateInternship: (id, data) => api.put(`/student/internships/${id}`, data),
    deleteInternship: (id) => api.delete(`/student/internships/${id}`),
    submitReport: (data) => api.post('/student/reports', data),
    getReportsByInternship: (internshipId) => api.get(`/student/reports/${internshipId}`),
    updateReport: (id, data) => api.put(`/student/reports/${id}`, data),
    deleteReport: (id) => api.delete(`/student/reports/${id}`),
    uploadFile: (data) => api.post('/student/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getFilesByInternship: (internshipId) => api.get(`/student/files/${internshipId}`),
    downloadFile: (id) => api.get(`/student/files/download/${id}`, { responseType: 'blob' }),
    deleteFile: (id) => api.delete(`/student/files/${id}`)
};
export const notificationAPI = {
    getMyNotifications: () => api.get('/notifications'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`)
};
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    addMentor: (data) => api.post('/admin/add-mentor', data),
    getAllMentors: () => api.get('/admin/mentors'),
    updateMentor: (mentorId, data) => api.put(`/admin/mentors/${mentorId}`, data),
    deleteMentor: (mentorId) => api.delete(`/admin/mentors/${mentorId}`),
    getAllStudents: () => api.get('/admin/students'),
    assignMentorToStudent: (studentId, mentorId) => api.put(`/admin/students/${studentId}/mentor`, { mentorId }),
    getStudentDetails: (studentId) => api.get(`/admin/students/${studentId}`),
    deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
    getAllInternships: () => api.get('/admin/internships'),
    updateInternshipStatus: (id, status) => api.put(`/admin/internships/${id}/status`, { status }),
    approveInternship: (id) => api.put(`/admin/internships/${id}/status`, { status: 'approved' }),
    rejectInternship: (id) => api.put(`/admin/internships/${id}/status`, { status: 'rejected' }),
    getAllReports: () => api.get('/admin/reports'),
    getReportsByInternshipAdmin: (internshipId) => api.get(`/admin/internships/${internshipId}/reports`),
    updateReportFeedback: (id, feedback) => api.put(`/admin/reports/${id}/feedback`, { feedback }),
    deleteReportFeedback: (id) => api.delete(`/admin/reports/${id}/feedback`),
    feedbackOnReport: (id, feedback) => api.put(`/admin/reports/${id}/feedback`, { feedback })
};
export const mentorAPI = {
    getAssignedStudents: () => api.get('/mentor/students'),
    getAssignedStudentDetails: (studentId) => api.get(`/mentor/students/${studentId}`),
    getAssignedStudentReports: () => api.get('/mentor/reports'),
    markReportReviewed: (reportId) => api.put(`/mentor/reports/${reportId}/review`),
    addReportFeedback: (reportId, feedback) => api.put(`/mentor/reports/${reportId}/feedback`, { feedback })
};
export const chatAPI = {
    getMessages: (studentId) => api.get('/chat/messages', {
        params: studentId ? { studentId } : undefined
    }),
    sendMessage: (message, studentId) => api.post('/chat/messages', {
        message,
        ...(studentId ? { studentId } : {})
    }),
    deleteMessage: (messageId, studentId) => api.delete(`/chat/messages/${messageId}`, {
        params: studentId ? { studentId } : undefined
    })
};
export default api;
