import api from './api';

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/students/history', { params });
    return response.data;
  },
};
