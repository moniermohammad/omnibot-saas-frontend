import axiosInstance from './axiosInstance';

export const leadService = {
  getAllLeads: async () => {
    try {
      const response = await axiosInstance.get('/api/leads');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal memuat database prospek CRM.';
    }
  },
};
