import api from './api';

export const saveToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('auth_user')
}

export const saveUser = (user) => {
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export const getUser = () => {
  const user = localStorage.getItem('auth_user')
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
