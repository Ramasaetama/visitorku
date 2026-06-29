import api from './api';

export const getAllBranches = async (params = {}) => {
    const response = await api.get('/admin/branch', { params })
    return response.data
}

export const getBranch = async (id) => {
    const response = await api.get(`/admin/branch/${id}`)
    return response.data
}

export const createBranch = async (data) => {
    const response = await api.post('/admin/branch', data)
    return response.data
}

export const updateBranch = async (id, data) => {
    const response = await api.put(`/admin/branch/${id}`, data)
    return response.data
}

export const deleteBranch = async (id) => {
    const response = await api.delete(`/admin/branch/${id}`)
    return response.data
}

export default {
    getAllBranches,
    getBranch,
    createBranch,
    updateBranch,
    deleteBranch,
}