import api from './api'

export const getAllCategories = async (params = {}) => {
    const response = await api.get('/admin/category', { params })
    return response.data
}

export const getCategory = async (id) => {
    const response = await api.get(`/admin/category/${id}`)
    return response.data
}

export const createCategory = async (data) => {
    const response = await api.post('/admin/category', data)
    return response.data
}

export const updateCategory = async (id, data) => {
    const response = await api.put(`/admin/category/${id}`, data)
    return response.data
}

export const deleteCategory = async (id) => {
    const response = await api.delete(`/admin/category/${id}`)
    return response.data
}

export default {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
}