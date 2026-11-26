import api from './api';

export const reportService = {
  getReportJson: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  exportExcel: async (params = {}) => {
    const response = await api.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportPdf: async (params = {}) => {
    const response = await api.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
