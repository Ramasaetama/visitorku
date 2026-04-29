import api from './api'

/**
 * Category Service
 * Handles all category-related API calls.
 * Endpoints: /admin/category
 */

/**
 * GET /admin/category
 * Get all categories with optional pagination, search, and sorting
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.size=10] - Items per page
 * @param {string} [params.search] - Search keyword
 * @param {string} [params.orderBy] - Column to order by (e.g. 'name')
 * @param {string} [params.sortBy] - Sort direction ('asc' or 'desc')
 */
export const getAllCategories = async (params = {}) => {
    const response = await api.get('/admin/category', { params })
    return response.data
}

/**
 * GET /admin/category/{id}
 * Get a single category by ID
 */
export const getCategory = async (id) => {
    const response = await api.get(`/admin/category/${id}`)
    return response.data
}

/**
 * POST /admin/category
 * Create a new category
 * @param {Object} data - { name: string, description: string, icon: string }
 */
export const createCategory = async (data) => {
    const response = await api.post('/admin/category', data)
    return response.data
}

/**
 * PUT /admin/category/{id}
 * Update an existing category
 * @param {number} id - Category ID
 * @param {Object} data - { name: string, description: string, icon: string }
 */
export const updateCategory = async (id, data) => {
    const response = await api.put(`/admin/category/${id}`, data)
    return response.data
}

/**
 * DELETE /admin/category/{id}
 * Delete a category
 */
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