import axiosInstance from "./axiosInstance";

export const billingService = {
  getPlans: async () => {
    try {
      const response = await axiosInstance.get("/api/billing/plans");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Gagal memuat data paket langganan."
      );
    }
  },

  createCheckout: async (payload) => {
    try {
      const response = await axiosInstance.post(
        "/api/billing/checkout",
        payload,
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Gagal membuat invoice pembayaran."
      );
    }
  },

  getAllTransactions: async (adminKey) => {
    try {
      const response = await axiosInstance.get("/api/billing/transactions", {
        headers: { "x-admin-key": adminKey },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        "Kunci Super Admin salah atau gagal memuat transaksi."
      );
    }
  },

  approveTransaction: async (orderId, adminKey) => {
    try {
      const response = await axiosInstance.post(
        `/api/billing/approve/${orderId}`,
        {},
        { headers: { "x-admin-key": adminKey } },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Gagal menyetujui pembayaran.";
    }
  },

  rejectTransaction: async (orderId, adminKey, reason = "") => {
    try {
      const response = await axiosInstance.post(
        `/api/billing/reject/${orderId}`,
        { reason },
        { headers: { "x-admin-key": adminKey } },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Gagal menolak pembayaran.";
    }
  },

  // --- TAMBAHAN BARU: MASTER BOT OTP ---
  getMasterBotQr: async (adminKey) => {
    try {
      const response = await axiosInstance.get("/api/billing/master-bot/qr", {
        headers: { "x-admin-key": adminKey },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        "Gagal memuat status & QR Code Master Bot."
      );
    }
  },

  disconnectMasterBot: async (adminKey) => {
    try {
      const response = await axiosInstance.post(
        "/api/billing/master-bot/disconnect",
        {},
        { headers: { "x-admin-key": adminKey } },
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Gagal memutuskan sesi Master Bot."
      );
    }
  },
};
