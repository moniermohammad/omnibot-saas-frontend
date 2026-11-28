import axiosInstance from './axiosInstance';

/**
 * Service untuk menangani komunikasi API Autentikasi OTP
 */
export const authService = {
  requestToken: async (phoneNumber) => {
    try {
      const response = await axiosInstance.post('/api/auth/request-token', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal meminta kode verifikasi.';
    }
  },

  verifyToken: async (phoneNumber, tokenCode) => {
    try {
      const response = await axiosInstance.post('/api/auth/verify-token', { phoneNumber, tokenCode });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Verifikasi kode token gagal.';
    }
  },

  renewSubscription: async () => {
    try {
      const response = await axiosInstance.post('/api/auth/renew');
      return response.data;
    } catch (error) {
      console.error("🚨 Gagal memproses perpanjangan:", error);
      throw error.response?.data?.message || '❌ Gagal memperpanjang paket langganan.';
    }
  }
};
