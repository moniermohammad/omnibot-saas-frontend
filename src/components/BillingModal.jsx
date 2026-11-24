import React, { useState, useEffect } from 'react';
import { billingService } from '../api/billingService';
import qrisDefault from '../assets/Qris.jpeg';
// import qrisDefault from '../assets/Qris.png';


export default function BillingModal({ isOpen, onClose, tenant, currentSalesCount = 1 }) {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const minSalesAllowed = Math.max(1, currentSalesCount);
  const [salesQuota, setSalesQuota] = useState(minSalesAllowed);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [copiedRek, setCopiedRek] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [qrisError, setQrisError] = useState(false);
  const [zoomQris, setZoomQris] = useState(false); // <-- DIPINDAHKAN KE ATAS SINI

  useEffect(() => {
    if (!isOpen) {
      setZoomQris(false);
      return;
    }
    setSalesQuota(Math.max(1, currentSalesCount));
    setQrisError(false);

    const loadBillingData = async () => {
      try {
        setLoadingConfig(true);
        const res = await billingService.getPlans();
        if (res?.success) {
          if (res.setting) setBillingSetting(res.setting);
          if (res.plans?.length > 0) {
            setPlans(res.plans);
            setSelectedPlan(res.plans[0]);
          }
        }
      } catch (err) {
        console.error('Gagal memuat konfigurasi paket:', err);
      } finally {
        setLoadingConfig(false);
      }
    };

    loadBillingData();
  }, [isOpen, currentSalesCount]);

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
      const res = await billingService.createCheckout({
        tenantId: tenant?.tenantId,
        tenantCode: tenant?.tenantCode,
        salesQuota,
        planId: activePlan.planId,
        paymentMethod: 'MANUAL',
      });

      const orderId = res?.transaction?.orderId || `MANUAL-${Date.now()}`;

      const confirmMessage = encodeURIComponent(
        `Halo Kak, saya ingin konfirmasi pembayaran langganan:\n\n` +
          `• *No. Invoice:* ${orderId}\n` +
          `• *Bisnis:* ${tenant?.businessName || '-'}\n` +
          `• *Tenant ID:* ${tenant?.tenantCode || '-'}\n` +
          `• *Kuota Akun Sales:* ${salesQuota} Sales\n` +
          `• *Durasi Paket:* ${activePlan.name}\n` +
          `• *Total Transfer:* ${formattedPrice}\n\n` +
          `_Berikut saya lampirkan bukti transfernya._`
      );

      const cleanWa = String(billingSetting.adminWaNumber || '').replace(/\D/g, '');
      window.open(`https://wa.me/${cleanWa}?text=${confirmMessage}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Gagal membuat invoice pembayaran: ' + (err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };



   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left space-y-4 my-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white m-0">💳 Atur Kuota Sales &amp; Paket</h3>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Tarif:{' '}
              <strong className="text-sky-400">
                Rp {billingSetting.pricePerSales.toLocaleString('id-ID')}
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
                  Sales aktif saat ini: <strong className="text-cyan-400">{currentSalesCount} Sales</strong>
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
              {plans.map((plan) => {
                const isSelected = activePlan.planId === plan.planId;
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
                  Total Tagihan ({salesQuota} Sales • {activePlan.name})
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
                    {billingSetting.bankName}
                  </p>
                  <p className="text-base font-mono font-bold text-white m-0 mt-1">
                    {billingSetting.bankAccount}
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
              {submitting
                ? '⏳ Membuat Invoice...'
                : `📲 Buat Invoice & Konfirmasi (${formattedPrice})`}
            </button>
          </>
        )}
      </div>

      {/* OVERLAY ZOOM QRIS SAAT DIKLIK */}
      {zoomQris && (
        <div
          onClick={() => setZoomQris(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-extrabold text-slate-800">
                Scan QRIS • {formattedPrice}
              </span>
              <button
                type="button"
                onClick={() => setZoomQris(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-2 bg-white rounded-xl flex justify-center">
              <img
                src={activeQrisSrc}
                alt="QRIS OmniBot Engine Besar"
                className="w-72 h-auto object-contain rounded-lg"
              />
            </div>

            <p className="text-[11px] text-slate-500 m-0">
              Arahkan kamera aplikasi E-Wallet / Mobile Banking ke kode QR di atas, lalu klik{' '}
              <strong>Buat Invoice &amp; Konfirmasi</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );

}