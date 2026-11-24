import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WaQrModal({ isOpen, qrLoading, qrError, qrData, countdown, onClose, onRefresh }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>

        <h3 className="text-base font-bold text-white mb-1">Pindai QR Code WhatsApp</h3>
        <p className="text-xs text-gray-400 mb-6">Buka WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat</p>

        <div className="flex flex-col items-center justify-center min-h-[220px]">
          {qrLoading && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Menyiapkan QR Code...</p>
            </div>
          )}

          {qrError && (
            <div className="text-red-400 text-xs">
              <p className="mb-3">{qrError}</p>
              <button onClick={onRefresh} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-semibold">Coba Lagi</button>
            </div>
          )}

          {!qrLoading && !qrError && qrData && (
            <div className="flex flex-col items-center">
              {countdown > 0 ? (
                <div className="p-4 bg-white rounded-xl shadow-lg mb-4">
                  <QRCodeSVG value={qrData.qrCodeString} size={180} includeMargin={false} />
                </div>
              ) : (
                <div className="w-[212px] h-[212px] bg-gray-900 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 mb-4 p-4">
                  <span className="text-red-400 text-xs font-bold">QR Code Kedaluwarsa</span>
                  <button onClick={onRefresh} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-all">🔄 Refresh QR</button>
                </div>
              )}

              {countdown > 0 && (
                <p className={`text-xs font-semibold mb-2 ${countdown <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                  QR diperbarui otomatis dalam: <span className="underline">{countdown}s</span>
                </p>
              )}
              <p className="text-[11px] text-gray-500 italic max-w-[250px] leading-tight">{qrData.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
