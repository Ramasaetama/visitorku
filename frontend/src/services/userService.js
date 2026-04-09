import api from './api';

export const getAllUsers = (params) => {
  return api.get('/admin/user', { params });
};

export const createUser = (data) => {
  return api.post('/admin/user', data);
};

export const updateUser = (id, data) => {
  return api.put(`/admin/user/${id}`, data);
};

export const deleteUser = (id) => {
  return api.delete(`/admin/user/${id}`);
};

export const updateUserPermission = (id, data) => {
  return api.put(`/admin/user/permission`, data); 
};