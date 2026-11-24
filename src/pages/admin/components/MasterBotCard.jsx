import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { billingService } from "../../../api/billingService";

export default function MasterBotCard({ adminKey, refreshTrigger }) {
  const [masterBot, setMasterBot] = useState({
    status: "LOADING", // LOADING | ONLINE | QR_READY | OFFLINE_INITIALIZING | ERROR
    connectedPhone: null,
    qrCodeString: null,
    message: "Memeriksa status Master Bot...",
  });
  const [botActionLoading, setBotActionLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchMasterBotStatus = useCallback(async () => {
    if (!adminKey) return;
    try {
      const res = await billingService.getMasterBotQr(adminKey);
      if (res?.success) {
        setMasterBot({
          status: res.status,
          connectedPhone: res.connectedPhone || null,
          qrCodeString: res.qrCodeString || null,
          message: res.message || "",
        });

        // Tutup pop-up QR secara otomatis jika sudah berhasil ter-scan (ONLINE)
        if (res.status === "ONLINE") {
          setShowQrModal(false);
        }
      }
    } catch (err) {
      setMasterBot((prev) => ({
        ...prev,
        status: "ERROR",
        message:
          typeof err === "string" ? err : "Gagal memuat status Master Bot.",
      }));
    }
  }, [adminKey]);

  // Cek status saat pertama kali dibuka & saat tombol Refresh Data ditekan
  useEffect(() => {
    if (!adminKey) return;
    fetchMasterBotStatus();
  }, [adminKey, refreshTrigger, fetchMasterBotStatus]);

  // Auto-polling setiap 3 detik HANYA saat pop-up QR sedang dibuka (hemat resource!)
  useEffect(() => {
    if (!adminKey || !showQrModal) return;
    fetchMasterBotStatus();
    const interval = setInterval(fetchMasterBotStatus, 3000);
    return () => clearInterval(interval);
  }, [adminKey, showQrModal, fetchMasterBotStatus]);

  const handleDisconnectMasterBot = async () => {
    if (
      !window.confirm(
        "Putuskan sesi WhatsApp Master Bot saat ini? Anda perlu memindai ulang QR Code untuk mengaktifkannya kembali.",
      )
    ) {
      return;
    }
    try {
      setBotActionLoading(true);
      await billingService.disconnectMasterBot(adminKey);
      await fetchMasterBotStatus();
    } catch (err) {
      alert(
        typeof err === "string" ? err : "Gagal memutuskan koneksi Master Bot.",
      );
    } finally {
      setBotActionLoading(false);
    }
  };

  const isOnline = masterBot.status === "ONLINE";

  return (
    <>
      {/* 1. KARTU STATUS RINGKAS (Meniru gaya Status Perangkat WhatsApp) */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Ikon Perangkat */}
          <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-xl shrink-0">
            📱
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white m-0">
                Status Perangkat Master Bot (OTP)
              </h2>
              {/* Titik Indikator Hijau / Kuning */}
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
            </div>

            <p className="text-xs text-slate-400 m-0 mt-1">
              {isOnline ? (
                <>
                  Terhubung aktif (
                  <span className="font-mono text-slate-200">
                    {masterBot.connectedPhone}
                  </span>
                  ) - Siap mengirim OTP &amp; notifikasi SaaS.
                </>
              ) : (
                "Belum terhubung - Klik tombol hubungkan untuk memindai QR Code WhatsApp."
              )}
            </p>
          </div>
        </div>

        {/* Tombol Aksi di Kanan */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {isOnline ? (
            <button
              type="button"
              onClick={handleDisconnectMasterBot}
              disabled={botActionLoading}
              className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {botActionLoading ? "Memutuskan..." : "Putuskan Sesi Bot"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-600/20"
            >
              📷 Hubungkan &amp; Scan QR
            </button>
          )}

          <button
            type="button"
            onClick={fetchMasterBotStatus}
            className="px-3.5 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            🔄 Periksa Ulang
          </button>
        </div>
      </div>

      {/* 2. POP-UP MODAL QR CODE (Muncul saat tombol Hubungkan diklik) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center relative">
            {/* Tombol Tutup (X) */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <h3 className="text-base font-extrabold text-white m-0">
                Tautkan WhatsApp Master Bot
              </h3>
              <p className="text-xs text-slate-400 m-0 mt-1">
                Buka WhatsApp di HP Anda &rarr; <b>Perangkat Tertaut</b> &rarr;{" "}
                <b>Tautkan Perangkat</b>
              </p>
            </div>

            {/* Area Kotak QR Code */}
            <div className="flex flex-col items-center justify-center min-h-[210px]">
              {masterBot.status === "QR_READY" && masterBot.qrCodeString ? (
                <div className="bg-white p-3.5 rounded-2xl shadow-xl">
                  <QRCodeSVG value={masterBot.qrCodeString} size={180} />
                </div>
              ) : (
                <div className="py-10 space-y-2">
                  <div className="text-2xl animate-spin">⏳</div>
                  <p className="text-xs text-slate-400 m-0">
                    Sedang menyiapkan QR Code dari server WhatsApp...
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-white/[0.03] border border-white/10 rounded-xl p-3">
              Pop-up ini akan otomatis tertutup begitu pemindaian berhasil.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
