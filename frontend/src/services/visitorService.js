import api from './api';

// get visitor dengan parameter
export const getVisitor = (params) => {
  return api.get('/admin/visitor', { params }); 
};

// get visitor latest
export const getLatestVisitor = () => {
  return api.get('/admin/visitor/latest');
};

//catatan
export const updateVisitorNotes = (id, payload) => {
  return api.put(`/admin/visitor/notes/${id}`, payload); 
};

//detail
export const getVisitorDetail = (id) => {
  return api.get(`/admin/visitor/${id}`);
};