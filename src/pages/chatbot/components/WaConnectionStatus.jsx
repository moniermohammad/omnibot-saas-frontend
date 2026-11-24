import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatbotService } from '../../../api/chatbotService'; 
import WaStatusCard from './WaStatusCard';
import WaQrModal from './WaQrModal';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function WaConnectionStatus({ tenantId }) {
  const [status, setStatus] = useState('CHECKING');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [activeTenantId, setActiveTenantId] = useState(tenantId);

  // State Modal QR
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const socketRef = useRef(null);

  // 1. Cek Status Perangkat
  const checkStatus = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await chatbotService.getCheckBot();
      const data = res?.data ? res.data : res;

      if (data?.tenantId && data.tenantId !== activeTenantId) {
        setActiveTenantId(data.tenantId);
      }

      if (data?.success) {
        setStatus(data.status);
        setPhoneNumber(data.botNumber || '');

        if (data.status === 'ONLINE') {
          setIsOpenModal(false);
          setQrData(null);
          setCountdown(0);
          setQrLoading(false);
        }
      } else {
        setStatus('OFFLINE');
      }
    } catch {
      setStatus('OFFLINE');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // 2. Putuskan Koneksi Bot
  const handleDisconnect = async () => {
    if (!window.confirm("Apakah Anda yakin ingin memutuskan koneksi bot WhatsApp ini?")) return;
    try {
      setDisconnectLoading(true);
      const res = await chatbotService.disConectedBot();
      const data = res?.data ? res.data : res;
      if (data?.success) {
        alert("Bot berhasil diputus koneksinya.");
        checkStatus(false);
      } else {
        alert(data?.message || "Gagal memutuskan koneksi bot.");
      }
    } catch (err) {
      alert(err?.message || "Terjadi kesalahan.");
    } finally {
      setDisconnectLoading(false);
    }
  };

  // 3. Ambil QR Code dari Backend
  const handleFetchQr = async () => {
    try {
      setQrLoading(true);
      setQrError(null);
      setIsOpenModal(true);

      const res = await chatbotService.getQrCodeBot();
      const data = res?.data ? res.data : res;

      // 🌟 KUNCI UTAMA: Langsung join room Socket.io memakai tenantId resmi dari backend!
      if (data?.tenantId) {
        setActiveTenantId(data.tenantId);
        if (socketRef.current) {
          socketRef.current.emit("join-tenant-room", data.tenantId);
        }
      }

      if (data?.success && data.status === "ONLINE") {
        setStatus("ONLINE");
        setIsOpenModal(false);
        setQrData(null);
        setCountdown(0);
      } else if (data?.success && data.status === "QR_READY") {
        setQrData(data);
        setCountdown(data.validDurationSeconds || 60);
      } else if (data?.success && data.status === "OFFLINE_INITIALIZING") {
        setTimeout(() => handleFetchQr(), 2500);
        return;
      } else {
        setQrError(data?.message || "Gagal mendapatkan QR Code");
      }
    } catch (err) {
      setQrError(err?.message || "Terjadi kesalahan sistem.");
    } finally {
      setQrLoading(false);
    }
  };

  // 4. WebSocket Real-Time
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    if (activeTenantId && activeTenantId !== "MASTER_SYSTEM") {
      socket.emit("join-tenant-room", activeTenantId);
    }

    socket.on("wa-status-changed", (payload) => {
      if (payload?.status === "ONLINE") {
        setStatus("ONLINE");
        setIsOpenModal(false);
        setQrData(null);
        setCountdown(0);
        setQrLoading(false);
        checkStatus(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTenantId]);

  // Polling Cadangan
  useEffect(() => {
    checkStatus(false);
    const interval = setInterval(() => checkStatus(true), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let fastInterval;
    if (isOpenModal && !qrError && countdown > 0) {
      fastInterval = setInterval(() => checkStatus(true), 2000);
    }
    return () => clearInterval(fastInterval);
  }, [isOpenModal, countdown, qrError]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <>
      <WaStatusCard 
        status={status}
        phoneNumber={phoneNumber}
        loading={loading}
        disconnectLoading={disconnectLoading}
        onCheck={() => checkStatus(false)}
        onFetchQr={handleFetchQr}
        onDisconnect={handleDisconnect}
      />

      <WaQrModal 
        isOpen={isOpenModal}
        qrLoading={qrLoading}
        qrError={qrError}
        qrData={qrData}
        countdown={countdown}
        onClose={() => setIsOpenModal(false)}
        onRefresh={handleFetchQr}
      />
    </>
  );
}
