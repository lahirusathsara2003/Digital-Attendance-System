import api from './api';

export const classroomService = {
  getClassrooms: async (includeSeats = false) => {
    const response = await api.get('/classrooms', { params: { include_seats: includeSeats } });
    return response.data;
  },

  getClassroom: async (id, includeSeats = true) => {
    const response = await api.get(`/classrooms/${id}`, { params: { include_seats: includeSeats } });
    return response.data;
  },

  createClassroom: async (data) => {
    const response = await api.post('/classrooms', data);
    return response.data;
  },

  updateClassroomLayout: async (id, data) => {
    const response = await api.put(`/classrooms/${id}`, data);
    return response.data;
  },

  deleteClassroom: async (id) => {
    const response = await api.delete(`/classrooms/${id}`);
    return response.data;
  },

  updateSeatStatus: async (seatId, status, seatNumber = null) => {
    const response = await api.put(`/seats/${seatId}`, { status, seat_number: seatNumber });
    return response.data;
  },

  batchUpdateSeats: async (seatIds, status) => {
    const response = await api.post('/seats/batch-status', { seat_ids: seatIds, status });
    return response.data;
  },
};
