import React from 'react';

export default function WaStatusCard({
  status,
  phoneNumber,
  loading,
  disconnectLoading,
  canFetchQr = true,
  onCheck,
  onFetchQr,
  onDisconnect,
}) {
  return (
    <div className="mb-6 bg-[#0b1329] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">📱</div>
        <div>
          <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
            Status Perangkat WhatsApp
            {status === 'CHECKING' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            {status === 'ONLINE' && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
            {status === 'RECONNECTING' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce shadow-[0_0_8px_#fbbf24]" />}
            {status === 'WAITING_SCAN' && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
            {status === 'OFFLINE' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />}
          </h4>
          <p className="text-xs text-gray-400 m-0 mt-0.5">
            {status === 'CHECKING' && 'Sedang memeriksa koneksi perangkat...'}
            {status === 'ONLINE' && `Terhubung aktif (${phoneNumber}) - Siap merespons chat.`}
            {status === 'RECONNECTING' && 'Bot terdaftar, sedang mencoba menyambungkan ulang ke WhatsApp...'}
            {status === 'WAITING_SCAN' && 'Sesi ditemukan, siap memindai QR Code.'}
            {status === 'OFFLINE' && 'Perangkat terputus. Bot tidak akan merespons chat masuk.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 self-end sm:self-center">
        <div className="flex items-center gap-2">
          {(status === 'ONLINE' || status === 'RECONNECTING') && (
            <button
              type="button"
              disabled={disconnectLoading}
              onClick={onDisconnect}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {disconnectLoading ? '⏳ Memutuskan...' : '🔴 Putuskan Sesi Bot'}
            </button>
          )}

          {(status === 'OFFLINE' || status === 'WAITING_SCAN') && (
            <button
              type="button"
              disabled={!canFetchQr}
              onClick={onFetchQr}
              title={
                canFetchQr
                  ? undefined
                  : 'Setujui panduan keamanan terlebih dahulu.'
              }
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/10 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
            >
              📸 Scan QR Code Sekarang
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={onCheck}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              status === 'ONLINE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                : 'bg-gray-800 text-gray-300 border-white/5 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            {loading ? '🔄 Menyinkronkan...' : '🔄 Periksa Ulang'}
          </button>
        </div>
        {!canFetchQr &&
          (status === 'OFFLINE' || status === 'WAITING_SCAN') && (
            <span className="text-[11px] text-amber-300">
              Setujui panduan keamanan untuk mengaktifkan pemindaian QR.
            </span>
          )}
      </div>
    </div>
  );
}
