import axiosInstance from './axiosInstance';

export const userService = {
  /**
   * Mengirim data pendaftaran sales baru ke endpoint Express
   * @param {Object} salesData - Berisi objek { name, phoneNumber }
   */
  addSalesByOwner: async (salesData) => {
    try {
      // 🌟 SINKRONISASI: Diubah dari /api/user menjadi /api/users agar pas dengan rute Express
      const response = await axiosInstance.post('/api/users/sales', salesData);
      return response.data;
    } catch (error) {
      console.error("🚨 Gagal mendaftarkan sales baru:", error);
      throw error.response?.data?.message || '❌ Gagal mendaftarkan sales baru.';
    }
  },

  /**
   * Mengirim permintaan hapus agen sales ke server backend berdasarkan userId
   * @param {String} userId - ID unik dari PostgreSQL database
   */
  deleteSales: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/api/users/sales/${userId}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Error deleting sales:", error);
      throw error.response?.data?.message || '❌ Gagal menghapus agen sales.';
    }
  },

  getTenantSalesList: async (includeInactive = false) => {
    try {
      const response = await axiosInstance.get(
        `/api/users/sales/list${includeInactive ? '?includeInactive=true' : ''}`
      );
      return response.data;
    } catch (error) {
      console.error("🚨 Gagal memuat daftar tim sales:", error);
      throw error.response?.data?.message || '❌ Gagal memuat daftar tim sales.';
    }
  },

  toggleSalesStatus: async (userId) => {
    try {
      const response = await axiosInstance.patch(
        `/api/users/sales/${userId}/toggle-status`
      );
      return response.data;
    } catch (error) {
      console.error("🚨 Gagal mengubah status sales:", error);
      throw error.response?.data?.message || '❌ Gagal mengubah status agen sales.';
    }
  },

};
