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

// Upload file untuk signage
export const uploadSignageFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/admin/signage/upload-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 120 seconds for large file uploads
  });
};

// Ambil signage berdasarkan slug (public)
export const getSignageBySlug = (slug) => {
  return api.get(`/signage/${slug}`);
};
