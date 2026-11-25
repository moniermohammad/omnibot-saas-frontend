import React, { useState, useEffect } from 'react';
import SubjekItem from './SubjekItem';
import ManageSalesModal from './ManageSalesModal';
import { chatbotService } from '../../../api/chatbotService'; 
import { userService } from '../../../api/userService'; 

const SUBJECT_TEMPLATES = [
  {
    label: '🏍️ Penjualan Unit / B2B',
    name: 'INFO PRODUK & HARGA',
    targetData: 'Nama Lengkap*, Alamat Domisili*, Kebutuhan Unit, Kategori Pembeli (Pribadi/Perusahaan), Nama Perusahaan (Jika Perusahaan), Jabatan (Jika Perusahaan)',
    toneStyle: 'Ramah, solutif, dan sopan',
    closingMessage: 'Terima kasih atas ketertarikan Anda. Data kebutuhan unit sudah kami catat dan tim sales kami akan segera menghubungi Anda untuk info harga serta penawaran terbaik.',
  },
  {
    label: '🏠 Properti / KPR',
    name: 'KONSULTASI UNIT PROPERTI',
    targetData: 'Nama Lengkap*, Domisili Saat Ini*, Tipe Rumah yang Dicari, Rencana Pembayaran (Cash/KPR), Jadwal Survei Lokasi',
    toneStyle: 'Profesional, hangat, dan informatif',
    closingMessage: 'Terima kasih atas informasinya. Konsultan properti kami akan segera menghubungi Anda untuk mengirimkan brosur lengkap, simulasi KPR, serta konfirmasi jadwal survei lokasi.',
  },
  {
    label: '🛍️ Toko Online / Retail',
    name: 'PEMESANAN PRODUK',
    targetData: 'Nama Lengkap*, Nama Produk & Jumlah*, Warna / Ukuran, Alamat Pengiriman Lengkap*, Metode Pembayaran',
    toneStyle: 'Ramah, santai, dan pakai sapaan Kak',
    closingMessage: 'Terima kasih Kak! Pesanan Anda sudah kami catat. Admin kami akan segera menghitung total ongkos kirim dan mengirimkan detail pembayarannya.',
  },
  {
    label: '🏥 Klinik / Reservasi Jasa',
    name: 'BOOKING JADWAL LAYANAN',
    targetData: 'Nama Lengkap*, Keluhan atau Layanan yang Dibutuhkan*, Hari & Jam Kunjungan',
    toneStyle: 'Empatik, ramah, dan cepat tanggap',
    closingMessage: 'Terima kasih, data reservasi Anda sudah kami terima. Admin kami akan segera menghubungi Anda untuk mengonfirmasi ketersediaan jadwal kunjungan.',
  },
  {
    label: '🎓 Kursus / Pendidikan',
    name: 'INFO PENDAFTARAN & PROGRAM',
    targetData: 'Nama Lengkap*, Usia / Jenjang Pendidikan, Program atau Kelas yang Diminati*, Domisili',
    toneStyle: 'Ramah, suportif, dan edukatif',
    closingMessage: 'Terima kasih sudah menghubungi kami. Tim akademik kami akan segera mengirimkan rincian kurikulum, jadwal kelas, dan informasi biaya pendaftaran.',
  },
  {
    label: '✈️ Travel / Paket Wisata',
    name: 'KONSULTASI PAKET TOUR',
    targetData: 'Nama Lengkap*, Tujuan Wisata / Paket*, Jumlah Peserta, Perkiraan Tanggal Berangkat',
    toneStyle: 'Antusias, ramah, dan membantu',
    closingMessage: 'Terima kasih atas minat Anda! Konsultan travel kami akan segera mengirimkan itinerary lengkap beserta estimasi biaya paket wisata sesuai rencana perjalanan Anda.',
  },
  {
    label: '🤝 Kemitraan / Reseller',
    name: 'DAFTAR AGEN & KEMITRAAN',
    targetData: 'Nama Lengkap*, Kota / Wilayah Usaha*, Pengalaman Jualan (Jika Ada), Estimasi Modal Awal',
    toneStyle: 'Profesional, antusias, dan terbuka',
    closingMessage: 'Terima kasih atas minat bergabung menjadi mitra kami. Tim kemitraan kami akan segera menghubungi Anda untuk menjelaskan syarat, keuntungan, dan katalog paket usaha.',
  },
  {
    label: '🛠️ Layanan Purna Jual / CS',
    name: 'BANTUAN & KOMPLAIN',
    targetData: 'Nama Lengkap*, Nomor Invoice atau Plat Nomor, Detail Kendala*',
    toneStyle: 'Sopan, tenang, dan membantu',
    closingMessage: 'Mohon maaf atas ketidaknyamanan yang Anda alami. Laporan kendala Anda sudah kami catat dan akan segera ditindaklanjuti oleh tim layanan purna jual kami.',
  },
];



export default function BotForm({ tenantId, initialData, onError, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState('');
  const [closingMessage, setClosingMessage] = useState('');
  const [salesGroupJid, setSalesGroupJid] = useState('');
  
  // State pengontrol modal dan penampung daftar sales riil
  const [isManageSalesOpen, setIsManageSalesOpen] = useState(false);
  const [dynamicSalesList, setDynamicSalesList] = useState([]);
  
  // State daftar grup WhatsApp
  const [waGroups, setWaGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [subjects, setSubjects] = useState([
    { id: Date.now(), name: '', targetData: 'Nama, Alamat', toneStyle: 'Ramah', routingType: 'ROUND_ROBIN', targetSalesId: '', isExpanded: true }
  ]);

  // 1. Cek Hak Akses & Kuota Paket (WAJIB diletakkan di atas sebelum useEffect)
  const savedUser = localStorage.getItem('saas_user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userRole = user?.role?.toUpperCase() || 'SALES';
  const hasFullAccess = userRole === 'OWNER' || userRole === 'ADMIN';

  const maxSalesQuota = initialData?.tenant?.maxSales ?? user?.maxSales ?? 2;
  const isGroupFeatureUnlocked = maxSalesQuota >= 2;

  // 2. Fungsi-fungsi Fetch API
  const fetchSalesData = async () => {
    try {
      const response = await userService.getTenantSalesList(); 
      if (response?.success) {
        const formattedDropdown = response.data.map(sales => ({
          id: sales.userId,
          name: `${sales.name} (${sales.phoneNumber})`
        }));
        setDynamicSalesList(formattedDropdown);
      }
    } catch (err) {
      console.error("Gagal memuat daftar sales:", err);
    }
  };

  const fetchWaGroups = async () => {
    if (!tenantId || !isGroupFeatureUnlocked) return;
    setLoadingGroups(true);
    try {
      const res = await chatbotService.getWhatsAppGroups(tenantId);
      const groupList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setWaGroups(groupList);
    } catch (err) {
      // Abaikan log error merah jika 503 (berarti nomor WA tenant memang belum terhubung)
      if (err?.response?.status !== 503) {
        console.error("Gagal memuat grup WhatsApp:", err);
      }
      setWaGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };


  // 3. Jalankan Fetch Data secara terpisah sesuai pemicunya
  useEffect(() => {
    fetchSalesData();
  }, [tenantId]);

  useEffect(() => {
    if (isGroupFeatureUnlocked) {
      fetchWaGroups();
    }
  }, [tenantId, isGroupFeatureUnlocked]);

  // 4. Isi otomatis nilai form dari database (initialData)
  useEffect(() => {
    if (initialData) {
      setCompanyProfile(initialData.openingMessage || '');
      setSalesGroupJid(initialData.salesGroupJid || '');
      
      if (initialData.subjects && initialData.subjects.length > 0) {
        const mappedSubjects = initialData.subjects.map((sub, index) => ({
          id: sub.subjectId || Date.now() + index,
          name: sub.name || '',
          targetData: sub.targetData || '',
          toneStyle: sub.toneStyle || '',
          closingMessage: sub.closingMessage || '', // <-- Ditambahkan ke sini
          routingType: sub.routingType || 'ROUND_ROBIN',
          targetSalesId: sub.targetSalesId || '',
          isExpanded: index === 0
        }));
        setSubjects(mappedSubjects);
      }
    }
  }, [initialData]);


  // 5. Handler Manipulasi Form & Submit
  const handleAddSubject = () => {
    const collapsedPrev = subjects.map(sub => ({ ...sub, isExpanded: false }));
    setSubjects([...collapsedPrev, { id: Date.now(), name: '', targetData: '', toneStyle: '', routingType: 'ROUND_ROBIN', targetSalesId: '', isExpanded: true }]);
  };

  const handleRemoveSubject = (id, e) => {
    e.stopPropagation();
    if (subjects.length === 1) return alert('Minimal harus ada 1 pengaturan subjek.');
    setSubjects(subjects.filter((sub) => sub.id !== id));
  };

  const handleUpdateSubject = (id, field, value) => {
    setSubjects(subjects.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)));
  };

  const toggleExpand = (id) => {
    setSubjects(subjects.map((sub) => (sub.id === id ? { ...sub, isExpanded: !sub.isExpanded } : sub)));
  };

  const handleApplyTemplate = (id, template) => {
    setSubjects(
      subjects.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              name: template.name,
              targetData: template.targetData,
              closingMessage: template.closingMessage,
              toneStyle: template.toneStyle,
            }
          : sub
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onError('');
    onSuccess('');

    const formattedSubjects = subjects.map((sub) => ({
      name: sub.name,
      routingType: sub.routingType,
      targetSalesId: sub.routingType === 'DIRECT' ? sub.targetSalesId : null,
      targetData: sub.targetData,
      closingMessage: sub.closingMessage,
      toneStyle: sub.toneStyle,
      aiPrompt: `Kategori: ${sub.name}. Kumpulkan data: ${sub.targetData}. Gaya: ${sub.toneStyle}.`
    }));

    try {
      await chatbotService.createConfigChatbots({ 
        tenantId, 
        keywordTrigger: "GLOBAL_FLOW", 
        openingMessage: companyProfile, 
        // closingMessage,
        salesGroupJid: salesGroupJid.trim() || null,
        subjects: formattedSubjects 
      });
      
      onSuccess('🎉 Perubahan konfigurasi chatbot berhasil disimpan ke database!');
    } catch (err) {
      console.error("🚨 Gagal menyimpan konfigurasi chatbot:", err);
      onError(err?.toString() || 'Gagal menyimpan perubahan ke database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        
        {/* BAGIAN 1: INPUT UTAMA */}
        <div className="space-y-4 border-b border-white/5 pb-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-300">
              Pesan Pembuka / Keterangan Perusahaan
            </label>
            <textarea
              rows={3}
              required
              value={companyProfile}
              onChange={(e) => setCompanyProfile(e.target.value)}
              placeholder="Contoh: Kami adalah PT BotKilat..."
              className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* BAGIAN 2: LIST ACCORDION SUBJEK (closingMessage pindah ke dalam SubjekItem) */}
        <div className="space-y-4 border-b border-white/5 pb-5">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">
              🗂️ Pengaturan Opsi Menu Layanan
            </h4>
            
            <div className="flex gap-2">
              {hasFullAccess && (
                <button 
                  type="button" 
                  onClick={() => setIsManageSalesOpen(true)}
                  className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-md text-xs font-semibold transition-all shadow-sm"
                >
                  👥 Kelola Tim Sales
                </button>
              )}
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white rounded-md text-xs font-semibold transition-all"
              >
                + Tambah Subjek
              </button>
            </div>
          </div>

          {subjects.map((subject, index) => (
            <SubjekItem 
              key={subject.id} 
              subject={subject} 
              index={index} 
              salesList={dynamicSalesList}
              templates={SUBJECT_TEMPLATES}
              onApplyTemplate={handleApplyTemplate}
              onUpdate={handleUpdateSubject} 
              onRemove={handleRemoveSubject} 
              onToggle={toggleExpand}
            />
          ))}
        </div>

        {/* BAGIAN 3: NOTIFIKASI GRUP SALES (Input closingMessage sudah dihapus dari sini) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">
            🏁 Tahap Akhir (Distribusi Notifikasi)
          </h4>

          {/* ✅ DROPDOWN GRUP WHATSAPP SALES (Otomatis terkunci jika kuota hanya 1 Sales) */}
          <div className="p-3.5 rounded-lg bg-[#0b1329] border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-sky-400 m-0">
                📢 Grup WhatsApp Sales (Opsional)
              </label>
              {!isGroupFeatureUnlocked && (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  🔒 Minimal Kuota 2 Sales
                </span>
              )}
            </div>

            {isGroupFeatureUnlocked ? (
              <p className="text-xs text-gray-400 mb-2">
                Masukkan nomor bot ke dalam grup sales, lalu pilih nama grupnya di bawah ini (kosongkan jika tidak perlu kirim ke grup).
              </p>
            ) : (
              <p className="text-sm text-gray-200 leading-relaxed mb-3">
                💡 Masukkan <strong>nomor bot</strong> ke dalam grup sales Anda terlebih dahulu, lalu pilih nama grupnya di bawah ini <span className="text-gray-400">(kosongkan jika tidak perlu kirim ke grup)</span>.
              </p>
            )}

            <div className="flex gap-2">
              <select
                disabled={!isGroupFeatureUnlocked || loadingGroups}
                value={isGroupFeatureUnlocked ? (salesGroupJid || '') : ''}
                onChange={(e) => setSalesGroupJid(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {!isGroupFeatureUnlocked ? (
                  <option value="">🔒 Upgrade ke minimal 2 Sales untuk membuka fitur Grup WhatsApp</option>
                ) : loadingGroups ? (
                  <option value="">⏳ Sedang mengambil daftar grup dari nomor bot...</option>
                ) : (
                  <>
                    <option value="">-- Tidak perlu kirim ke grup (Kosongkan) --</option>
                    
                    {/* Fallback: Jika ID tersimpan di DB tapi grup belum muncul di list */}
                    {salesGroupJid && !waGroups.some(g => g.id === salesGroupJid) && (
                      <option value={salesGroupJid}>
                        Grup Tersimpan ({salesGroupJid})
                      </option>
                    )}

                    {waGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Tombol Refresh manual jika bot baru dimasukkan ke grup baru */}
              {isGroupFeatureUnlocked && (
                <button
                  type="button"
                  onClick={fetchWaGroups}
                  disabled={loadingGroups}
                  title="Muat ulang daftar grup dari WhatsApp"
                  className="px-3.5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/10 text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  {loadingGroups ? '⏳' : '🔄'}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-sky-500 via-purple-600 to-emerald-600 hover:brightness-110 text-white font-bold rounded-lg text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Menyimpan Perubahan...' : '💾 Simpan Perubahan Konfigurasi'}
        </button>

      </form>


      <ManageSalesModal 
        isOpen={isManageSalesOpen} 
        onClose={() => setIsManageSalesOpen(false)} 
        salesList={dynamicSalesList} 
        onRefreshList={fetchSalesData} 
      />
    </>
  );



  // return (
  //   <>
  //     <form onSubmit={handleSubmit} className="space-y-6 text-left">
        
  //       {/* BAGIAN 1: INPUT UTAMA */}
  //       <div className="space-y-4 border-b border-white/5 pb-5">
  //         <div>
  //           <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Pembuka / Keterangan Perusahaan</label>
  //           <textarea rows={3} required value={companyProfile} onChange={(e) => setCompanyProfile(e.target.value)} placeholder="Contoh: Kami adalah PT BotKilat..." className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors resize-none" />
  //         </div>
  //       </div>

  //       {/* BAGIAN 2: LIST ACCORDION SUBJEK */}
  //       <div className="space-y-4 border-b border-white/5 pb-5">
  //         <div className="flex justify-between items-center">
  //           <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">🗂️ Pengaturan Opsi Subjek Layanan</h4>
            
  //           <div className="flex gap-2">
  //             {hasFullAccess && (
  //               <button 
  //                 type="button" 
  //                 onClick={() => setIsManageSalesOpen(true)}
  //                 className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-md text-xs font-semibold transition-all shadow-sm"
  //               >
  //                 👥 Kelola Tim Sales
  //               </button>
  //             )}
  //             <button type="button" onClick={handleAddSubject} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white rounded-md text-xs font-semibold transition-all">+ Tambah Subjek</button>
  //           </div>
  //         </div>

  //         {subjects.map((subject, index) => (
  //           <SubjekItem 
  //             key={subject.id} 
  //             subject={subject} 
  //             index={index} 
  //             salesList={dynamicSalesList}
  //             templates={SUBJECT_TEMPLATES}
  //             onApplyTemplate={handleApplyTemplate}
  //             onUpdate={handleUpdateSubject} 
  //             onRemove={handleRemoveSubject} 
  //             onToggle={toggleExpand}
  //           />
  //         ))}
  //       </div>

  //       {/* BAGIAN 3: PESAN PENUTUP & NOTIFIKASI GRUP SALES */}
  //       <div className="space-y-4">
  //         <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">🏁 Tahap Akhir (Closing & Distribusi)</h4>
          
  //         <div>
  //           <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Penutup (Setelah Data Lengkap)</label>
  //           <textarea rows={2} required value={closingMessage} onChange={(e) => setClosingMessage(e.target.value)} placeholder="Contoh: Terima kasih, data Anda sudah kami terima..." className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-emerald-500 transition-colors resize-none" />
  //         </div>

  //         {/* ✅ INPUT ID GRUP WHATSAPP SALES (Otomatis terkunci jika kuota hanya 1 Sales) */}
  //         <div className="p-3.5 rounded-lg bg-[#0b1329] border border-white/10">
  //           <div className="flex items-center justify-between mb-1">
  //             <label className="text-sm font-medium text-sky-400 m-0">
  //               📢 ID Grup WhatsApp Sales (Opsional)
  //             </label>
  //             {!isGroupFeatureUnlocked && (
  //               <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
  //                 🔒 Minimal Kuota 2 Sales
  //               </span>
  //             )}
  //           </div>

  //           {isGroupFeatureUnlocked ? (
  //             <p className="text-xs text-gray-400 mb-2">
  //               Masukkan nomor bot ke grup sales lalu ketik{' '}
  //               <code className="text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded">!idgrup</code> di grup tersebut untuk mendapatkan ID-nya.
  //             </p>
  //           ) : (
  //             <p className="text-xs text-amber-300/80 mb-2">
  //               Fitur notifikasi ke Grup WhatsApp Tim khusus untuk akun dengan kuota <strong>minimal 2 Sales</strong>. Tingkatkan kuota di menu <strong>⚡ Kelola Paket</strong> untuk mengaktifkan.
  //             </p>
  //           )}

  //           <input 
  //             type="text" 
  //             disabled={!isGroupFeatureUnlocked}
  //             value={isGroupFeatureUnlocked ? salesGroupJid : ''} 
  //             onChange={(e) => setSalesGroupJid(e.target.value)} 
  //             placeholder={
  //               isGroupFeatureUnlocked
  //                 ? 'Contoh: 120363048291029384@g.us (Kosongkan jika tidak perlu kirim ke grup)'
  //                 : '🔒 Upgrade ke minimal 2 Sales untuk membuka fitur Grup WhatsApp'
  //             }
  //             className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" 
  //           />
  //         </div>
  //       </div>

  //       <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-r from-sky-500 via-purple-600 to-emerald-600 hover:brightness-110 text-white font-bold rounded-lg text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
  //         {loading ? '⏳ Menyimpan Perubahan...' : '💾 Simpan Perubahan Konfigurasi'}
  //       </button>

  //     </form>

  //     <ManageSalesModal 
  //       isOpen={isManageSalesOpen} 
  //       onClose={() => setIsManageSalesOpen(false)} 
  //       salesList={dynamicSalesList} 
  //       onRefreshList={fetchSalesData} 
  //     />
  //   </>
  // );



  // return (
  //   <>
  //     <form onSubmit={handleSubmit} className="space-y-6 text-left">
        
  //       {/* BAGIAN 1: INPUT UTAMA */}
  //       <div className="space-y-4 border-b border-white/5 pb-5">
  //         <div>
  //           <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Pembuka / Keterangan Perusahaan</label>
  //           <textarea rows={3} required value={companyProfile} onChange={(e) => setCompanyProfile(e.target.value)} placeholder="Contoh: Kami adalah PT BotKilat..." className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors resize-none" />
  //         </div>
  //       </div>

  //       {/* BAGIAN 2: LIST ACCORDION SUBJEK */}
  //       <div className="space-y-4 border-b border-white/5 pb-5">
  //         <div className="flex justify-between items-center">
  //           <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">🗂️ Pengaturan Opsi Subjek Layanan</h4>
            
  //           <div className="flex gap-2">
  //             {hasFullAccess && (
  //               <button 
  //                 type="button" 
  //                 onClick={() => setIsManageSalesOpen(true)}
  //                 className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-md text-xs font-semibold transition-all shadow-sm"
  //               >
  //                 👥 Kelola Tim Sales
  //               </button>
  //             )}
  //             <button type="button" onClick={handleAddSubject} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white rounded-md text-xs font-semibold transition-all">+ Tambah Subjek</button>
  //           </div>
  //         </div>

  //         {subjects.map((subject, index) => (
  //           <SubjekItem 
  //             key={subject.id} subject={subject} index={index} salesList={dynamicSalesList}
  //             onUpdate={handleUpdateSubject} onRemove={handleRemoveSubject} onToggle={toggleExpand}
  //           />
  //         ))}
  //       </div>

  //       {/* BAGIAN 3: PESAN PENUTUP & NOTIFIKASI GRUP SALES */}
  //       <div className="space-y-4">
  //         <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">🏁 Tahap Akhir (Closing & Distribusi)</h4>
          
  //         <div>
  //           <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Penutup (Setelah Data Lengkap)</label>
  //           <textarea rows={2} required value={closingMessage} onChange={(e) => setClosingMessage(e.target.value)} placeholder="Contoh: Terima kasih, data Anda sudah kami terima..." className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-emerald-500 transition-colors resize-none" />
  //         </div>

  //         {/* ✅ INPUT BARU: ID GRUP WHATSAPP SALES */}
  //         <div className="p-3.5 rounded-lg bg-[#0b1329] border border-white/10">
  //           <label className="block mb-1 text-sm font-medium text-sky-400">
  //             📢 ID Grup WhatsApp Sales (Opsional)
  //           </label>
  //           <p className="text-xs text-gray-400 mb-2">
  //             Masukkan nomor bot ke grup sales lalu ketik <code className="text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded">!idgrup</code> di grup tersebut untuk mendapatkan ID-nya.
  //           </p>
  //           <input 
  //             type="text" 
  //             value={salesGroupJid} 
  //             onChange={(e) => setSalesGroupJid(e.target.value)} 
  //             placeholder="Contoh: 120363048291029384@g.us (Kosongkan jika tidak perlu kirim ke grup)" 
  //             className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors" 
  //           />
  //         </div>
  //       </div>

  //       <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-r from-sky-500 via-purple-600 to-emerald-600 hover:brightness-110 text-white font-bold rounded-lg text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
  //         {loading ? '⏳ Menyimpan Perubahan...' : '💾 Simpan Perubahan Konfigurasi'}
  //       </button>

  //     </form>

  //     <ManageSalesModal 
  //       isOpen={isManageSalesOpen} 
  //       onClose={() => setIsManageSalesOpen(false)} 
  //       salesList={dynamicSalesList} 
  //       onRefreshList={fetchSalesData} 
  //     />
  //   </>
  // );
}


// export default function BotForm({ tenantId, initialData, onError, onSuccess }) {
//   const [loading, setLoading] = useState(false);
//   const [companyProfile, setCompanyProfile] = useState('');
//   const [closingMessage, setClosingMessage] = useState('');
  
//   // State pengontrol modal dan penampung daftar sales riil
//   const [isManageSalesOpen, setIsManageSalesOpen] = useState(false);
//   const [dynamicSalesList, setDynamicSalesList] = useState([]);
  
//   const [subjects, setSubjects] = useState([
//     { id: Date.now(), name: '', targetData: 'Nama, Alamat', toneStyle: 'Ramah', routingType: 'ROUND_ROBIN', targetSalesId: '', isExpanded: true }
//   ]);

//   // Cek Hak Akses dari localStorage
//   const savedUser = localStorage.getItem('saas_user');
//   const user = savedUser ? JSON.parse(savedUser) : null;
//   const userRole = user?.role?.toUpperCase() || 'SALES';
//   const hasFullAccess = userRole === 'OWNER' || userRole === 'ADMIN';

//   // Mengambil daftar sales dari database PostgreSQL via userService
//   const fetchSalesData = async () => {
//     try {
//       const response = await userService.getTenantSalesList(); 
//       if (response?.success) {
//         // Format untuk kebutuhan Dropdown di SubjekItem
//         const formattedDropdown = response.data.map(sales => ({
//           id: sales.userId,
//           name: `${sales.name} (${sales.phoneNumber})`
//         }));
//         setDynamicSalesList(formattedDropdown);
//       }
//     } catch (err) {
//       console.error("Gagal memuat daftar sales:", err);
//     }
//   };

//   useEffect(() => {
//     fetchSalesData();
//   }, [tenantId]);

//   useEffect(() => {
//     if (initialData) {
//       setCompanyProfile(initialData.openingMessage || '');
//       setClosingMessage(initialData.closingMessage || '');
      
//       if (initialData.subjects && initialData.subjects.length > 0) {
//         const mappedSubjects = initialData.subjects.map((sub, index) => ({
//           id: sub.subjectId || Date.now() + index,
//           name: sub.name || '',
//           targetData: sub.targetData || '',
//           toneStyle: sub.toneStyle || '',
//           routingType: sub.routingType || 'ROUND_ROBIN',
//           targetSalesId: sub.targetSalesId || '',
//           isExpanded: index === 0
//         }));
//         setSubjects(mappedSubjects);
//       }
//     }
//   }, [initialData]);

//   const handleAddSubject = () => {
//     const collapsedPrev = subjects.map(sub => ({ ...sub, isExpanded: false }));
//     setSubjects([...collapsedPrev, { id: Date.now(), name: '', targetData: '', toneStyle: '', routingType: 'ROUND_ROBIN', targetSalesId: '', isExpanded: true }]);
//   };

//   const handleRemoveSubject = (id, e) => {
//     e.stopPropagation();
//     if (subjects.length === 1) return alert('Minimal harus ada 1 pengaturan subjek.');
//     setSubjects(subjects.filter((sub) => sub.id !== id));
//   };

//   const handleUpdateSubject = (id, field, value) => {
//     setSubjects(subjects.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)));
//   };

//   const toggleExpand = (id) => {
//     setSubjects(subjects.map((sub) => (sub.id === id ? { ...sub, isExpanded: !sub.isExpanded } : sub)));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     onError('');
//     onSuccess('');

//     const formattedSubjects = subjects.map((sub) => ({
//       name: sub.name,
//       routingType: sub.routingType,
//       targetSalesId: sub.routingType === 'DIRECT' ? sub.targetSalesId : null,
//       targetData: sub.targetData,
//       toneStyle: sub.toneStyle,
//       aiPrompt: `Profil: ${companyProfile}. Kategori: ${sub.name}. Kumpulkan data: ${sub.targetData}. Gaya: ${sub.toneStyle}. Selesai kirim: ${closingMessage} [[DATA_COMPLETE]].`
//     }));

//     try {
//       await chatbotService.createConfigChatbots({ 
//         tenantId, 
//         keywordTrigger: "GLOBAL_FLOW", 
//         openingMessage: companyProfile, 
//         closingMessage, 
//         subjects: formattedSubjects 
//       });
      
//       onSuccess('🎉 Perubahan konfigurasi chatbot berhasil disimpan ke database!');
//     } catch (err) {
//       console.error("🚨 Gagal menyimpan konfigurasi chatbot:", err);
//       onError(err?.toString() || 'Gagal menyimpan perubahan ke database.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit} className="space-y-6 text-left">
        
//         {/* BAGIAN 1: INPUT UTAMA */}
//         <div className="space-y-4 border-b border-white/5 pb-5">
//           <div>
//             <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Pembuka / Keterangan Perusahaan</label>
//             <textarea rows={3} required value={companyProfile} onChange={(e) => setCompanyProfile(e.target.value)} placeholder="Contoh: Kami adalah PT BotKilat..." className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors resize-none" />
//           </div>
//         </div>

//         {/* BAGIAN 2: LIST ACCORDION SUBJEK */}
//         <div className="space-y-4 border-b border-white/5 pb-5">
//           <div className="flex justify-between items-center">
//             <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">🗂️ Pengaturan Opsi Subjek Layanan</h4>
            
//             <div className="flex gap-2">
//               {hasFullAccess && (
//                 <button 
//                   type="button" 
//                   onClick={() => setIsManageSalesOpen(true)} // Memicu pembukaan modal terpadu
//                   className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-md text-xs font-semibold transition-all shadow-sm"
//                 >
//                   👥 Kelola Tim Sales {/* 🌟 2. Mengubah label tombol agar mencerminkan satu pintu manajemen */}
//                 </button>
//               )}
//               <button type="button" onClick={handleAddSubject} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white rounded-md text-xs font-semibold transition-all">+ Tambah Subjek</button>
//             </div>
//           </div>

//           {/* List Accordion Subjek */}
//           {subjects.map((subject, index) => (
//             <SubjekItem 
//               key={subject.id} subject={subject} index={index} salesList={dynamicSalesList}
//               onUpdate={handleUpdateSubject} onRemove={handleRemoveSubject} onToggle={toggleExpand}
//             />
//           ))}

//           {/* 🌟 3. BOT-TABLE LAMA DI SINI SUDAH DIHAPUS BERSIH KARENA SUDAH PINDAH KE DALAM POPUP MODAL */}
//         </div>

//         {/* BAGIAN 3: PESAN PENUTUP */}
//         <div className="space-y-4">
//           <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider m-0">🏁 Tahap Akhir (Closing)</h4>
//           <div>
//             <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Penutup (Setelah Data Lengkap)</label>
//             <textarea rows={2} required value={closingMessage} onChange={(e) => setClosingMessage(e.target.value)} placeholder="Contoh: Terima kasih, data Anda sudah kami terima..." className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-emerald-500 transition-colors resize-none" />
//           </div>
//         </div>

//         <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-r from-sky-500 via-purple-600 to-emerald-600 hover:brightness-110 text-white font-bold rounded-lg text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
//           {loading ? '⏳ Menyimpan Perubahan...' : '💾 Simpan Perubahan Konfigurasi'}
//         </button>

//       </form>

//       {/* 🌟 4. PEMANGGILAN POPUP MODAL TERPADU TERISOLASI */}
//       <ManageSalesModal 
//         isOpen={isManageSalesOpen} 
//         onClose={() => setIsManageSalesOpen(false)} 
//         salesList={dynamicSalesList} // Memasok data array tim ke dalam tabel modal
//         onRefreshList={fetchSalesData} // Sinkronisasi otomatis data dropdown atas saat data modal berubah
//       />
//     </>
//   );
// }
