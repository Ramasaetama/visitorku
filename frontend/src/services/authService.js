import api from './api';

export const saveToken = (token) => {
  sessionStorage.setItem('token', token)
}

export const getToken = () => {
  return sessionStorage.getItem('token')
}

export const removeToken = () => {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('auth_user')
}

export const saveUser = (user) => {
  sessionStorage.setItem('auth_user', JSON.stringify(user))
}

export const getUser = () => {
  const user = sessionStorage.getItem('auth_user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const loginUser = async (email, password) => {
  const response = await api.post('/admin/login', { email, password })
  return response.data
}

export const registerUser = async (regis) => {
  const response = await api.post('/admin/register', regis)
  return response.data
}

export const resetPassword = async (email) => {
  const response = await api.post('/admin/reset-password', { email })
  return response.data
}

export default {
  loginUser,
  registerUser,
  resetPassword,
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  isAuthenticated,
}