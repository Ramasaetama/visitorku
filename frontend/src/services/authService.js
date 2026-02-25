import api from './api'

/**
 * Auth Service
 * Handles all authentication-related API calls and token management.
 */

// ── Token Management ──

export const saveToken = (token) => {
    localStorage.setItem('auth_token', token)
}

export const getToken = () => {
    return localStorage.getItem('auth_token')
}

export const removeToken = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
}

export const isAuthenticated = () => {
    return !!getToken()
}

export const saveUser = (user) => {
    localStorage.setItem('auth_user', JSON.stringify(user))
}

export const getUser = () => {
    const user = localStorage.getItem('auth_user')
    return user ? JSON.parse(user) : null
}

// ── Auth API Calls ──

/**
 * POST /admin/register
 * Register a new admin account
 */
export const register = async (data) => {
    const response = await api.post('/admin/register', data)
    return response.data
}

/**
 * POST /admin/login
 * Login with email and password
 */
export const login = async (email, password) => {
    const response = await api.post('/admin/login', { email, password })
    return response.data
}

/**
 * POST /admin/reset-password
 * Request password reset
 */
export const resetPassword = async (email) => {
    const response = await api.post('/admin/reset-password', { email })
    return response.data
}

/**
 * POST /admin/verify-token
 * Verify the verification token (email verification)
 */
export const verifyToken = async (token) => {
    const response = await api.post('/admin/verify-token', { token })
    return response.data
}

/**
 * POST /admin/resend-verify-token
 * Resend verification token
 */
export const resendVerifyToken = async (email) => {
    const response = await api.post('/admin/resend-verify-token', { email })
    return response.data
}

/**
 * GET /admin/my-permission
 * Get current admin's permissions
 */
export const getMyPermission = async () => {
    const response = await api.get('/admin/my-permission')
    return response.data
}

/**
 * GET /admin/status-suspend
 * Get account suspension status
 */
export const getStatusSuspend = async () => {
    const response = await api.get('/admin/status-suspend')
    return response.data
}

/**
 * Logout — clear token and user data
 */
export const logout = () => {
    removeToken()
}

export default {
    register,
    login,
    logout,
    resetPassword,
    verifyToken,
    resendVerifyToken,
    getMyPermission,
    getStatusSuspend,
    saveToken,
    getToken,
    removeToken,
    isAuthenticated,
    saveUser,
    getUser,
}
