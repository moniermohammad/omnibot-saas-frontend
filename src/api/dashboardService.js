// src/api/dashboardService.js
import axiosInstance from './axiosInstance';

export const dashboardService = {
  /**
   * Mengambil paket data ringkasan metrik dasbor terpusat dari server
   */
  getOverviewMetrics: async () => {
    try {
      const response = await axiosInstance.get('/api/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error("🚨 Gagal memuat data ringkasan dasbor:", error);
      throw error.response?.data?.message || '❌ Gagal memuat metrik dasbor.';
    }
  }
};
