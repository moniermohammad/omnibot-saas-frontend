import React from 'react';

export default function SubjekItem({
  subject,
  index,
  salesList,
  templates,
  onApplyTemplate,
  onUpdate,
  onRemove,
  onToggle,
}) {
  return (
    <div className="bg-gray-900/40 border border-white/5 rounded-xl shadow-md overflow-hidden transition-all duration-200">
      
      {/* HEADER BARIS ACCORDION (Bisa di-klik untuk buka/tutup) */}
      <div 
        onClick={() => onToggle(subject.id)}
        className="p-4 bg-gray-800/40 hover:bg-gray-800/80 cursor-pointer flex justify-between items-center border-b border-white/5 select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 font-mono">#{index + 1}</span>
          <span className="text-sm font-bold text-white">
            {subject.name ? subject.name : <span className="text-gray-500 italic font-normal">Nama Subjek belum diisi...</span>}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => onRemove(subject.id, e)}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Hapus Opsi
          </button>
          <span className={`text-xs text-purple-400 transition-transform duration-200 ${subject.isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* ISI FORM INTERNAL SUBJEK (Hanya muncul jika terbuka) */}
      {subject.isExpanded && (
        <div className="p-4 space-y-4 bg-transparent" onClick={(e) => e.stopPropagation()}>
          
          {/* ✅ BAR TOMBOL TEMPLATE SIAP PAKAI (1-KLIK ISI OTOMATIS) */}
          {templates && templates.length > 0 && (
            <div className="bg-[#0b1329] border border-sky-500/20 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-bold text-sky-400 block">
                ✨ Template Siap Pakai (Klik untuk mengisi otomatis):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => onApplyTemplate(subject.id, tpl)}
                    className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/25 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 m-0">
                💡 Pisahkan setiap data yang ingin ditanyakan dengan tanda koma (<code className="text-sky-300">,</code>).
              </p>
            </div>
          )}

          <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-400">Nama Subjek Layanan (Pilihan Tombol WA)</label>
            <input
              type="text"
              required
              value={subject.name}
              onChange={(e) => onUpdate(subject.id, 'name', e.target.value)}
              placeholder="Contoh: Layanan Pembelian Retail, Join Kemitraan / B2B"
              className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-400">
              📋 Kata Kunci Data yang Ingin Dikumpulkan (Target Data)
            </label>
            <input
              type="text"
              required
              value={subject.targetData}
              onChange={(e) => onUpdate(subject.id, 'targetData', e.target.value)}
              placeholder="Contoh: Nama Lengkap*, Alamat Domisili*, Tipe Rumah"
              className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
            />
            
            {/* ✅ KOTAK TIPS PENULISAN TARGET DATA UNTUK KLIEN */}
            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-gray-300 leading-relaxed space-y-1.5">
              <p className="m-0">
                <span className="text-amber-400 font-bold">⭐ Data Prioritas (*):</span> Tambahkan tanda bintang (<code className="text-amber-300 font-bold">*</code>) di akhir kata kunci untuk data yang <strong>wajib diisi</strong> (contoh: <code className="text-white">Nama Lengkap*</code>). Jika pelanggan meminta <em>"langsung hubungi sales"</em>, bot akan tetap menanyakan data bertanda <code className="text-amber-300 font-bold">*</code> terlebih dahulu dan melewati data lainnya.
              </p>
              <p className="m-0 border-t border-amber-500/15 pt-1.5">
                <span className="text-sky-400 font-bold">🏢 Pertanyaan Kondisional:</span> Tambahkan <code className="text-sky-300">(Jika Perusahaan)</code> di akhir kata kunci (contoh: <code className="text-white">Nama Perusahaan (Jika Perusahaan), Jabatan (Jika Perusahaan)</code>) agar otomatis dilewati jika pembeli memilih <strong>Pribadi</strong>.
              </p>
            </div>
          </div>



          {/* <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-400">📋 Kata Kunci Data yang Ingin Dikumpulkan (Target Data)</label>
            <input
              type="text"
              required
              value={subject.targetData}
              onChange={(e) => onUpdate(subject.id, 'targetData', e.target.value)}
              placeholder="Contoh: Nama Lengkap, Alamat Rumah, Ukuran Baju"
              className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
            />
          </div> */}

          <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-400">🗣️ Gaya Bicara AI (Tone Style)</label>
            <input
              type="text"
              required
              value={subject.toneStyle}
              onChange={(e) => onUpdate(subject.id, 'toneStyle', e.target.value)}
              placeholder="Contoh: Ramah, pakai emoji senyum, gunakan sapaan 'Kak'"
              className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-medium text-gray-300">
              🏁 Pesan Penutup (Setelah Data Lengkap)
            </label>
            <textarea
              rows={2}
              required
              value={subject.closingMessage || ''}
              onChange={(e) => onUpdate(subject.id, 'closingMessage', e.target.value)}
              placeholder="Contoh: Terima kasih, data Anda sudah kami terima dan segera diproses..."
              className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block mb-1.5 text-xs font-medium text-gray-400">Skema Pengalihan Chat</label>
              <select
                value={subject.routingType}
                onChange={(e) => onUpdate(subject.id, 'routingType', e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
              >
                <option value="ROUND_ROBIN">🔄 Bergilir Otomatis (Round-Robin)</option>
                <option value="DIRECT">🎯 Langsung ke Satu Sales Tertentu</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-medium text-gray-400">Pilih Agen Sales (Jika Direct)</label>
              <select
                disabled={subject.routingType !== 'DIRECT'}
                value={subject.targetSalesId}
                onChange={(e) => onUpdate(subject.id, 'targetSalesId', e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Sales Target --</option>
                {salesList.map((sl) => (
                  <option key={sl.id} value={sl.id}>{sl.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// import React from 'react';

// export default function SubjekItem({ subject, index, salesList, onUpdate, onRemove, onToggle }) {
//   return (
//     <div className="bg-gray-900/40 border border-white/5 rounded-xl shadow-md overflow-hidden transition-all duration-200">
      
//       {/* HEADER BARIS ACCORDION (Bisa di-klik untuk buka/tutup) */}
//       <div 
//         onClick={() => onToggle(subject.id)}
//         className="p-4 bg-gray-800/40 hover:bg-gray-800/80 cursor-pointer flex justify-between items-center border-b border-white/5 select-none"
//       >
//         <div className="flex items-center gap-3">
//           <span className="text-xs font-semibold text-gray-400 font-mono">#{index + 1}</span>
//           <span className="text-sm font-bold text-white">
//             {subject.name ? subject.name : <span className="text-gray-500 italic font-normal">Nama Subjek belum diisi...</span>}
//           </span>
//         </div>
//         <div className="flex items-center gap-4">
//           <button
//             type="button"
//             onClick={(e) => onRemove(subject.id, e)}
//             className="text-xs text-gray-500 hover:text-red-400 transition-colors"
//           >
//             Hapus Opsi
//           </button>
//           <span className={`text-xs text-purple-400 transition-transform duration-200 ${subject.isExpanded ? 'rotate-180' : ''}`}>
//             ▼
//           </span>
//         </div>
//       </div>

//       {/* ISI FORM INTERNAL SUBJEK (Hanya muncul jika terbuka) */}
//       {subject.isExpanded && (
//         <div className="p-4 space-y-4 bg-transparent" onClick={(e) => e.stopPropagation()}>
          
//           <div>
//             <label className="block mb-1.5 text-xs font-medium text-gray-400">Nama Subjek Layanan (Pilihan Tombol WA)</label>
//             <input
//               type="text"
//               required
//               value={subject.name}
//               onChange={(e) => onUpdate(subject.id, 'name', e.target.value)}
//               placeholder="Contoh: Layanan Pembelian Retail, Join Kemitraan / B2B"
//               className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
//             />
//           </div>

//           <div>
//             <label className="block mb-1.5 text-xs font-medium text-gray-400">📋 Kata Kunci Data yang Ingin Dikumpulkan (Target Data)</label>
//             <input
//               type="text"
//               required
//               value={subject.targetData}
//               onChange={(e) => onUpdate(subject.id, 'targetData', e.target.value)}
//               placeholder="Contoh: Nama Lengkap, Alamat Rumah, Ukuran Baju"
//               className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
//             />
//           </div>

//           <div>
//             <label className="block mb-1.5 text-xs font-medium text-gray-400">🗣️ Gaya Bicara AI (Tone Style)</label>
//             <input
//               type="text"
//               required
//               value={subject.toneStyle}
//               onChange={(e) => onUpdate(subject.id, 'toneStyle', e.target.value)}
//               placeholder="Contoh: Ramah, pakai emoji senyum, gunakan sapaan 'Kak'"
//               className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
//             <div>
//               <label className="block mb-1.5 text-xs font-medium text-gray-400">Skema Pengalihan Chat</label>
//               <select
//                 value={subject.routingType}
//                 onChange={(e) => onUpdate(subject.id, 'routingType', e.target.value)}
//                 className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors"
//               >
//                 <option value="ROUND_ROBIN">🔄 Bergilir Otomatis (Round-Robin)</option>
//                 <option value="DIRECT">🎯 Langsung ke Satu Sales Tertentu</option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-1.5 text-xs font-medium text-gray-400">Pilih Agen Sales (Jika Direct)</label>
//               <select
//                 disabled={subject.routingType !== 'DIRECT'}
//                 value={subject.targetSalesId}
//                 onChange={(e) => onUpdate(subject.id, 'targetSalesId', e.target.value)}
//                 className="w-full p-2 rounded-lg bg-gray-800 border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
//               >
//                 <option value="">-- Pilih Sales Target --</option>
//                 {salesList.map((sl) => (
//                   <option key={sl.id} value={sl.id}>{sl.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//         </div>
//       )}
//     </div>
//   );
// }
