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

// import axiosInstance from './axiosInstance';

// /**
//  * Service untuk menangani komunikasi API Billing & Paket Langganan Per-Sales
//  */
// export const billingService = {
//   /**
//    * Mengambil harga satuan per sales, pilihan durasi paket, & info rekening
//    */
//   getPlans: async () => {
//     try {
//       const response = await axiosInstance.get('/api/billing/plans');
//       return response.data;
//     } catch (error) {
//       console.error("🚨 Gagal memuat paket billing:", error);
//       throw error.response?.data?.message || 'Gagal memuat data paket langganan.';
//     }
//   },

//   /**
//    * Membuat invoice pesanan baru di database sebelum konfirmasi WA / Midtrans
//    */
//   createCheckout: async (payload) => {
//     try {
//       const response = await axiosInstance.post('/api/billing/checkout', payload);
//       return response.data;
//     } catch (error) {
//       console.error("🚨 Gagal membuat invoice pembayaran:", error);
//       throw error.response?.data?.message || 'Gagal membuat invoice pembayaran.';
//     }
//   },

//   /**
//    * (Super Admin) Menyetujui pembayaran & mengaktifkan/memperpanjang paket tenant
//    */
//   approveTransaction: async (orderId) => {
//     try {
//       const response = await axiosInstance.post(`/api/billing/approve/${orderId}`);
//       return response.data;
//     } catch (error) {
//       console.error("🚨 Gagal menyetujui pembayaran:", error);
//       throw error.response?.data?.message || 'Gagal memproses persetujuan pembayaran.';
//     }
//   },
// };
