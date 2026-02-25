import api from './api';

// KUMPULAN API UNTUK PROFILE PERUSAHAAN
//Fungsi Login
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/admin/login', {
      email: email,
      password: password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//Fungsi Register
export const registerUser = async (regis) => {
  try {
    const response = await api.post('/admin/register', regis);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token'); 
  
  return !!token; 
};