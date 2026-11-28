import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { userService } from '../../api/userService';
import ManageSalesModal from '../chatbot/components/ManageSalesModal'; // sesuaikan path-nya

function getStoredUser() {
  try {
    const raw = localStorage.getItem('saas_user');
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Gagal membaca saas_user dari localStorage:', err);
    return {};
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenantData, setTenantData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // State Mode Edit Profil
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    ownerName: '',
    recoveryEmail: '',
    address: '',
  });

  const handleToggleSales = async (targetUser) => {
    try {
      setTogglingUserId(targetUser.userId || targetUser.id);
      const res = await userService.toggleSalesStatus(targetUser.userId || targetUser.id);
      if (res?.success) {
        // Panggil ulang fungsi pemuat data halaman Setting Anda di sini
        await fetchSettingsData();
      }
    } catch (err) {
      alert(typeof err === 'string' ? err : err?.message || 'Gagal mengubah status sales.');
    } finally {
      setTogglingUserId(null);
    }
  };


  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchTenantSettings = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError('');
      }

      const res = await axiosInstance.get('/api/tenant/get');
      if (!isMountedRef.current) return;

      if (res.data?.success) {
        const tenant = res.data.data?.tenant || null;
        const user = res.data.data?.user || null;
        setTenantData(tenant);
        setCurrentUser(user);

        setFormData({
          businessName: tenant?.businessName || '',
          businessType: tenant?.businessType || '',
          ownerName: user?.name || '',
          recoveryEmail: tenant?.recoveryEmail || '',
          address: tenant?.address || '',
        });
      } else {
        setError(res.data?.message || 'Gagal memuat data tenant.');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(
        err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil data pengaturan.'
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTenantSettings();
  }, [fetchTenantSettings]);

  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '...' }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSaveProfile = async (e) => {
  e.preventDefault();
  const payload = {
    businessName: formData.businessName.trim(),
    businessType: formData.businessType.trim(),
    ownerName: formData.ownerName.trim(),
    recoveryEmail: formData.recoveryEmail.trim(),
    address: formData.address.trim(),
  };

  try {
    setSaving(true);
    const res = await axiosInstance.put('/api/tenant/update', payload);

    if (res.data?.success) {
      const savedUser = getStoredUser();
      localStorage.setItem(
        'saas_user',
        JSON.stringify({
          ...savedUser,
          name: payload.ownerName,
          businessName: payload.businessName,
        })
      );

      // ✅ Ganti alert sukses dengan custom toast
      setToast({
        type: 'success',
        message: res.data.message || 'Profil bisnis berhasil diperbarui.',
      });

      setIsEditing(false);
      await fetchTenantSettings();
    } else {
      // ✅ Ganti alert gagal dengan custom toast
      setToast({
        type: 'error',
        message: res.data?.message || 'Gagal menyimpan perubahan.',
      });
    }
  } catch (err) {
    // ✅ Ganti alert error dengan custom toast
    setToast({
      type: 'error',
      message:
        err.response?.data?.message ||
        'Terjadi kesalahan saat menyimpan profil.',
    });
  } finally {
    if (isMountedRef.current) {
      setSaving(false);
    }
  }
};

  const handleCancelEdit = () => {
    setFormData({
      businessName: tenantData?.businessName || '',
      businessType: tenantData?.businessType || '',
      ownerName: currentUser?.name || '',
      recoveryEmail: tenantData?.recoveryEmail || '',
      address: tenantData?.address || '',
    });
    setIsEditing(false);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmBusinessInput, setConfirmBusinessInput] = useState('');
  const [deletingTenant, setDeletingTenant] = useState(false);

  const handleDeleteTenant = async () => {
      const targetName = tenantData?.businessName || '';
      if (confirmBusinessInput.trim() !== targetName.trim()) {
        alert(`Ketik "${targetName}" dengan persis untuk mengonfirmasi penghapusan.`);
        return;
      }

      try {
        setDeletingTenant(true);
        const res = await axiosInstance.delete('/api/tenant/delete', {
          data: { confirmBusinessName: confirmBusinessInput },
        });

        if (res.data?.success) {
          alert(res.data.message);
          localStorage.removeItem('saas_token');
          localStorage.removeItem('saas_user');
          window.location.href = '/';
        } else {
          alert(res.data?.message || 'Gagal menghapus data bisnis.');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Terjadi kesalahan saat menghapus workspace.');
      } finally {
        setDeletingTenant(false);
      }
  };

    const [togglingUserId, setTogglingUserId] = useState(null);
  const [isManageSalesOpen, setIsManageSalesOpen] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const handleToggleSalesStatus = async (u) => {
    const targetId = u.userId || u.id || u._id;
    if (!targetId) return;

    try {
      setTogglingUserId(targetId);
      const res = await userService.toggleSalesStatus(targetId);
      if (res?.success) {
        window.location.reload();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: typeof err === 'string' ? err : err?.message || 'Gagal mengubah status sales.',
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  // Dipanggil saat tombol "Ya, Hapus Agen" di modal custom diklik
  const executeDeleteSalesUser = async () => {
    if (!confirmDeleteUser) return;
    const targetId = confirmDeleteUser.userId || confirmDeleteUser.id || confirmDeleteUser._id;

    try {
      setTogglingUserId(targetId);
      const res = await userService.deleteSales(targetId);
      if (res?.success) {
        setConfirmDeleteUser(null);
        window.location.reload();
      }
    } catch (err) {
      setConfirmDeleteUser(null);
      setToast({
        type: 'error',
        message: typeof err === 'string' ? err : err?.message || 'Gagal menghapus sales.',
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const usersList = Array.isArray(tenantData?.users) ? tenantData.users : [];
  const activeSalesCount = usersList.filter(
    (item) => item.role?.toUpperCase() === 'SALES' && item.isActive
  ).length;

 
  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-5xl mx-auto w-full text-left text-[#f8fafc] pb-24 lg:pb-10">

      {/* ✅ NOTIFIKASI TOAST TEMA GELAP */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0f172a] border border-white/10 shadow-2xl transition-all duration-300">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {toast.type === 'success' ? '✓' : '✕'}
          </div>
      
          <div className="pr-2 text-left">
            <p className="text-xs font-semibold text-gray-400 m-0">
              {toast.type === 'success' ? 'Berhasil' : 'Terjadi Kesalahan'}
            </p>
            <p className="text-sm font-medium text-white m-0">
              {toast.message}
            </p>
          </div>
      
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-500 hover:text-white text-sm ml-2 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Header Halaman */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white m-0">
          🏢 Setting Bisnis &amp; Anggota
        </h2>
        <p className="text-xs text-slate-400 m-0 mt-1">
          Informasi profil workspace bisnis, email pemulihan, dan daftar pengguna
          terdaftar.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          ⏳ Memuat data pengaturan bisnis...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      ) : (
        <>
          {/* KARTU 1: INFORMASI / EDIT PROFIL WORKSPACE TENANT */}
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-6 mb-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white m-0">
                📋 Profil Workspace Tenant
              </h3>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg font-mono">
                  ID: {tenantData?.tenantCode || '-'}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    ✏️ Edit Profil
                  </button>
                )}
              </div>
            </div>

            {!isEditing ? (
              /* MODE BACA */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5">
                  <span className="text-slate-400 block mb-1">
                    Nama Bisnis / Workspace
                  </span>
                  <span className="text-sm font-bold text-white">
                    {tenantData?.businessName || '-'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5">
                  <span className="text-slate-400 block mb-1">
                    Tipe Bisnis &amp; Paket
                  </span>
                  <span className="text-sm font-bold text-sky-400">
                    {tenantData?.businessType || 'UMUM'} •{' '}
                    {tenantData?.tenantType || '-'} ({tenantData?.status || '-'})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5">
                  <span className="text-slate-400 block mb-1">
                    Pemilik (Owner) Saat Ini
                  </span>
                  <span className="text-sm font-bold text-white">
                    {currentUser?.name || '-'} (+
                    {currentUser?.phoneNumber || '-'})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20">
                  <span className="text-emerald-300 block mb-1">
                    🛡️ Email Pemulihan Akun
                  </span>
                  <span className="text-sm font-bold text-white">
                    {tenantData?.recoveryEmail || (
                      <span className="text-amber-400 italic font-normal">
                        Belum diatur
                      </span>
                    )}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-900/90 border border-white/5">
                  <span className="text-slate-400 block mb-1">Alamat Bisnis</span>
                  <span className="text-sm text-slate-200">
                    {tenantData?.address || '-'}
                  </span>
                </div>
              </div>
            ) : (
              /* MODE EDIT */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Bisnis / Workspace
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tipe / Kategori Bisnis
                    </label>
                    <input
                      type="text"
                      value={formData.businessType}
                      onChange={(e) =>
                        setFormData({ ...formData, businessType: e.target.value })
                      }
                      placeholder="Contoh: Food & Drink, Retail, Jasa"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Pemilik (Owner)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) =>
                        setFormData({ ...formData, ownerName: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 mb-1.5">
                      🛡️ Email Pemulihan Akun (Cadangan Jika HP Hilang)
                    </label>
                    <input
                      type="email"
                      value={formData.recoveryEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recoveryEmail: e.target.value,
                        })
                      }
                      placeholder="contoh: owner@bisnisanda.com"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/35 text-white text-sm outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Alamat Bisnis
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Alamat lengkap toko atau kantor..."
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}
          </div>

                     {/* KARTU 2: DAFTAR USER DI DALAM TENANT */}
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white m-0">
                👥 Daftar Pengguna Terdaftar ({usersList.length})
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  Kuota Sales: <strong>{tenantData?.maxSales ?? '-'}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setIsManageSalesOpen(true)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  + Tambah / Kelola Sales
                </button>
              </div>
            </div>

            {/* Banner Peringatan Jika Kuota Penuh / Error */}
            {/* {actionFeedback && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <span>⚠️ {actionFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setActionFeedback(null)}
                  className="text-amber-400 hover:text-white font-bold ml-3 cursor-pointer bg-transparent border-0"
                >
                  ✕
                </button>
              </div>
            )} */}

            {usersList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada data pengguna.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Nama</th>
                      <th className="py-2.5 px-3 font-semibold">Nomor WhatsApp</th>
                      <th className="py-2.5 px-3 font-semibold">Role</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u, idx) => {
                      const uId = u.userId || u.id || u._id;
                      const isSales = u.role?.toUpperCase() === 'SALES';
                      const isMaxReached = !u.isActive && activeSalesCount >= (tenantData?.maxSales ?? 1);
                    
                      return (
                        <tr
                          key={uId || u.phoneNumber || idx}
                          className={`hover:bg-white/[0.02] ${!u.isActive ? 'opacity-70' : ''}`}
                        >
                          <td className="py-3 px-3 font-semibold text-white">
                            {u.name || '-'}
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono">
                            +{u.phoneNumber || '-'}
                          </td>
                          <td className="py-3 px-3 text-sky-300">
                            {u.role || 'USER'}
                          </td>
                          <td className="py-3 px-3">
                            {u.isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-white/10">
                                Nonaktif
                              </span>
                            )}
                          </td>
                          
                          <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                            {isSales ? (
                              <>
                                <button
                                  type="button"
                                  disabled={togglingUserId === uId || isMaxReached}
                                  title={
                                    isMaxReached
                                      ? 'Kuota sales aktif penuh. Nonaktifkan salah satu sales terlebih dahulu.'
                                      : ''
                                  }
                                  onClick={() => handleToggleSalesStatus(u)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                    isMaxReached
                                      ? 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed opacity-50'
                                      : u.isActive
                                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/25 cursor-pointer'
                                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30 cursor-pointer'
                                  }`}
                                >
                                  {togglingUserId === uId
                                    ? '⏳...'
                                    : u.isActive
                                      ? '⏸ Nonaktifkan'
                                      : '▶️ Aktifkan'}
                                </button>
                                  
                                <button
                                  type="button"
                                  disabled={togglingUserId === uId}
                                  onClick={() => setConfirmDeleteUser(u)}
                                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                >
                                  🗑️ Hapus
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                Akun Utama
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          {/* Modal Tambah / Kelola Sales */}
          <ManageSalesModal
            isOpen={isManageSalesOpen}
            onClose={() => setIsManageSalesOpen(false)}
            onRefreshList={() => window.location.reload()}
          />

          {/* Modal Konfirmasi Hapus Agen Custom */}
          {confirmDeleteUser && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
              onClick={() => setConfirmDeleteUser(null)}
            >
              <div
                className="bg-[#0f172a] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-lg shrink-0">
                    🗑️
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white m-0">
                      Hapus Agen Sales?
                    </h3>
                    <p className="text-xs text-slate-400 m-0 mt-0.5">
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed m-0 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  Apakah Anda yakin ingin menghapus <strong className="text-white">{confirmDeleteUser.name}</strong> (+{confirmDeleteUser.phoneNumber}) dari daftar tim sales?
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteUser(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(togglingUserId)}
                    onClick={executeDeleteSalesUser}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-rose-600/25 disabled:opacity-50"
                  >
                    {togglingUserId ? '⏳ Menghapus...' : 'Ya, Hapus Agen'}
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* KARTU 2: DAFTAR USER DI DALAM TENANT
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white m-0">
                👥 Daftar Pengguna Terdaftar ({usersList.length})
              </h3>
              <span className="text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg">
                Kuota Sales: {tenantData?.maxSales ?? '-'}
              </span>
            </div>

            {usersList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada data pengguna.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Nama</th>
                      <th className="py-2.5 px-3 font-semibold">Nomor WhatsApp</th>
                      <th className="py-2.5 px-3 font-semibold">Role</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u, idx) => (
                      <tr
                        key={u.id || u._id || u.phoneNumber || idx}
                        className="hover:bg-white/[0.02]"
                      >
                        <td className="py-3 px-3 font-semibold text-white">
                          {u.name || '-'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          +{u.phoneNumber || '-'}
                        </td>
                        <td className="py-3 px-3 text-sky-300">
                          {u.role || 'USER'}
                        </td>
                        <td className="py-3 px-3">
                          {u.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-white/10">
                              Nonaktif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div> */}

        {/* KARTU 3: ZONA BERBAHAYA - HAPUS PERMANEN SEMUA DATA TENANT */}
        {currentUser?.role?.toUpperCase() === 'OWNER' && (
         <div className="mt-6 bg-red-950/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h3 className="text-base font-bold text-red-400 m-0">
                 ⚠️ Zona Berbahaya: Berhenti Sewa &amp; Hapus Semua Data
               </h3>
               <p className="text-xs text-slate-400 m-0 mt-1 leading-relaxed max-w-xl">
                 Tindakan ini akan memutuskan koneksi bot WhatsApp dan <strong>menghapus permanen</strong> seluruh data bisnis, akun pemilik &amp; sales, konfigurasi chatbot AI, serta database leads Anda. Data yang sudah dihapus tidak dapat dikembalikan.
               </p>
             </div>

             <button
               type="button"
               onClick={() => {
                 setConfirmBusinessInput('');
                 setShowDeleteModal(true);
               }}
               className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition cursor-pointer shrink-0"
             >
               🗑️ Hapus Semua Data Tenant
             </button>
           </div>
         </div>
       )}

       {/* MODAL KONFIRMASI HAPUS PERMANEN */}
       {showDeleteModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#0f172a] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
             <h3 className="text-lg font-extrabold text-red-400 m-0">
               🚨 Konfirmasi Hapus Permanen
             </h3>
             <p className="text-xs text-slate-300 leading-relaxed m-0">
               Seluruh data untuk bisnis <strong className="text-white">{tenantData?.businessName}</strong> akan dihapus permanen dari server dan sisa masa aktif langganan akan hangus.
             </p>
             <div>
               <label className="block text-xs text-slate-400 mb-1.5">
                 Ketik <strong className="text-white select-all">{tenantData?.businessName}</strong> di bawah ini untuk melanjutkan:
               </label>
               <input
                 type="text"
                 value={confirmBusinessInput}
                 onChange={(e) => setConfirmBusinessInput(e.target.value)}
                 placeholder={tenantData?.businessName}
                 className="w-full p-2.5 rounded-xl bg-slate-900 border border-red-500/40 text-white text-sm outline-none"
               />
             </div>
             <div className="flex justify-end gap-2.5 pt-2">
               <button
                 type="button"
                 onClick={() => setShowDeleteModal(false)}
                 disabled={deletingTenant}
                 className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
               >
                 Batal
               </button>
               <button
                 type="button"
                 onClick={handleDeleteTenant}
                 disabled={
                   deletingTenant ||
                   confirmBusinessInput.trim() !== (tenantData?.businessName || '').trim()
                 }
                 className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
               >
                 {deletingTenant ? '⏳ Menghapus...' : 'Ya, Hapus Permanen'}
               </button>
             </div>
           </div>
         </div>
       )}
        </>
      )}
    </div>
  );
}
