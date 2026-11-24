import React from 'react';
import { userService } from '../../../api/userService';

export default function BotTable({ salesList, onRefreshList, loadingList }) {
  
  // Fungsi penanganan hapus sales dengan konfirmasi
  const handleDeleteClick = async (userId, salesName) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus sales "${salesName}" dari tim?`);
    if (!confirmDelete) return;

    try {
      const response = await userService.deleteSales(userId);
      if (response?.success) {
        alert(response.message || '🎉 Anggota sales berhasil dihapus.');
        if (onRefreshList) onRefreshList(); // Muat ulang list dropdown & tabel otomatis
      }
    } catch (err) {
      alert(err?.toString() || 'Gagal menghapus sales.');
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/5 p-6 shadow-xl w-full text-left mt-6">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 text-xs">📋</div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider m-0">Manajemen Anggota Tim</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Total: {salesList.length} Agen</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 text-left pl-2">Nama Agen</th>
              <th className="pb-3 text-left">Nomor WhatsApp</th>
              <th className="pb-3 text-center">Hak Akses</th>
              <th className="pb-3浏览 text-center pr-2">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {loadingList ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-slate-500">
                  <div className="inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Memuat data tim...
                </td>
              </tr>
            ) : salesList.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500 italic">
                  Belum ada anggota sales yang didaftarkan.
                </td>
              </tr>
            ) : (
              salesList.map((sales) => (
                <tr key={sales.userId} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="py-3.5 font-medium text-white pl-2">{sales.name}</td>
                  <td className="py-3.5 font-mono text-slate-400">{sales.phoneNumber}</td>
                  <td className="py-3.5 text-center">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                      Sales
                    </span>
                  </td>
                  <td className="py-3.5 text-center pr-2">
                    {/* 🗑️ TOMBOL HAPUS (TONG SAMPAH NEON RED) */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(sales.userId, sales.name)}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm group-hover:scale-105 duration-200"
                      title="Hapus Sales"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
