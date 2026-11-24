import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
// import Sidebar from '../../components/Sidebar';
import WaStatusCard from '../chatbot/components/WaStatusCard';
import WaQrModal from '../chatbot/components/WaQrModal'; // Pastikan path ini sesuai lokasi WaQrModal.jsx
import { chatbotService } from '../../api/chatbotService';
import LegalModal from './components/LegalModal';
import WaConnectionStatus from '../chatbot/components/WaConnectionStatus';
// import WaConnectionStatus from './components/WaConnectionStatus';

// const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

const MAX_INIT_RETRIES = 8;

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem('saas_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (err) {
    console.error('Gagal membaca data user dari localStorage:', err);
    return null;
  }
}

export default function WaDevicePage() {
  const [waStatus, setWaStatus] = useState('CHECKING');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);

  // State khusus WaQrModal
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const initRetryCountRef = useRef(0);
  const initTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const user = getStoredUser();
  const tenantId = user?.tenantId;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }
    };
  }, []);

  // 1. Cek status perangkat WhatsApp saat ini
  const checkDeviceStatus = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent && isMountedRef.current) setLoading(true);
      const res = await chatbotService.getCheckBot();
      const data = res?.data ? res.data : res;

      if (!isMountedRef.current) return;

      if (data?.success) {
        const nextStatus = data.status || 'OFFLINE';
        setWaStatus(nextStatus);
        setPhoneNumber(data.phoneNumber || data.botNumber || '');

        if (nextStatus === 'ONLINE') {
          initRetryCountRef.current = 0;
          setIsOpenModal(false);
          setQrData(null);
          setCountdown(0);
          setQrLoading(false);
          setQrError(null);
        }
      } else {
        setWaStatus('OFFLINE');
      }
    } catch (err) {
      console.error('Gagal mengecek status WA:', err);
      if (isMountedRef.current) {
        setWaStatus('OFFLINE');
      }
    } finally {
      if (!isSilent && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    checkDeviceStatus(false);
  }, [checkDeviceStatus]);

  // 2. Dengarkan QR Code & Status Koneksi Real-Time via Socket.io
  useEffect(() => {
    if (!tenantId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join-tenant-room', tenantId);

    const handleIncomingQr = (data) => {
      const qrString =
        typeof data === 'string'
          ? data
          : data?.qrCodeString || data?.qr || data?.qrCode;

      if (qrString && isMountedRef.current) {
        initRetryCountRef.current = 0;
        if (initTimerRef.current) {
          clearTimeout(initTimerRef.current);
        }
        setQrData({
          ...(typeof data === 'object' && data !== null ? data : {}),
          qrCodeString: qrString,
          message:
            (typeof data === 'object' && data?.message) ||
            'Silakan pindai QR Code sebelum waktu habis.',
        });
        setCountdown(
          (typeof data === 'object' && data?.validDurationSeconds) || 60
        );
        setWaStatus('WAITING_SCAN');
        setQrError(null);
        setQrLoading(false);
      }
    };

    const handleStatusChange = (data) => {
      const nextStatus = typeof data === 'string' ? data : data?.status;
      if (!nextStatus || !isMountedRef.current) return;

      setWaStatus(nextStatus);

      if (typeof data === 'object' && (data?.phoneNumber || data?.botNumber)) {
        setPhoneNumber(data.phoneNumber || data.botNumber);
      }

      if (nextStatus === 'ONLINE' || nextStatus === 'CONNECTED') {
        initRetryCountRef.current = 0;
        if (initTimerRef.current) {
          clearTimeout(initTimerRef.current);
        }
        setWaStatus('ONLINE');
        setIsOpenModal(false);
        setQrData(null);
        setCountdown(0);
        setQrLoading(false);
        setQrError(null);
        checkDeviceStatus(true);
      } else if (nextStatus === 'OFFLINE') {
        setPhoneNumber('');
        setQrData(null);
        setCountdown(0);
      }
    };

    const qrEvents = ['qr-code', 'qr', 'wa-qr'];
    const statusEvents = ['wa-status', 'wa-status-changed', 'connection-status'];

    qrEvents.forEach((event) => socket.on(event, handleIncomingQr));
    statusEvents.forEach((event) => socket.on(event, handleStatusChange));

    return () => {
      qrEvents.forEach((event) => socket.off(event, handleIncomingQr));
      statusEvents.forEach((event) => socket.off(event, handleStatusChange));
      socket.disconnect();
    };
  }, [tenantId, checkDeviceStatus]);

  // 3. Timer Countdown untuk Modal QR
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 4. Polling cepat saat modal terbuka (cadangan jika socket terlambat)
  useEffect(() => {
    if (!isOpenModal || qrError || countdown <= 0) return;

    const fastInterval = setInterval(() => {
      checkDeviceStatus(true);
    }, 2500);

    return () => clearInterval(fastInterval);
  }, [isOpenModal, qrError, countdown, checkDeviceStatus]);

  // 5. Buka Modal & Minta QR Code baru dari server
  const handleFetchQr = useCallback(
    async (isRetry = false) => {
      if (!agreedDisclaimer) {
        alert(
          'Silakan centang persetujuan Panduan Keamanan & Ketentuan Penggunaan WhatsApp terlebih dahulu.'
        );
        return;
      }

      if (!isRetry) {
        initRetryCountRef.current = 0;
        if (initTimerRef.current) {
          clearTimeout(initTimerRef.current);
        }
      }

      try {
        setQrLoading(true);
        setQrError(null);
        setIsOpenModal(true);

        const res = await chatbotService.getQrCodeBot();
        const data = res?.data ? res.data : res;

        if (!isMountedRef.current) return;

        if (data?.success && data.status === 'ONLINE') {
          initRetryCountRef.current = 0;
          setWaStatus('ONLINE');
          setPhoneNumber(data.phoneNumber || data.botNumber || phoneNumber);
          setIsOpenModal(false);
          setQrData(null);
          setCountdown(0);
          setQrLoading(false);
          return;
        }

        if (data?.success && data.status === 'OFFLINE_INITIALIZING') {
          if (initRetryCountRef.current < MAX_INIT_RETRIES) {
            initRetryCountRef.current += 1;
            initTimerRef.current = setTimeout(() => {
              handleFetchQr(true);
            }, 2500);
            return;
          }
          setQrError(
            'Perangkat sedang diinisialisasi terlalu lama. Silakan klik refresh beberapa saat lagi.'
          );
          setQrLoading(false);
          return;
        }

        const qrString = data?.qrCodeString || data?.qr || data?.qrCode;
        if (data?.success && qrString) {
          initRetryCountRef.current = 0;
          setQrData({
            ...data,
            qrCodeString: qrString,
          });
          setCountdown(data.validDurationSeconds || 60);
          setWaStatus('WAITING_SCAN');
        } else {
          setQrError(data?.message || 'Gagal mendapatkan QR Code.');
        }
        setQrLoading(false);
      } catch (err) {
        if (!isMountedRef.current) return;
        setQrError(err?.message || 'Terjadi kesalahan sistem.');
        setQrLoading(false);
      }
    },
    [agreedDisclaimer, phoneNumber]
  );

  const handleCloseModal = () => {
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current);
    }
    initRetryCountRef.current = 0;
    setIsOpenModal(false);
    setQrLoading(false);
  };

  // 6. Putuskan sesi perangkat WhatsApp
  const handleDisconnect = async () => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin memutuskan koneksi bot WhatsApp ini?'
      )
    ) {
      return;
    }

    if (!tenantId) {
      alert('Tenant ID tidak ditemukan.');
      return;
    }

    try {
      setDisconnectLoading(true);
      const res = await chatbotService.disConectedBot(tenantId);
      const data = res?.data ? res.data : res;

      if (data?.success) {
        setWaStatus('OFFLINE');
        setPhoneNumber('');
        setQrData(null);
        setCountdown(0);
        alert('Bot berhasil diputus koneksinya.');
      } else {
        alert(data?.message || 'Gagal memutuskan koneksi bot.');
      }
    } catch (err) {
      alert(err?.message || 'Terjadi kesalahan.');
    } finally {
      setDisconnectLoading(false);
    }
  };

  const isOnline = waStatus === 'ONLINE';

    return (
    <div className="flex bg-[#030712] min-h-screen text-[#f8fafc] font-sans antialiased">
      {/* <Sidebar /> */}

      <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-5xl mx-auto w-full pb-24 lg:pb-10">
        {/* Header Halaman */}
        <div className="mb-6 text-left">
          <h2 className="text-2xl font-extrabold text-white m-0">
            📱 Koneksi Perangkat WhatsApp
          </h2>
          <p className="text-xs text-slate-400 m-0 mt-1">
            Tautkan nomor WhatsApp operasional bisnis Anda untuk mengaktifkan asisten
            auto-reply AI.
          </p>
        </div>

        {/* KARTU STATUS PERANGKAT */}
        {/* <WaStatusCard
          status={waStatus}
          phoneNumber={phoneNumber}
          loading={loading}
          disconnectLoading={disconnectLoading}
          canFetchQr={agreedDisclaimer}
          onCheck={() => checkDeviceStatus(false)}
          onFetchQr={() => handleFetchQr(false)}
          onDisconnect={handleDisconnect}
        /> */}

        {/* <WaConnectionStatus tenantId={tenantId} /> */}

        {/* MODUL T1-08: KARTU DISCLAIMER & PANDUAN KEAMANAN NOMOR WHATSAPP */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 shadow-xl text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div className="space-y-2.5 flex-1">
              <h4 className="text-sm font-bold text-amber-300 m-0">
                Panduan Keamanan &amp; Ketentuan Penggunaan Nomor WhatsApp
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed m-0">
                Layanan ini berfungsi khusus sebagai{' '}
                <strong>Asisten Auto-Reply &amp; Distribusi Leads (Inbound)</strong>{' '}
                untuk merespons pesan pelanggan yang menghubungi nomor Anda terlebih
                dahulu.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-4 m-0 list-disc">
                <li>
                  <strong>Gunakan Nomor Khusus Operasional Bisnis:</strong> Sangat
                  disarankan memakai nomor khusus CS/kantor yang sudah aktif &amp;
                  berinteraksi normal minimal 14 hari (bukan nomor baru langsung
                  dipasang bot).
                </li>
                <li>
                  <strong>Dilarang Keras untuk Spam / Blast Massal:</strong> Jangan
                  gunakan nomor yang ditautkan untuk mengirim pesan promosi massal ke
                  nomor yang tidak dikenal karena melanggar kebijakan WhatsApp.
                </li>
                <li>
                  <strong>Batasan Tanggung Jawab:</strong> Penyedia platform tidak
                  bertanggung jawab atas pembatasan atau pemblokiran akun oleh pihak
                  WhatsApp akibat aktivitas spam atau pelanggaran Syarat &amp;
                  Ketentuan WhatsApp.
                </li>
              </ul>

              {/* Checkbox Persetujuan */}
              <label
                className={`flex items-center gap-2.5 pt-2 border-t border-amber-500/20 select-none ${
                  isOnline ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={isOnline}
                  checked={isOnline ? true : agreedDisclaimer}
                  onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-xs text-amber-200 leading-snug">
                  Saya memahami panduan di atas dan akan menggunakan nomor sesuai
                  ketentuan WhatsApp.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KOTAK INDIKATOR KONEKSI PERANGKAT (DITAMBAHKAN DI SINI)      */}
        {/* ============================================================ */}
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-6 md:p-8 text-center shadow-2xl">
          {isOnline ? (
            <div className="max-w-md mx-auto flex flex-col items-center gap-3 py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10">
                ✅
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Perangkat WhatsApp Terhubung
              </div>

              <h3 className="text-lg font-extrabold text-white m-0">
                Nomor Aktif: +{phoneNumber}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed m-0">
                Asisten Auto-Reply AI sudah aktif dan siap merespons pesan masuk dari pelanggan secara otomatis 24/7.
              </p>

              <div className="w-full pt-4 mt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => checkDeviceStatus(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  🔄 Cek Ulang Koneksi
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnectLoading}
                  className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {disconnectLoading ? '⏳ Memutuskan...' : '🔌 Putuskan & Ganti Nomor'}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto flex flex-col items-center gap-3 py-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-3xl">
                📸
              </div>

              <h3 className="text-base font-bold text-white m-0">
                Tautkan Perangkat WhatsApp
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed m-0">
                Centang persetujuan panduan keamanan di atas, lalu klik tombol di bawah untuk memindai QR Code dari aplikasi WhatsApp Anda.
              </p>

              <button
                type="button"
                disabled={!agreedDisclaimer || qrLoading}
                onClick={() => handleFetchQr(false)}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                {qrLoading ? '⏳ Menyiapkan QR...' : '📸 Tampilkan QR Code'}
              </button>
            </div>
          )}
        </div>

        {/* MODAL QR CODE */}
        <WaQrModal
          isOpen={isOpenModal}
          qrLoading={qrLoading}
          qrError={qrError}
          qrData={qrData}
          countdown={countdown}
          onClose={handleCloseModal}
          onRefresh={() => handleFetchQr(false)}
        />
      </div>
    </div>
  );

}