import api from './api';

// Ambil semua signage
export const getAllSignages = (params = {}) => {
  return api.get('/admin/signage', { params });
};

// Ambil detail signage
export const getSignageById = (id) => {
  return api.get(`/admin/signage/${id}`);
};

// Buat signage baru
export const createSignage = (payload) => {
  return api.post('/admin/signage', payload);
};

// Update signage
export const updateSignage = (id, payload) => {
  return api.put(`/admin/signage/${id}`, payload);
};

// Hapus signage
export const deleteSignage = (id) => {
  return api.delete(`/admin/signage/${id}`);
};
