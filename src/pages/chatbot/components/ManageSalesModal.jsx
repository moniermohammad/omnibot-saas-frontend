import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../../../api/userService';

export default function ManageSalesModal({
  isOpen = true,
  onClose,
  salesList = [],
  onRefreshList,
  isInline = false,
}) {
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);
  const [allSales, setAllSales] = useState([]);
  const [maxSlots, setMaxSlots] = useState(2);

  const savedUser = localStorage.getItem('saas_user');
  const loggedInUser = savedUser ? JSON.parse(savedUser) : null;
  const tenantType = loggedInUser?.tenantType || 'PERSONAL';

  const loadFullSales = useCallback(async () => {
    try {
      const res = await userService.getTenantSalesList(true);
      const list = Array.isArray(res?.data) ? res.data : salesList;
      setAllSales(list);
      if (res?.maxSales) setMaxSlots(Number(res.maxSales));
    } catch (err) {
      setAllSales(salesList);
    }
  }, [salesList]);

  useEffect(() => {
    if (isInline || isOpen) {
      loadFullSales();
    }
  }, [isInline, isOpen, loadFullSales]);

  if (!isInline && !isOpen) return null;

  const activeCount = allSales.filter((s) => s.isActive !== false).length;
  const isSlotFull = activeCount >= maxSlots;

  const formatErrorMessage = (err, fallback) =>
    typeof err === 'string'
      ? err
      : err?.response?.data?.message || err?.message || fallback;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSlotFull) {
      setError(
        `🚫 Kuota sales aktif penuh (${activeCount}/${maxSlots}). Nonaktifkan salah satu sales terlebih dahulu.`
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let finalizedPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
      if (finalizedPhone.startsWith('0')) {
        finalizedPhone = '62' + finalizedPhone.slice(1);
      }

      if (finalizedPhone.length < 10 || finalizedPhone.length > 15) {
        setError('⚠️ Panjang nomor WhatsApp tidak valid (10-15 digit).');
        setLoading(false);
        return;
      }

      const response = await userService.addSalesByOwner({
        name: formData.name.trim(),
        phoneNumber: finalizedPhone,
      });

      if (response?.success) {
        setFormData({ name: '', phoneNumber: '' });
        await loadFullSales();
        onRefreshList?.();
      }
    } catch (err) {
      setError(formatErrorMessage(err, 'Gagal menambahkan sales.'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (sales) => {
    const id = sales.userId || sales.id;
    const isCurrentlyActive = sales.isActive !== false;

    if (!isCurrentlyActive && activeCount >= maxSlots) {
      setError(
        `🚫 Kuota maksimal ${maxSlots} Sales aktif. Nonaktifkan salah satu sales terlebih dahulu sebelum mengaktifkan "${sales.name}".`
      );
      return;
    }

    try {
      setError(null);
      setTogglingId(id);
      const res = await userService.toggleSalesStatus(id);
      if (res?.success) {
        await loadFullSales();
        onRefreshList?.();
      }
    } catch (err) {
      setError(formatErrorMessage(err, 'Gagal mengubah status sales.'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (userId, fullSalesText) => {
    const salesName = String(fullSalesText || 'sales').split(' (')[0];
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus "${salesName}" dari tim sales?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await userService.deleteSales(userId);
      if (response?.success) {
        await loadFullSales();
        onRefreshList?.();
      }
    } catch (err) {
      alert(formatErrorMessage(err, 'Gagal menghapus sales.'));
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div
      style={isInline ? undefined : { maxWidth: '720px', width: '100%' }}
      className={`relative bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col text-left ${
        isInline ? 'w-full' : 'mx-auto max-h-[85vh] overflow-y-auto'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tombol Close hanya muncul jika mode Modal */}
      {!isInline && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer bg-transparent border-0"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div
        className={`flex items-center justify-between mb-5 border-b border-white/5 pb-3 ${
          !isInline ? 'pr-6' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 text-base">
            👥
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">
              Manajemen Tim Sales
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Atur anggota tim sales yang aktif menerima leads sesuai kuota paket Anda.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            Kuota Paket
          </span>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-md font-bold text-xs uppercase shadow-sm">
            🚀 {maxSlots} Sales ({tenantType})
          </span>
        </div>
      </div>

      {/* Form Input Agen Baru */}
      <form
        onSubmit={handleSubmit}
        className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 mb-6"
      >
        <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider m-0 mb-1">
          ➕ Daftarkan Agen Baru
        </h4>

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            disabled={isSlotFull}
            placeholder={isSlotFull ? 'Kuota Aktif Penuh' : 'Nama Lengkap Agen'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-10 px-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-40"
          />
          <input
            type="text"
            required
            disabled={isSlotFull}
            placeholder={
              isSlotFull ? 'Kuota Aktif Penuh' : 'Nomor WhatsApp (Contoh: 628123...)'
            }
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="w-full h-10 px-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-40"
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
          {isSlotFull
            ? '🚫 Slot Sales Aktif Penuh'
            : loading
              ? '⏳ Memproses...'
              : '💾 Tambahkan ke Tim'}
        </button>
      </form>

      {/* Tabel Semua Anggota Sales */}
      <div className="flex flex-col flex-1 min-h-[200px]">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider m-0">
            📋 Daftar Tim Sales ({allSales.length} Terdaftar)
          </h4>
          <span
            className={`text-[11px] font-bold ${
              isSlotFull ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            Slot Aktif: <span className="underline">{activeCount}</span> /{' '}
            <span className="font-extrabold">{maxSlots}</span>
          </span>
        </div>

        <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/10">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">WhatsApp</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {allSales.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-500 italic"
                  >
                    Belum ada agen sales terdaftar.
                  </td>
                </tr>
              ) : (
                allSales.map((sales) => {
                  const salesId = sales.userId || sales.id;
                  const matches = sales.name?.match(/^(.+?)\s*\((.+?)\)$/);
                  const displayName = matches ? matches[1] : sales.name;
                  const displayPhone =
                    sales.phoneNumber || (matches ? matches[2] : '-');
                  const isActive = sales.isActive !== false;

                  return (
                    <tr
                      key={salesId || displayPhone}
                      className={`hover:bg-white/[0.01] transition-colors ${
                        !isActive ? 'opacity-65' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-white">
                        {displayName || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {displayPhone}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            🟢 Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-white/10">
                            ⚫ Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={togglingId === salesId || loading}
                          onClick={() => handleToggleStatus(sales)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                            isActive
                              ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {togglingId === salesId
                            ? '⏳...'
                            : isActive
                              ? 'Nonaktifkan'
                              : 'Aktifkan'}
                        </button>
                        <button
                          type="button"
                          disabled={loading || togglingId === salesId}
                          onClick={() => handleDelete(salesId, sales.name)}
                          className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
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
  );

  if (isInline) return cardContent;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        {cardContent}
      </div>
    </div>,
    document.body
  );
}