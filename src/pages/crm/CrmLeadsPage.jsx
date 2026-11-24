import React, { useState, useEffect, useCallback } from 'react';
// import Sidebar from '../../components/Sidebar';
// import axiosInstance from '../../api/axiosInstance';
import { userService } from '../../api/userService';
import { leadService } from '../../api/leadService';

const formatWaUrl = (phoneNumber) => {
  const cleanPhone = String(phoneNumber || '').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}`;
};

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSales, setSelectedSales] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState(null);

  let user = null;
  try {
    const savedUser = localStorage.getItem('saas_user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }
  const userRole = user?.role?.toUpperCase() || 'SALES';

    const fetchAllLeadsData = useCallback(async () => {
      try {
        setLoading(true);
        const leadsRes = await leadService.getAllLeads();
        if (leadsRes?.success) {
          setLeads(leadsRes.data || []);
        }
    
        const salesRes = await userService.getTenantSalesList();
        if (salesRes?.success) {
          setSalesList(salesRes.data || []);
        }
      } catch (err) {
        console.error('Gagal memuat data CRM Leads:', err);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchAllLeadsData();
  }, [fetchAllLeadsData]);

  // Helper ambil nama pelanggan dari formData JSON
  const getCustomerName = (formData) => {
    if (!formData || typeof formData !== 'object') return 'Pelanggan Baru';
    const candidate =
      formData['Nama Lengkap'] ||
      formData['Nama'] ||
      Object.values(formData).find(
        (v) => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '- (Pribadi)'
      );
    if (!candidate) return 'Pelanggan Baru';
    return typeof candidate === 'object' ? JSON.stringify(candidate) : String(candidate);
  };

  // Helper format tanggal & jam
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter data leads
  const filteredLeads = leads.filter((lead) => {
    if (userRole === 'SALES' && lead.assignedToSalesId && lead.assignedToSalesId !== user?.userId) {
      return false;
    }

    const matchSales =
      selectedSales === 'ALL' ||
      (selectedSales === 'UNASSIGNED' && !lead.assignedToSalesId) ||
      lead.assignedToSalesId === selectedSales;

    const matchStatus = selectedStatus === 'ALL' || lead.status === selectedStatus;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchSales && matchStatus;

    const customerName = getCustomerName(lead.formData).toLowerCase();
    const formValues = JSON.stringify(lead.formData || {}).toLowerCase();
    const matchSearch =
      customerName.includes(q) ||
      String(lead.phoneNumber || '').toLowerCase().includes(q) ||
      formValues.includes(q);

    return matchSales && matchStatus && matchSearch;
  });

  // ✅ FITUR EXPORT KE CSV / EXCEL
  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      alert('Tidak ada data prospek untuk diekspor.');
      return;
    }

    const headers = [
      'Waktu Masuk',
      'Nama Pelanggan',
      'No WhatsApp',
      'PIC Sales',
      'Status',
      'Detail Jawaban AI',
    ];
    const rows = filteredLeads.map((lead) => {
      const detailText = Object.entries(lead.formData || {})
        .filter(([_, val]) => String(val || '').trim() !== '- (Pribadi)')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');

      return [
        `"${formatDateTime(lead.createdAt)}"`,
        `"${getCustomerName(lead.formData).replace(/"/g, '""')}"`,
        `"+${String(lead.phoneNumber || '').replace(/\D/g, '')}"`,
        `"${String(lead.sales?.name || 'Belum ditentukan').replace(/"/g, '""')}"`,
        `"${String(lead.status || '-').replace(/"/g, '""')}"`,
        `"${detailText.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CRM_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-[#030712] min-h-screen text-[#f8fafc] font-sans antialiased">
      {/* <Sidebar /> */}

      <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-10">
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
          <div>
            <h2 className="text-2xl font-extrabold text-white m-0">👥 Database CRM Leads</h2>
            <p className="text-xs text-slate-400 m-0 mt-1">
              Seluruh data prospek pelanggan yang berhasil dikumpulkan dan didistribusikan oleh Bot AI.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchAllLeadsData}
              disabled={loading}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {loading ? '🔄 Memuat...' : '🔄 Refresh'}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Export Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Bar Filter & Pencarian */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 bg-[#0f172a]/70 p-4 rounded-2xl border border-white/5">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="🔍 Cari nama pelanggan, nomor WA, atau kebutuhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          {userRole !== 'SALES' && (
            <select
              value={selectedSales}
              onChange={(e) => setSelectedSales(e.target.value)}
              className="h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-sky-500"
            >
              <option value="ALL">👤 Semua PIC Sales</option>
              <option value="UNASSIGNED">⏳ Belum Ada Sales</option>
              {salesList.map((s) => (
                <option key={s.userId} value={s.userId}>
                  Sales: {s.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-sky-500"
          >
            <option value="ALL">📌 Semua Status</option>
            <option value="ASSIGNED">✅ ASSIGNED (Diteruskan)</option>
            <option value="BOT_PROCESS">💬 BOT_PROCESS (Sedang Chat)</option>
            <option value="CANCELLED">❌ CANCELLED (Dibatalkan)</option>
          </select>
        </div>

        {/* Tabel Daftar Prospek */}
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-[#0f172a] border-b border-white/10 text-slate-400 uppercase text-[11px] shadow-sm">
                <tr>
                  <th className="py-3.5 px-4">Pelanggan & Waktu</th>
                  <th className="py-3.5 px-4">Ringkasan Kebutuhan</th>
                  <th className="py-3.5 px-4">PIC Sales</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 animate-pulse">
                      ⏳ Memuat database prospek...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 italic">
                      Tidak ada data prospek yang cocok dengan filter saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => {
                    const summaryPreview = Object.entries(lead.formData || {})
                      .filter(
                        ([k, v]) =>
                          !k.toLowerCase().includes('nama lengkap') &&
                          String(v || '').trim() !== '- (Pribadi)'
                      )
                      .slice(0, 2)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' • ');

                    const cleanPhone = String(lead.phoneNumber || '').replace(/\D/g, '');
                    const customerName = getCustomerName(lead.formData);

                    return (
                      <tr
                        key={lead.leadId || `${cleanPhone}-${idx}`}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{customerName}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">+{cleanPhone || '-'}</span>
                            <span>•</span>
                            <span>🕒 {formatDateTime(lead.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                          {summaryPreview || (
                            <span className="text-slate-500 italic">Belum ada rincian</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {/* Di tabel DashboardOverview.jsx & CrmLeadsPage.jsx */}
                           {lead.sales?.name || lead.assignedSalesName ? (
                             <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                               {lead.sales?.name || lead.assignedSalesName}
                             </span>
                           ) : (
                             <span className="text-slate-500">-</span>
                           )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              lead.status === 'ASSIGNED'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : lead.status === 'CANCELLED'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {lead.status || 'BOT_PROCESS'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              👁️ Detail
                            </button>
                            <a
                              href={formatWaUrl(lead.phoneNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all no-underline"
                            >
                              Chat WA
                            </a>
                          </div>
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

      {/* Popup Detail Lengkap Prospek */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left space-y-4 my-auto"
          >
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/20">
                  📋 RINCIAN DATA PROSPEK
                </span>
                <h3 className="text-lg font-bold text-white m-0 mt-1.5">
                  {getCustomerName(selectedLead.formData)}
                </h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5 font-mono">
                  📱 +{String(selectedLead.phoneNumber || '').replace(/\D/g, '')} • 🕒{' '}
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
                  {selectedLead.status || 'BOT_PROCESS'}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider m-0">
                💬 Data yang Dikumpulkan Bot AI:
              </h4>

              {Object.entries(selectedLead.formData || {}).filter(
                ([_, jawaban]) => String(jawaban || '').trim() !== '- (Pribadi)'
              ).length === 0 ? (
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-400 italic text-center">
                  Belum ada rincian jawaban yang tersimpan untuk sesi ini.
                </div>
              ) : (
                <div className="bg-black/25 border border-white/10 rounded-xl divide-y divide-white/5 max-h-60 overflow-y-auto">
                  {Object.entries(selectedLead.formData || {})
                    .filter(([_, jawaban]) => String(jawaban || '').trim() !== '- (Pribadi)')
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

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={formatWaUrl(selectedLead.phoneNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg no-underline"
              >
                <span>📲</span>
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}