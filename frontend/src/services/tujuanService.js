import api from './api';
// KUMPULAN API UNTUK TUJUAN KUNJUNGAN 
// Ambil semua Kategori (Tujuan)
export const getCategories = () => {
  return api.get('/admin/category');
};

// Ambil semua Cabang
export const getBranches = () => {
  return api.get('/admin/branch');
};

// Tambah Kategori baru
export const createCategory = (payload) => {
  return api.post('/admin/category', payload);
};

// Update Kategori (Edit)
export const updateCategory = (id, payload) => {
  return api.put(`/admin/category/${id}`, payload);
};

// Hapus Kategori
export const deleteCategory = (id) => {
  return api.delete(`/admin/category/${id}`);
};