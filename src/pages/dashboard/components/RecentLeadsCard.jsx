import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatWaUrl = (phoneNumber) => {
  const cleanPhone = String(phoneNumber || '').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}`;
};

const getLeadDisplayName = (formData) => {
  if (!formData || typeof formData !== 'object') return 'Pelanggan Baru';
  if (formData['Nama Lengkap']) return String(formData['Nama Lengkap']);
  if (formData['Nama']) return String(formData['Nama']);

  const firstValue = Object.values(formData).find(
    (val) => val !== null && val !== undefined && String(val).trim() !== ''
  );

  if (!firstValue) return 'Pelanggan Baru';
  return typeof firstValue === 'object' ? JSON.stringify(firstValue) : String(firstValue);
};

export default function RecentLeadsCard({ recentLeads = [] }) {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState(null);

  // Helper format waktu masuk (Contoh: "21 Nov, 11:20")
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="lg:col-span-7 bg-[#0f172a]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white m-0">🔥 Prospek Terbaru Masuk</h3>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Klik baris pelanggan untuk melihat rincian lengkap pertanyaan & jawaban bot
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/leads')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              Lihat Semua CRM →
            </button>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
              Belum ada data prospek masuk. Bagikan nomor bot WhatsApp Anda untuk mulai menangkap leads!
            </div>
          ) : (
            <div className="max-h-[290px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0f172a] z-10">
                  <tr className="border-b border-white/10 text-[11px] uppercase text-slate-400">
                    <th className="py-2.5 pr-3">Pelanggan & Waktu</th>
                    <th className="py-2.5 px-3">PIC Sales</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {recentLeads.map((lead, idx) => {
                    const customerName = getLeadDisplayName(lead.formData);
                    const cleanPhone = String(lead.phoneNumber || '').replace(/\D/g, '');

                    return (
                      <tr
                        key={lead.leadId || `${cleanPhone}-${idx}`}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-white group-hover:text-sky-400 transition-colors">
                            {customerName}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">+{cleanPhone || '-'}</span>
                            <span>•</span>
                            <span className="text-slate-500">🕒 {formatDateTime(lead.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {/* Di tabel DashboardOverview.jsx & CrmLeadsPage.jsx */}
                          {lead.sales?.name || lead.assignedSalesName ? (
                            <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                              {lead.sales?.name || lead.assignedSalesName}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.status === 'ASSIGNED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {lead.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              👁️ Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ POPUP MODAL DETAIL PROSPEK & HASIL WAWANCARA AI */}
           {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left space-y-4 my-auto"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/20">
                  📋 RINCIAN DATA PROSPEK
                </span>
                <h3 className="text-lg font-bold text-white m-0 mt-1.5">
                  {getLeadDisplayName(selectedLead.formData)}
                </h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5 font-mono">
                  📱 +{String(selectedLead.phoneNumber || '').replace(/\D/g, '') || '-'} • 🕒{' '}
                  {formatDateTime(selectedLead.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Info PIC Sales & Status */}
            <div className="grid grid-cols-2 gap-3 bg-[#1e293b]/60 p-3 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">PIC Sales Bertugas</span>
                <strong className="text-sky-300 mt-0.5 block">
                  {selectedLead.sales?.name || 'Belum ditentukan'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status Prospek</span>
                <strong className="text-emerald-400 mt-0.5 block">
                  {selectedLead.status || 'NEW'}
                </strong>
              </div>
            </div>

            {/* Daftar Lengkap Jawaban dari Wawancara Bot */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">
                💬 Data yang Dikumpulkan Bot AI:
              </h4>

              {Object.keys(selectedLead.formData || {}).length === 0 ? (
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-400 italic text-center">
                  Belum ada rincian jawaban yang tersimpan untuk sesi ini.
                </div>
              ) : (
                <div className="bg-black/25 border border-white/10 rounded-xl divide-y divide-white/5 max-h-60 overflow-y-auto">
                  {Object.entries(selectedLead.formData)
                    // ✅ Sembunyikan field kondisional jika pembeli memilih Pribadi
                    .filter(([_, jawaban]) => String(jawaban || '').trim() !== '- (Pribadi)')
                    // ✅ Urutkan Nama Lengkap & Domisili di posisi teratas
                    .sort(([keyA], [keyB]) => {
                      const order = ['nama lengkap', 'nama', 'alamat', 'domisili', 'kebutuhan', 'kategori', 'perusahaan'];
                      const idxA = order.findIndex((k) => keyA.toLowerCase().includes(k));
                      const idxB = order.findIndex((k) => keyB.toLowerCase().includes(k));
                      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                    })
                    .map(([pertanyaan, jawaban]) => (
                      <div key={pertanyaan} className="p-3 text-xs">
                        <div className="text-slate-400 text-[11px] font-medium">{pertanyaan}</div>
                        <div className="text-white font-semibold mt-0.5 whitespace-pre-wrap">
                          {jawaban !== null && jawaban !== undefined ? String(jawaban) : '-'}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Tutup
              </button>

              <a
                href={formatWaUrl(selectedLead.phoneNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg no-underline"
              >
                <span>📲</span>
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>

  );
}