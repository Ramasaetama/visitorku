import api from './api';

// Ambil semua data kunjungan
export const getAllVisits = (params = {}) => {
  return api.get('/admin/visit', { params });
};

// Ambil detail kunjungan berdasarkan ID
export const getVisitById = (id) => {
  return api.get(`/admin/visit/${id}`);
};

// Export laporan kunjungan (Report)
export const exportVisitReport = (params = {}) => {
  return api.get('/admin/visit/export', {
    params,
    responseType: 'blob',
  });
};
