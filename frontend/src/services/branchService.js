import api from './api'

/**
 * Branch Service
 * Handles all branch-related API calls.
 * Endpoints: /admin/branch
 */

/**
 * GET /admin/branch
 * Get all branches with optional pagination, search, and sorting
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.size=10] - Items per page
 * @param {string} [params.search] - Search keyword
 * @param {string} [params.orderBy] - Column to order by (e.g. 'name')
 * @param {string} [params.sortBy] - Sort direction ('asc' or 'desc')
 */
export const getAllBranches = async (params = {}) => {
    const response = await api.get('/admin/branch', { params })
    return response.data
}

/**
 * GET /admin/branch/{id}
 * Get a single branch by ID
 */
export const getBranch = async (id) => {
    const response = await api.get(`/admin/branch/${id}`)
    return response.data
}

/**
 * POST /admin/branch
 * Create a new branch
 * @param {Object} data - { name: string, address: string, contact: string }
 */
export const createBranch = async (data) => {
    const response = await api.post('/admin/branch', data)
    return response.data
}

/**
 * PUT /admin/branch/{id}
 * Update an existing branch
 * @param {number} id - Branch ID
 * @param {Object} data - { name: string, address: string, contact: string }
 */
export const updateBranch = async (id, data) => {
    const response = await api.put(`/admin/branch/${id}`, data)
    return response.data
}

/**
 * DELETE /admin/branch/{id}
 * Delete a branch
 */
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