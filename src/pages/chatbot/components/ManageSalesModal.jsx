import React, { useState } from 'react';
import { userService } from '../../../api/userService';

export default function ManageSalesModal({ isOpen, onClose, salesList, onRefreshList }) {
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔒 AMBIL DATA TIPE PAKET DARI LOCALSTORAGE UNTUK VALIDASI SLOT VISUAL
  const savedUser = localStorage.getItem('saas_user');
  const loggedInUser = savedUser ? JSON.parse(savedUser) : null;
  const tenantType = loggedInUser?.tenantType || 'PERSONAL'; // Contoh: PERSONAL, BUSINESS, ENTERPRISE

  // Definisikan batas slot visual agar sinkron dengan file konfigurasi backend
  const maxSlots = tenantType === 'ENTERPRISE' ? '∞' : tenantType === 'BUSINESS' ? 10 : 2;
  const isSlotFull = tenantType !== 'ENTERPRISE' && salesList.length >= maxSlots;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSlotFull) {
      setError(`🚫 Gagal: Slot sales penuh untuk paket ${tenantType}. Silakan upgrade paket bisnis Anda.`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
      let finalizedPhone = cleanPhone;
      if (cleanPhone.startsWith('0')) {
        finalizedPhone = '62' + cleanPhone.slice(1);
      }

      if (finalizedPhone.length < 10 || finalizedPhone.length > 15) {
        setError('⚠️ Panjang nomor WhatsApp tidak valid (10-15 digit).');
        setLoading(false);
        return;
      }

      const response = await userService.addSalesByOwner({
        name: formData.name,
        phoneNumber: finalizedPhone
      });

      if (response?.success) {
        setFormData({ name: '', phoneNumber: '' });
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      setError(err?.toString() || 'Gagal menambahkan sales.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, fullSalesText) => {
    const salesName = fullSalesText.split(' (')[0];
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus "${salesName}" dari tim sales?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await userService.deleteSales(userId);
      if (response?.success) {
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      alert(err?.toString() || 'Gagal menghapus sales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-fade-in">

      <div 
        style={{ maxWidth: '680px', width: '100%' }} 
        className="relative bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col mx-auto text-left max-h-[85vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">✕</button>

        {/* Header Modal */}
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 text-base">👥</div>
            <div>
              <h3 className="text-base font-bold text-white m-0">Manajemen Tim Sales</h3>
              <p className="text-xs text-slate-400 m-0 mt-0.5">Kelola data agen untuk alokasi otomatis skema leads.</p>
            </div>
          </div>
          
          {/* 💎 BADGE INDIKATOR HAK AKSES PAKET SAAS */}
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Tipe Akun</span>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md font-bold text-xs uppercase shadow-sm shadow-cyan-500/5">
              🚀 {tenantType}
            </span>
          </div>
        </div>

        {/* FORM INPUT AGEN BARU */}
        <form onSubmit={handleSubmit} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 mb-6">
          <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider m-0 mb-1">➕ Daftarkan Agen Baru</h4>
          
          {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              disabled={isSlotFull}
              placeholder={isSlotFull ? "Kuota Penuh" : "Nama Lengkap Agen"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              required
              disabled={isSlotFull}
              placeholder={isSlotFull ? "Kuota Penuh" : "Nomor WhatsApp (Contoh: 628123...)"}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={loading || isSlotFull}
            className={`w-full h-10 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
              isSlotFull 
                ? 'bg-red-600/20 text-red-400 border border-red-500/30 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {isSlotFull ? '🚫 Slot Sales Sudah Maksimal' : loading ? '⏳ Memproses...' : '💾 Tambahkan ke Tim'}
          </button>
        </form>

        {/* TABEL ANGGOTA AKTIF */}
        <div className="flex flex-col flex-1 min-h-[200px]">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider m-0">📋 Anggota Aktif ({salesList.length})</h4>
            
            {/* 🌟 PROGRESS INDIKATOR SLOT PENGGUNAAN SALES */}
            <span className={`text-[11px] font-bold ${isSlotFull ? 'text-red-400' : 'text-slate-400'}`}>
              Penggunaan Slot: <span className="underline">{salesList.length}</span> / <span className="font-extrabold">{maxSlots}</span>
            </span>
          </div>
          
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/10">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">WhatsApp</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {salesList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500 italic">Belum ada agen sales terdaftar.</td>
                  </tr>
                ) : (
                  salesList.map((sales) => {
                    const matches = sales.name.match(/^(.+?)\s*\((.+?)\)$/);
                    const displayName = matches ? matches[1] : sales.name;
                    const displayPhone = matches ? matches[2] : '-';

                    return (
                      <tr key={sales.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-3 px-4 font-semibold text-white">{displayName}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{displayPhone}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(sales.id, sales.name)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm duration-150"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}


// import React, { useState } from 'react';
// import { userService } from '../../../api/userService';

// export default function ManageSalesModal({ isOpen, onClose, salesList, onRefreshList }) {
//   const [formData, setFormData] = useState({ name: '', phoneNumber: '' });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   if (!isOpen) return null;

//     const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       setError(null);

//       // 1. Sanitasi Awal: Ambil hanya karakter angka murni
//       let cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');

//       // 🌟 OTOMATISASI 1: Jika nomor diawali "08", ubah otomatis menjadi "628"
//       if (cleanPhone.startsWith('0')) {
//         cleanPhone = '62' + cleanPhone.slice(1);
//       }
      
//       // 🌟 OTOMATISASI 2: Jika Owner tidak sengaja mengetik kode negara ganda (misal 62628...)
//       if (cleanPhone.startsWith('6262')) {
//         cleanPhone = cleanPhone.slice(2);
//       }

//       // 🛡️ Validasi Keamanan Akhir: Cek batas panjang nomor telepon standar Indonesia
//       if (cleanPhone.length < 10 || cleanPhone.length > 15) {
//         setError('⚠️ Panjang nomor WhatsApp tidak valid (Minimal 10 digit dan Maksimal 15 digit termasuk kode 62).');
//         setLoading(false);
//         return;
//       }

//       // 3. Tembak API Simpan dengan nomor yang sudah dikonversi otomatis
//       const response = await userService.addSalesByOwner({
//         name: formData.name,
//         phoneNumber: cleanPhone
//       });

//       if (response?.success) {
//         alert(response.message || '🎉 Anggota sales baru berhasil didaftarkan!');
//         setFormData({ name: '', phoneNumber: '' }); // Reset Form
//         if (onRefreshList) onRefreshList(); // Auto-refresh daftar dropdown & tabel modal
//       }
//     } catch (err) {
//       setError(err?.toString() || 'Gagal menambahkan sales.');
//     } finally {
//       setLoading(false);
//     }
//   };


//   // 🌟 PERBAIKAN FUNGSI DELETE: Berjalan aman sesuai dengan data map dari server
//   const handleDelete = async (userId, fullSalesText) => {
//     // Memotong string nama murni sebelum tanda kurung untuk alert konfirmasi yang rapi
//     const salesName = fullSalesText.split(' (')[0];
    
//     const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus "${salesName}" dari tim sales?`);
//     if (!confirmDelete) return;

//     try {
//       setLoading(true);
//       const response = await userService.deleteSales(userId);
//       if (response?.success) {
//         if (onRefreshList) onRefreshList(); // Auto-refresh daftar dropdown & tabel modal seketika
//       }
//     } catch (err) {
//       alert(err?.toString() || 'Gagal menghapus sales.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      
//       {/* 🌟 PERBAIKAN UKURAN: Diperbesar menjadi max-w-2xl agar tabel memanjang proporsional */}
//       <div 
//         style={{ maxWidth: '680px', width: '100%' }} 
//         className="relative bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col mx-auto text-left max-h-[85vh] overflow-y-auto"
//       >
        
//         {/* Tombol Silang */}
//         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">✕</button>

//         {/* Header Modal */}
//         <div className="flex items-center gap-2.5 mb-5 border-b border-white/5 pb-3">
//           <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 text-base">👥</div>
//           <div>
//             <h3 className="text-base font-bold text-white m-0">Manajemen Tim Sales</h3>
//             <p className="text-xs text-slate-400 m-0 mt-0.5">Kelola data agen untuk alokasi otomatis skema leads.</p>
//           </div>
//         </div>

//         {/* FORM INPUT AGEN BARU */}
//         <form onSubmit={handleSubmit} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 mb-6">
//           <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider m-0 mb-1">➕ Daftarkan Agen Baru</h4>
          
//           {error && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <input
//               type="text"
//               required
//               placeholder="Nama Lengkap Agen"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className="w-full h-10 px-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
//             />
//             <input
//               type="text"
//               required
//               placeholder="Nomor WhatsApp (Contoh: 628123...)"
//               value={formData.phoneNumber}
//               onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
//               className="w-full h-10 px-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
//           >
//             {loading ? '⏳ Memproses...' : '💾 Tambahkan ke Tim'}
//           </button>
//         </form>

//         {/* TABEL ANGGOTA AKTIF */}
//         <div className="flex flex-col flex-1 min-h-[200px]">
//           <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider m-0 mb-3">📋 Anggota Aktif ({salesList.length})</h4>
          
//           <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/10">
//             <table className="w-full border-collapse text-[11px]">
//               <thead>
//                 <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
//                   <th className="py-3 px-4 text-left">Nama</th>
//                   <th className="py-3 px-4 text-left">WhatsApp</th>
//                   <th className="py-3 px-4 text-center">Aksi</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/5 text-slate-200">
//                 {salesList.length === 0 ? (
//                   <tr>
//                     <td colSpan="3" className="py-8 text-center text-slate-500 italic">Belum ada agen sales terdaftar.</td>
//                   </tr>
//                 ) : (
//                   salesList.map((sales) => {
//                     // Ambil nama asli (sebelum tanda kurung) dan nomor asli (di dalam tanda kurung)
//                     const matches = sales.name.match(/^(.+?)\s*\((.+?)\)$/);
//                     const displayName = matches ? matches[1] : sales.name;
//                     const displayPhone = matches ? matches[2] : '-';

//                     return (
//                       <tr key={sales.id} className="hover:bg-white/[0.01] transition-colors group">
//                         <td className="py-3 px-4 font-semibold text-white">{displayName}</td>
//                         <td className="py-3 px-4 font-mono text-slate-400">{displayPhone}</td>
//                         <td className="py-3 px-4 text-center">
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(sales.id, sales.name)}
//                             className="px-3 py-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm duration-150"
//                           >
//                             🗑️ Hapus
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
