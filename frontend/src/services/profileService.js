import api from './api';
// Fungsi Get Data Profil Perusahaan
export const getProfile = async () => {
  try {
    const response = await api.get('/admin/company');  
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi put Data Profil Perusahaan
export const updateProfile = async (id, payload) => {
  try {
    const response = await api.put(`/admin/company/${id}`, payload);  
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi Post Logo 
export const uploadCompanyLogo = async (file) => {
  try {
    const formData = new FormData();
    
    formData.append('picture', file); 

    const response = await api.post('/admin/company/update-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi Post Background 
export const uploadCompanyBackground = async (file) => {
  try {
    const formData = new FormData();
    
    formData.append('picture', file); 

    const response = await api.post('/admin/company/upload-background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

//Fungsi Put Language/Timezone
export const updateLanguageTimezone = async (companyId, payload) => {
  try {
    const response = await api.put(`/admin/company/${companyId}/update-language-timezone`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi Generate API Tokens
export const generateAPItoken = async (payload) => { 
  try {
    const response = await api.post('/admin/company/generate-api-key', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi GET API Token yang sudah ada
export const getCompanyApiKey = async () => {
  try {
    const response = await api.get('/admin/company/show-api-key');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi Delete API Token
export const deleteApiKey = async (apiKeyId) => {
  try {
    const response = await api.delete(`/admin/company/${apiKeyId}/delete-api-key`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mengambil data Admin
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Ganti URL-nya ditambah /update-account
export const updateAdminProfile = async (payload) => {
  try {
    // 👇 INI YANG BERUBAH 👇
    const response = await api.put('/admin/profile/update-account', payload);  
    return response.data;
  } catch (error) {
    throw error;
  }
};