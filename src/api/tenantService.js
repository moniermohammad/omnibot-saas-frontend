import axiosInstance from './axiosInstance';

/**
 * Service terisolasi untuk mengelola Registrasi Bisnis / Tenant SaaS
 */
export const tenantService = {
  /**
   * Mengirim data pendaftaran tenant baru ke server Express + Prisma Transaction
   * @param {Object} tenantData - Objek berisi businessName, ownerName, ownerPhone, businessType
   */
  registerTenant: async (tenantData) => {
    try {
      // Menembak endpoint POST http://localhost:3000/api/auth/register
      const response = await axiosInstance.post('/api/auth/register', tenantData);
      return response.data; // Mengembalikan data hasil Prisma Transaction { tenant, owner }
    } catch (error) {
      // Menangkap pesan eror spesifik yang dilempar oleh service Prisma backend Anda
      throw error.response?.data?.message || '❌ Gagal mendaftarkan sistem bisnis baru.';
    }
  }
};
