import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/administrators/dashboard');
    return response.data;
  },

  getUsers: async (role = '') => {
    const response = await api.get('/administrators/users', { params: { role } });
    return response.data;
  },

  toggleUserStatus: async (userId, status) => {
    const response = await api.put(`/administrators/users/${userId}/status`, { status });
    return response.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const response = await api.post(`/administrators/users/${userId}/reset-password`, { new_password: newPassword });
    return response.data;
  },

  // Student CRUD
  getStudents: async (search = '') => {
    const response = await api.get('/students', { params: { search } });
    return response.data;
  },

  createStudent: async (data) => {
    const response = await api.post('/students', data);
    return response.data;
  },

  updateStudent: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // Lecturer CRUD
  getLecturers: async (search = '') => {
    const response = await api.get('/lecturers', { params: { search } });
    return response.data;
  },

  createLecturer: async (data) => {
    const response = await api.post('/lecturers', data);
    return response.data;
  },

  updateLecturer: async (id, data) => {
    const response = await api.put(`/lecturers/${id}`, data);
    return response.data;
  },

  deleteLecturer: async (id) => {
    const response = await api.delete(`/lecturers/${id}`);
    return response.data;
  },

  // Subject CRUD
  getSubjects: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  createSubject: async (data) => {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};
