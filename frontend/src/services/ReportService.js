import api from './api';

export const parseBlobError = async (err) => {
  try {
    const blob = err?.response?.data;
    if (blob instanceof Blob && blob.type.includes('application/json')) {
      const text = await blob.text();
      return JSON.parse(text);
    }
    // Jika sudah berupa objek biasa
    return err?.response?.data ?? null;
  } catch {
    return null;
  }
};

// Get all visitors (with pagination & search)
export const getAllVisitor = (params) => {
  return api.get('/admin/visitor', { params });
};

// Get latest visitor
export const getLatestVisitor = () => {
  return api.get('/admin/visitor/latest');
};

// Get single visitor detail
export const getVisitorById = (id) => {
  return api.get(`/admin/visitor/${id}`);
};

// Download Visitor Excel (bulk)
export const downloadVisitorExcel = (payload) => {
  return api.post('/admin/visitor/download/visitor-excel', payload);
};

// Download Visit Excel (bulk)
export const downloadVisitExcel = (payload) => {
  return api.post('/admin/visitor/download/visit-excel', payload);
};

// Download detail visitor excel by ID
export const downloadDetailVisitorExcel = (id) => {
  return api.get(`/admin/visitor/download/excel/${id}`, {
    responseType: 'blob',
  });
};

// Update notes for visitor
export const updateVisitorNotes = (id, payload) => {
  return api.put(`/admin/visitor/notes/${id}`, payload);
};
