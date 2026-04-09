import api from './api';

// 1. Ambil Data Admin
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. Update Account (Nama, Email, Phone, Address)
export const updateAdminProfile = async (payload) => {
  try {
    const response = await api.put('/admin/profile/update-account', payload);  
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. Update Profile Picture Admin
export const uploadAdminProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('picture', file); 

    const response = await api.post('/admin/profile/update-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 4. Update Password (BARU)
export const updateAdminPassword = async (payload) => {
  try {
    const response = await api.put('/admin/profile/update-password', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};