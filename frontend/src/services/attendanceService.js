import api from './api';

export const attendanceService = {
  getSessions: async (params = {}) => {
    const response = await api.get('/attendance-sessions', { params });
    return response.data;
  },

  getSession: async (id) => {
    const response = await api.get(`/attendance-sessions/${id}`);
    return response.data;
  },

  createSession: async (data) => {
    const response = await api.post('/attendance-sessions', data);
    return response.data;
  },

  updateSession: async (sessionId, data) => {
    const response = await api.put(`/attendance-sessions/${sessionId}`, data);
    return response.data;
  },

  changeSessionStatus: async (sessionId, status) => {
    const response = await api.put(`/attendance-sessions/${sessionId}/status`, { status });
    return response.data;
  },

  regenerateCode: async (sessionId) => {
    const response = await api.post(`/attendance-sessions/${sessionId}/regenerate-code`);
    return response.data;
  },

  verifyCode: async (code, sessionId = null) => {
    const response = await api.post('/attendance-sessions/verify-code', {
      attendance_code: code,
      session_id: sessionId
    });
    return response.data;
  },

  getSessionSeatMap: async (sessionId) => {
    const response = await api.get(`/attendance-sessions/${sessionId}/seat-map`);
    return response.data;
  },

  reserveSeat: async (sessionId, seatId, confirmedStudentId, confirmedName) => {
    const response = await api.post('/seat-reservations', {
      session_id: sessionId,
      seat_id: seatId,
      confirmed_student_id: confirmedStudentId,
      confirmed_name: confirmedName
    });
    return response.data;
  },

  getAllAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  manualMarkAttendance: async (sessionId, studentId, status, seatId = null) => {
    const response = await api.post('/attendance/manual', {
      session_id: sessionId,
      student_id: studentId,
      status,
      seat_id: seatId
    });
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/attendance-sessions/${sessionId}`);
    return response.data;
  },
};
