import api from './api';

// Fungsi GET semua additional data
export const getAdditionalData = async () => {
    try {
        const response = await api.get('/admin/additional-data');
        return response;
    } catch (error) {
        throw error;
    }
};

// Fungsi PUT update additional data by ID
export const updateAdditionalData = async (id, payload) => {
    try {
        const response = await api.put(`/admin/additional-data/${id}`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};