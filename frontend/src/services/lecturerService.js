import api from './api';

export const lecturerService = {
  getDashboard: async () => {
    const response = await api.get('/lecturers/dashboard');
    return response.data;
  },

  getMyClasses: async () => {
    const response = await api.get('/lecturers/my-classes');
    return response.data;
  },

  getSessionLiveView: async (sessionId) => {
    const response = await api.get(`/attendance-sessions/${sessionId}/live-view`);
    return response.data;
  },

  updateAttendance: async (attendanceId, status) => {
    const response = await api.put(`/attendance/${attendanceId}`, { status });
    return response.data;
  },
};
