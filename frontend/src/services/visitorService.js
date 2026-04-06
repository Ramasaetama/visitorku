import api from './api';

//get visitor saja
export const getVisitor = () => {
  return api.get('/admin/visitor');
};

//get visitor latest
export const getLatestVisitor = () => {
  return api.get('/admin/visitor/latest');
};

//catatan
export const updateCatatan = async (id, data) => {
    const response = await api.put(`/admin/visitor/notes${id}`, data)
    return response.data
}