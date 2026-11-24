import axios from 'axios';

// Gunakan base URL backend Express.js Anda, contoh: http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const deviceService = {
  // Fungsi untuk mengambil status terkoneksi perangkat dari Express.js + Baileys/WA-Web.js
  // getStatus: async (tenantId) => {
  //   try {
  //     const response = await axios.get(`${API_URL}/devices/status/${tenantId}`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('saas_token')}`
  //       }
  //     });
  //     return response.data; // Mengembalikan { connected: true/false, phoneNumber: "..." }
  //   } catch (error) {
  //     throw error.response?.data?.message || 'Gagal mengambil status perangkat.';
  //   }
  // }
};
