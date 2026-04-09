import api from './api';

export const getAllInvoices = (params = {}) => {
  return api.get('/admin/invoice', { params });
};

export const getInvoiceById = (id) => {
  return api.get(`/admin/invoice/${id}`);
};

export const confirmInvoice = (payload) => {
  return api.post('/admin/invoice/confirm', payload);
};
