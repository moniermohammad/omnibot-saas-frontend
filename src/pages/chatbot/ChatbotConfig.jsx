
import React, { useState, useEffect } from 'react';
import BotForm from './components/BotForm'; 
import WaConnectionStatus from './components/WaConnectionStatus';
import { chatbotService } from '../../api/chatbotService';

export default function ChatbotConfig() {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const savedUser = localStorage.getItem('saas_user');
  const userObj = savedUser ? JSON.parse(savedUser) : null;
  const tenantId = userObj?.tenantId || "MASTER_SYSTEM";

  const fetchChatbotData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await chatbotService.getConfigChatbots(tenantId);
      
      if (response && response.success) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setInitialData(response.data[0]);
        } else if (response.data && !Array.isArray(response.data)) {
          setInitialData(response.data);
        } else {
          setInitialData(null);
        }
      }
    } catch (err) {
      console.error("🚨 Gagal mengambil data konfigurasi chatbot:", err);
      setError(err?.toString() || 'Gagal memuat konfigurasi dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbotData();
  }, []);

  // ✅ Auto-hide toast notification setelah 4 detik
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#020617] text-[#f8fafc] font-sans">
      {/* ✅ FLOATING TOAST NOTIFICATION (Pojok Kanan Atas) */}
      {(error || success) && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
          {error && (
            <div className="flex items-start justify-between gap-3 bg-[#1e1b2e]/95 backdrop-blur-md text-red-300 px-4 py-3.5 rounded-xl border border-red-500/40 shadow-[0_10px_30px_rgba(239,68,68,0.25)] transition-all">
              <div className="flex items-center gap-2.5 text-sm font-medium">
                <span className="text-lg">🚨</span>
                <span>{error}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setError('')} 
                className="text-red-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-start justify-between gap-3 bg-[#0f2922]/95 backdrop-blur-md text-emerald-300 px-4 py-3.5 rounded-xl border border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-all">
              <div className="flex items-center gap-2.5 text-sm font-medium">
                <span className="text-lg">✅</span>
                <span>{success}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSuccess('')} 
                className="text-emerald-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. Sidebar Navigasi */}
      {/* <Sidebar /> */}

      {/* 2. Konten Utama */}
      <div className="flex-1 p-6 md:p-10 box-border w-full max-w-5xl mx-auto">
        
        {/* Header Modul */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent mt-0 mb-2">
            Konfigurasi Auto-Reply Chatbot ⚙️
          </h2>
          <p className="text-[#94a3b8] text-sm md:text-base m-0">
            Atur profil bisnis, subjek pelayanan, dan jalur target sales Anda secara instan.
          </p>
        </div>

        {/* Status Koneksi WhatsApp Terintegrasi */}
        {/* <WaConnectionStatus tenantId={tenantId} /> */}

        {/* 🗺️ PANDUAN UTAMA ADMIN */}
        <div className="mb-8 bg-[#0b1329] border border-white/5 rounded-xl p-5 shadow-xl">
          <h4 className="text-xs font-bold text-sky-400 tracking-wider uppercase mt-0 mb-3 flex items-center gap-1.5">
            💡 Cara Kerja Alur Chatbot & Routing Sales (Panduan Admin)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
            <div className="bg-[#111827]/60 p-3 rounded-lg border border-white/5 relative">
              <span className="absolute top-2 right-2 text-gray-600 font-bold">1</span>
              <p className="text-white font-semibold mb-1">Pesan Pembuka</p>
              Bot otomatis mengirimkan pesan profil perusahaan Anda saat customer menyapa pertama kali.
            </div>
            <div className="bg-[#111827]/60 p-3 rounded-lg border border-white/5 relative">
              <span className="absolute top-2 right-2 text-gray-600 font-bold">2</span>
              <p className="text-white font-semibold mb-1">Loop Wawancara AI</p>
              AI melayani interaksi secara bertahap untuk mengumpulkan data penting berdasarkan subjek pilihan customer.
            </div>
            <div className="bg-[#111827]/60 p-3 rounded-lg border border-white/5 relative">
              <span className="absolute top-2 right-2 text-gray-600 font-bold">3</span>
              <p className="text-white font-semibold mb-1">Pesan Penutup</p>
              Setelah data yang dicari terkumpul lengkap, AI otomatis menutup obrolan dengan teks penutup Anda.
            </div>
            <div className="bg-[#111827]/60 p-3 rounded-lg border border-sky-500/20 relative shadow-[0_0_15px_rgba(56,189,248,0.05)]">
              <span className="absolute top-2 right-2 text-sky-500 font-bold">4</span>
              <p className="text-sky-400 font-semibold mb-1">Sistem Routing</p>
              AI dimatikan untuk sesi tersebut, lalu data prospek dikirim otomatis ke sales via Direct/Round-Robin.
            </div>
          </div>
        </div>

        {/* Form Konfigurasi */}
        <div className="w-full bg-[#111827] border border-white/5 rounded-xl p-5 md:p-6 shadow-xl">
          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">⏳ Memuat konfigurasi bot dari database...</div>
          ) : (
            <BotForm 
              tenantId={tenantId} 
              initialData={initialData} 
              onError={setError} 
              onSuccess={setSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  );
}