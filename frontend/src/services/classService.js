import api from './api';

export const classService = {
  getClasses: async (params = {}) => {
    const response = await api.get('/classes', { params });
    return response.data;
  },

  getClass: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  createClass: async (data) => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  updateClass: async (id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  getClassStudents: async (classId) => {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },

  enrollStudent: async (classId, studentId) => {
    const response = await api.post(`/classes/${classId}/enroll`, { student_id: studentId });
    return response.data;
  },

  unenrollStudent: async (classId, studentId) => {
    const response = await api.delete(`/classes/${classId}/enroll/${studentId}`);
    return response.data;
  },
};
