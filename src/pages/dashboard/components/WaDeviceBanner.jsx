import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WaDeviceBanner({ waStatus, phoneNumber }) {
  const navigate = useNavigate();
  const isConnected = waStatus === 'CONNECTED';

  return (
    <div className="bg-[#0f172a]/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 text-left">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          📱
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white m-0">Status Perangkat WhatsApp</h4>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
          </div>
          <p className="text-xs text-slate-400 m-0 mt-1">
            {isConnected
              ? `Terhubung aktif (${phoneNumber || 'Nomor Bot'}) • Siap merespons chat otomatis`
              : 'Perangkat terputus • Silakan hubungkan QR Code agar bot aktif'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/dashboard/wa-device')}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
      >
        ⚙️ Kelola Perangkat →
      </button>
    </div>
  );
}
