import axiosInstance from './axiosInstance';

export const chatbotService = {

  /**
 * SERVICE KONEKSI BOT CAHT UNTUK TERHUBUNG KE CHATBOT
 */

  getCheckBot: async () => {
    try {
      const response = await axiosInstance.get('/api/bot/bot-cek');
      return response.data;
    } catch (error) {
      console(error);
      throw error.response?.data?.message || 'Gagal memuat konfigurasi chatbot.';
    }
  },

  disConectedBot: async (tenantId) => {
    try {
      const response = await axiosInstance.get('/api/bot/bot-disconnect', {
        params: { tenantId },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data?.message || 'Gagal memutuskan koneksi chatbot.';
    }
  },

  getQrCodeBot: async () => {
    try {
      const response = await axiosInstance.get('/api/bot/get-qr-code');
      return response.data;
    } catch (error) {
      console(error);
      throw error.response?.data?.message || 'Gagal memuat konfigurasi chatbot.';
    }
  },


  // get data configurasi pengaturan bot
  getConfigChatbots: async () => {
    try {
      const response = await axiosInstance.get('/api/bot/editor/get-config');
      return response.data;
    } catch (error) {
      console(error);
      throw error.response?.data?.message || 'Gagal memuat konfigurasi chatbot.';
    }
  },

  // Create pengatuiran dan update datanya 
  createConfigChatbots: async (configData) => {
    console.log(configData);
    try {
      const response = await axiosInstance.post('/api/bot/editor/save-config', configData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyimpan konfigurasi chatbot.';
    }
  },

  // yudfysoidyfuisyfsydifysd

  getChatbots: async (tenantId) => {
    try {
      const response = await axiosInstance.get(`/api/bot/chatbots/${tenantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal memuat konfigurasi chatbot.';
    }
  },

  // Simpan data keyword bot baru ke database PostgreSQL
  createChatbot: async (tenantId, botData) => {
    try {
      const response = await axiosInstance.post(`/api/bot/chatbots/${tenantId}`, botData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gagal menyimpan aturan chatbot baru.';
    }
  },


  getWhatsAppGroups: async (tenantId) => {
  const response = await axiosInstance.get(`/api/bot/wa/groups/${tenantId}`); 
  return response.data;
  },


};
