import React from "react";

export default function ExpiredSubscriptionCard({ message, onOpenBilling }) {
  if (!message) return null;

  return (
    <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl max-w-lg mx-auto my-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto">
        ⏳
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-extrabold text-white m-0">
          Masa Aktif Paket Berakhir
        </h3>
        <p className="text-xs text-rose-200/90 leading-relaxed m-0">
          {message}
        </p>
      </div>

      {onOpenBilling && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenBilling}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-sky-600/25"
          >
            💳 Perpanjang Paket Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
