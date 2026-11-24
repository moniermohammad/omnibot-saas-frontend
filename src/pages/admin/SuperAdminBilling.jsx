import React, { useState, useEffect, useCallback } from 'react';
import { billingService } from '../../api/billingService';

export default function SuperAdminBilling() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('superadmin_key') || '');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputKey, setInputKey] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = useCallback(async (keyToUse) => {
    if (!keyToUse) return;
    try {
      setLoading(true);
      const res = await billingService.getAllTransactions(keyToUse);
      if (res?.success) {
        setTransactions(Array.isArray(res.data) ? res.data : []);
        setIsUnlocked(true);
        sessionStorage.setItem('superadmin_key', keyToUse);
      } else {
        throw new Error(res?.message || 'Kunci admin tidak valid.');
      }
    } catch (err) {
      alert(err?.message || String(err));
      setIsUnlocked(false);
      sessionStorage.removeItem('superadmin_key');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) {
      fetchTransactions(adminKey);
    }
  }, [adminKey, fetchTransactions]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setAdminKey(inputKey.trim());
  };

  const handleLock = () => {
    sessionStorage.removeItem('superadmin_key');
    setAdminKey('');
    setInputKey('');
    setIsUnlocked(false);
    setTransactions([]);
  };

  const handleApprove = async (trx) => {
    const confirmMsg =
      `Konfirmasi dana transfer sudah masuk?\n\n` +
      `• Invoice: ${trx.orderId}\n` +
      `• Bisnis: ${trx.tenant?.businessName || trx.tenantId}\n` +
      `• Paket: ${trx.salesQuota} Sales (${trx.months} Bulan)\n` +
      `• Nominal: Rp ${Number(trx.amount || 0).toLocaleString('id-ID')}`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setApprovingId(trx.orderId);
      const res = await billingService.approveTransaction(trx.orderId, adminKey);
      if (res?.success) {
        alert(`🎉 ${res.message || 'Transaksi berhasil disetujui.'}`);
        fetchTransactions(adminKey);
      } else {
        throw new Error(res?.message || 'Gagal menyetujui transaksi.');
      }
    } catch (err) {
      alert('Gagal menyetujui transaksi: ' + (err?.message || String(err)));
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (trx) => {
    const reason = window.prompt(
      `Tolak invoice ${trx.orderId} (${trx.tenant?.businessName || trx.tenantId})?\n` +
        `Masukkan alasan penolakan (opsional):`,
      'Bukti transfer tidak valid / dana belum masuk'
    );

    if (reason === null) return;

    try {
      setApprovingId(trx.orderId);
      const res = await billingService.rejectTransaction(trx.orderId, adminKey, reason);
      if (res?.success) {
        alert(`❌ ${res.message || 'Transaksi berhasil ditolak.'}`);
        fetchTransactions(adminKey);
      } else {
        throw new Error(res?.message || 'Gagal menolak transaksi.');
      }
    } catch (err) {
      alert('Gagal menolak transaksi: ' + (err?.message || String(err)));
    } finally {
      setApprovingId(null);
    }
  };


  // Hitung ringkasan pendapatan
  const totalRevenue = transactions
    .filter((t) => t.status === 'PAID')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const paidCount = transactions.filter((t) => t.status === 'PAID').length;

  // Filter daftar transaksi
  const filteredTransactions = transactions.filter((t) => {
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchStatus;
    const matchSearch =
      t.orderId?.toLowerCase().includes(q) ||
      t.tenant?.businessName?.toLowerCase().includes(q) ||
      String(t.tenant?.waNumber || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
    

  // Layar Kunci Sebelum Masuk Panel Super Admin
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-4 font-sans">
        <form
          onSubmit={handleUnlock}
          className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-xl">
            🔐
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white m-0">Super Admin Billing</h2>
            <p className="text-xs text-slate-400 m-0 mt-1">
              Masukkan Kunci Rahasia Admin untuk mengelola pembayaran langganan tenant.
            </p>
          </div>
          <input
            type="password"
            required
            placeholder="Masukkan ADMIN_SECRET_KEY..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            {loading ? '⏳ Memverifikasi...' : '🔓 Buka Panel Pembayaran'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-[#f8fafc] font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-white m-0">
              👑 Panel Approval Pembayaran SaaS
            </h1>
            <p className="text-xs text-slate-400 m-0 mt-1">
              Verifikasi transfer masuk dari pelanggan dan aktifkan paket secara instan.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => fetchTransactions(adminKey)}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {loading ? '🔄 Memuat...' : '🔄 Refresh Data'}
            </button>
            <button
              type="button"
              onClick={handleLock}
              className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              🔒 Kunci
            </button>
          </div>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
            <span className="text-xs text-slate-400">Menunggu Konfirmasi (PENDING)</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount} Invoice</div>
          </div>
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
            <span className="text-xs text-slate-400">Total Transaksi Berhasil</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{paidCount} Lunas</div>
          </div>
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
            <span className="text-xs text-slate-400">Total Pendapatan Masuk</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                     <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'PAID', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-sky-600 text-white'
                    : 'bg-[#0f172a] text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'PENDING'
                  ? '⏳ Pending'
                  : st === 'PAID'
                  ? '✅ Lunas'
                  : '❌ Ditolak'}
              </button>
            ))}
          </div>


          <input
            type="text"
            placeholder="🔍 Cari No. Invoice atau Nama Bisnis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white outline-none focus:border-sky-500 sm:w-72"
          />
        </div>

        {/* Tabel Transaksi */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 uppercase text-[11px]">
                  <th className="py-3.5 px-4">No. Invoice & Waktu</th>
                  <th className="py-3.5 px-4">Bisnis / Tenant</th>
                  <th className="py-3.5 px-4">Detail Paket</th>
                  <th className="py-3.5 px-4">Nominal Transfer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-500 italic">
                    Tidak ada data transaksi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const formattedAmount = `Rp ${Number(trx.amount || 0).toLocaleString('id-ID')}`;
                  const cleanWa = String(trx.tenant?.waNumber || '').replace(/[^0-9]/g, '');
                  const waUrlObj = new URL('https://whatsapp.com');
                  waUrlObj.searchParams.set('phone', cleanWa);
                  waUrlObj.searchParams.set(
                    'text',
                    `Halo *${trx.tenant?.businessName || 'Kak'}*, pembayaran invoice *${trx.orderId}* sebesar *${formattedAmount}* telah kami terima.\n\nPaket langganan Anda untuk *${trx.salesQuota} Akun Sales (${trx.months} Bulan)* sudah aktif kembali. Terima kasih! 🙏`
                  );
                  const waNotifyUrl = waUrlObj.toString();

                  const waRejectUrlObj = new URL('https://wa.me' + cleanWa);
                  waRejectUrlObj.searchParams.set(
                    'text',
                    `Halo *${trx.tenant?.businessName || 'Kak'}*, mohon maaf pengajuan pembayaran invoice *${trx.orderId}* sebesar *${formattedAmount}* belum dapat kami setujui (DITOLAK) karena dana transfer belum terverifikasi.\n\nSilakan lakukan konfirmasi ulang dengan melampirkan bukti transfer yang valid atau hubungi admin kami. Terima kasih 🙏`
                  );
                  const waRejectUrl = waRejectUrlObj.toString();

              
                    return (
                                            <tr key={trx.transactionId} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-white">{trx.orderId}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(trx.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">
                            {trx.tenant?.businessName || '-'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            +{trx.tenant?.waNumber || '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                            {trx.salesQuota} Sales • {trx.months} Bulan
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white">
                          Rp {Number(trx.amount).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              trx.status === 'PAID'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {trx.status}
                          </span>
                        </td>

                                             <td className="py-3.5 px-4 text-right">
                       {trx.status === 'PENDING' ? (
                         <div className="flex items-center justify-end gap-2">
                           <button
                             type="button"
                             disabled={approvingId === trx.orderId}
                             onClick={() => handleApprove(trx)}
                             className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer shadow-md disabled:opacity-50"
                           >
                             {approvingId === trx.orderId
                               ? '⏳ Memproses...'
                               : '✅ Setujui & Aktifkan'}
                           </button>

                           <button
                             type="button"
                             disabled={approvingId === trx.orderId}
                             onClick={() => handleReject(trx)}
                             className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/35 font-bold rounded-lg text-[11px] transition-all cursor-pointer disabled:opacity-50"
                           >
                             ❌ Tolak
                           </button>
                         </div>
                       ) : trx.status === 'REJECTED' ? (
                         <a
                           href={waRejectUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-block px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-semibold no-underline transition-colors"
                         >
                           📲 Kabari Penolakan via WA
                         </a>
                       ) : (
                         <a
                           href={waNotifyUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sky-300 rounded-lg text-[11px] font-semibold no-underline"
                         >
                           📲 Kabari via WA
                         </a>
                       )}
                     </td>

                        {/* <td className="py-3.5 px-4 text-right">
                          {trx.status === 'PENDING' ? (
                            <button
                              type="button"
                              disabled={approvingId === trx.orderId}
                              onClick={() => handleApprove(trx)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer shadow-md disabled:opacity-50"
                            >
                              {approvingId === trx.orderId
                                ? '⏳ Memproses...'
                                : '✅ Setujui & Aktifkan'}
                            </button>
                          ) : (
                            <a
                              href={waNotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sky-300 rounded-lg text-[11px] font-semibold no-underline"
                            >
                              📲 Kabari via WA
                            </a>
                          )}
                        </td> */}
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