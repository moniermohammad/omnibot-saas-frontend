import React, { useState, useEffect } from 'react';
import { billingService } from '../api/billingService';
import qrisDefault from '../assets/Qris.jpeg';
// import qrisDefault from '../assets/Qris.png';


export default function BillingModal({ isOpen, onClose, tenant, currentSalesCount }) {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [pendingTrx, setPendingTrx] = useState(null);

  // ✅ Simpan jumlah sales aktif real-time & detail tenant terbaru
  // const [actualActiveSales, setActualActiveSales] = useState(
  //   Math.max(1, Number(currentSalesCount) || 1)
  // );
  const [actualActiveSales, setActualActiveSales] = useState(
   Math.max(1, Number(currentSalesCount) || 1)
  );
  const [freshTenant, setFreshTenant] = useState(tenant || {});

  const [billingSetting, setBillingSetting] = useState({
    pricePerSales: 49000,
    bankName: 'BCA a.n. OmniBot Engine',
    bankAccount: '1234567890',
    qrisImageUrl: '/qris-pembayaran.png',
    adminWaNumber: '628558836680',
  });

  const [plans, setPlans] = useState([
    { planId: '1M', name: '1 Bulan', months: 1, discount: 0, badge: null },
    { planId: '3M', name: '3 Bulan', months: 3, discount: 0.1, badge: 'HEMAT 10%' },
    { planId: '1Y', name: '1 Tahun', months: 12, discount: 0.2, badge: 'HEMAT 20%' },
  ]);

  const minSalesAllowed = Math.max(1, actualActiveSales);
  const [salesQuota, setSalesQuota] = useState(minSalesAllowed);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [copiedRek, setCopiedRek] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [qrisError, setQrisError] = useState(false);
  const [zoomQris, setZoomQris] = useState(false);



  useEffect(() => {
    if (!isOpen) {
      setZoomQris(false);
      return;
    }

    setFreshTenant(tenant || {});
    const initialCount = Math.max(1, Number(currentSalesCount) || 1);
    setActualActiveSales(initialCount);
    setSalesQuota(initialCount);
    setQrisError(false);

    const loadBillingData = async () => {
      try {
        setLoadingConfig(true);
        setErrorMessage('');
        setPendingTrx(null);
    
        const res = await billingService.getPlans();
        if (res?.success) {
          if (res.setting) setBillingSetting(res.setting);
          if (res.plans?.length > 0) {
            setPlans(res.plans);
            setSelectedPlan(res.plans[0]);
          }
          // ✅ Jika API billing mengembalikan jumlah sales aktif & tenant terbaru, sinkronkan otomatis!
          if (typeof res.activeSalesCount === 'number') {
            const syncedCount = Math.max(1, res.activeSalesCount);
            setActualActiveSales(syncedCount);
            setSalesQuota(syncedCount);
          }
          if (res.tenant) {
            setFreshTenant((prev) => ({ ...prev, ...res.tenant }));
          }
          if (res.pendingTransaction) {
            setPendingTrx(res.pendingTransaction);
          }
        }
      } catch (err) {
        console.error('Gagal memuat konfigurasi paket:', err);
      } finally {
        setLoadingConfig(false);
      }
    };

    loadBillingData();
  }, [isOpen, currentSalesCount, tenant]);

  if (!isOpen) return null;

  const activePlan = selectedPlan || plans[0];
  const rawTotal = salesQuota * billingSetting.pricePerSales * activePlan.months;
  const totalPrice = Math.round(rawTotal * (1 - (activePlan.discount || 0)));
  const formattedPrice = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  const activeQrisSrc =
    billingSetting?.qrisImageUrl &&
    !billingSetting.qrisImageUrl.includes('qris-pembayaran.png') &&
    !qrisError
      ? billingSetting.qrisImageUrl
      : qrisDefault;

  const handleCopyRek = () => {
    navigator.clipboard?.writeText(billingSetting.bankAccount);
    setCopiedRek(true);
    setTimeout(() => setCopiedRek(false), 2000);
  };

  const handleCopyNominal = () => {
    navigator.clipboard?.writeText(String(totalPrice));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  const handleCheckoutAndConfirm = async () => {
    try {
      setSubmitting(true);
      const activeTenantId = freshTenant?.tenantId || tenant?.tenantId;
      const activeTenantCode =
        freshTenant?.tenantCode || tenant?.tenantCode || activeTenantId || '-';

      const res = await billingService.createCheckout({
        tenantId: activeTenantId,
        tenantCode: activeTenantCode,
        salesQuota,
        planId: activePlan.planId,
        paymentMethod: 'MANUAL',
      });

      const orderId = res?.transaction?.orderId || `MANUAL-${Date.now()}`;

      const confirmMessage = encodeURIComponent(
        `Halo Kak, saya ingin konfirmasi pembayaran langganan:\n\n` +
          `• *No. Invoice:* ${orderId}\n` +
          `• *Bisnis:* ${freshTenant?.businessName || tenant?.businessName || '-'}\n` +
          `• *Tenant ID:* ${activeTenantCode}\n` +
          `• *Kuota Akun Sales:* ${salesQuota} Sales\n` +
          `• *Durasi Paket:* ${activePlan.name}\n` +
          `• *Total Transfer:* ${formattedPrice}\n\n` +
          `_Berikut saya lampirkan bukti transfernya._`
      );

      const cleanWa = String(billingSetting.adminWaNumber || '').replace(/\D/g, '');
      window.open(`https://wa.me/${cleanWa}?text=${confirmMessage}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setErrorMessage(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left space-y-4 my-auto">
      {/* HEADER MODAL */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white m-0">💳 Atur Kuota Sales &amp; Paket</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            Tarif:{' '}
            <strong className="text-sky-400">
              Rp {Number(billingSetting?.pricePerSales || 0).toLocaleString('id-ID')}
            </strong>{' '}
            / akun sales / bulan
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* BANNER INVOICE TERTUNDA (DI DALAM KOTAK MODAL) */}
      {pendingTrx && (
        <div className="bg-amber-500/15 border border-amber-500/35 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>⏳</span>
              <span>Menunggu Konfirmasi Pembayaran</span>
            </div>
            <p className="text-[11px] text-slate-300 m-0 leading-relaxed">
              Invoice <strong className="font-mono text-white">{pendingTrx.orderId}</strong> (Rp{' '}
              {Number(pendingTrx.amount || 0).toLocaleString('id-ID')}) sedang menunggu verifikasi admin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const activeTenantCode =
                freshTenant?.tenantCode || tenant?.tenantCode || tenant?.tenantId || '-';
              const msg = encodeURIComponent(
                `Halo Kak, saya ingin konfirmasi ulang pembayaran invoice yang tertunda:\n\n` +
                  `• *No. Invoice:* ${pendingTrx.orderId}\n` +
                  `• *Bisnis:* ${freshTenant?.businessName || tenant?.businessName || '-'}\n` +
                  `• *Tenant ID:* ${activeTenantCode}\n` +
                  `• *Total Transfer:* Rp ${Number(pendingTrx.amount || 0).toLocaleString('id-ID')}\n\n` +
                  `_Berikut saya lampirkan bukti transfernya._`
              );
              const cleanWa = String(billingSetting?.adminWaNumber || '').replace(/\D/g, '');
              if (!cleanWa) {
                setErrorMessage('Nomor WhatsApp admin belum tersedia.');
                return;
              }
              window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank', 'noopener,noreferrer');
            }}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-[11px] shrink-0 cursor-pointer transition-all"
          >
            📲 Kirim Bukti WA
          </button>
        </div>
      )}

      {/* BANNER ERROR ELEGAN (DI DALAM KOTAK MODAL) */}
      {errorMessage && (
        <div className="bg-rose-500/15 border border-rose-500/35 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <div className="flex-1 text-xs text-rose-200 leading-relaxed">
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-300 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {loadingConfig ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          ⏳ Memuat tarif &amp; paket langganan...
        </div>
      ) : (
        <>
          <div className="bg-[#1e293b]/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">👥 Jumlah Kuota Akun Sales</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Sales aktif saat ini: <strong className="text-cyan-400">{actualActiveSales} Sales</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={salesQuota <= minSalesAllowed}
                onClick={() => setSalesQuota((prev) => Math.max(minSalesAllowed, prev - 1))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                −
              </button>
              <span className="text-lg font-black text-white w-8 text-center">{salesQuota}</span>
              <button
                type="button"
                onClick={() => setSalesQuota((prev) => prev + 1)}
                className="w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {(Array.isArray(plans) ? plans : []).map((plan) => {
              const isSelected = activePlan?.planId === plan.planId;
              return (
                <button
                  key={plan.planId}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                      : 'bg-[#1e293b]/50 border-white/10 hover:border-white/25'
                  }`}
                >
                  {plan.badge && (
                    <span className="inline-block px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold rounded mb-1">
                      {plan.badge}
                    </span>
                  )}
                  <div className="text-xs font-bold text-white">{plan.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {salesQuota} Sales × {plan.months} bln
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-sky-300 font-semibold">
                Total Tagihan ({salesQuota} Sales • {activePlan?.name || '-'})
              </div>
              <div className="text-xl font-black text-white mt-0.5">{formattedPrice}</div>
            </div>
            <button
              type="button"
              onClick={handleCopyNominal}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              {copiedNominal ? '✅ Tersalin' : '📋 Salin Nominal'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* KOTAK SCAN QRIS (KLIK UNTUK PERBESAR) */}
            <div className="bg-[#1e293b]/60 border border-white/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
              <p className="text-[11px] font-semibold text-gray-300 m-0 mb-2">Scan QRIS</p>
              <button
                type="button"
                onClick={() => setZoomQris(true)}
                title="Klik untuk memperbesar QRIS"
                className="group relative w-32 h-32 bg-white rounded-lg p-1.5 flex items-center justify-center overflow-hidden border-0 cursor-zoom-in shadow-md transition-transform hover:scale-105"
              >
                <img
                  src={activeQrisSrc}
                  alt="QRIS OmniBot Engine"
                  onError={() => setQrisError(true)}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded">
                  🔍 Perbesar
                </span>
              </button>
            </div>

            {/* KOTAK TRANSFER BANK MANUAL */}
            <div className="bg-[#1e293b]/60 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] text-gray-400 m-0">Transfer Bank Manual</p>
                <p className="text-xs font-semibold text-sky-300 m-0 mt-1">
                  {billingSetting?.bankName}
                </p>
                <p className="text-base font-mono font-bold text-white m-0 mt-1">
                  {billingSetting?.bankAccount}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyRek}
                className="mt-3 w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedRek ? '✅ Nomor Tersalin' : '📋 Salin No. Rekening'}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleCheckoutAndConfirm}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm transition-all cursor-pointer"
          >
            {submitting ? '⏳ Membuat Invoice...' : `📲 Buat Invoice & Konfirmasi (${formattedPrice})`}
          </button>
        </>
      )}
    </div>
  </div>
);

   


}