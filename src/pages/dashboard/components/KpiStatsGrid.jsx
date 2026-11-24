import React from 'react';

export default function KpiStatsGrid({ metrics, saasStatus }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
      <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all shadow-lg">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Subjek Layanan Bot</span>
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">🤖</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">{metrics.totalActive}</span>
          <span className="text-xs text-slate-400">Menu Aktif</span>
        </div>
      </div>

      <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all shadow-lg">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Total Prospek (Leads)</span>
          <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">📈</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">{metrics.totalLeads}</span>
          <span className="text-xs text-slate-400">Kontak Masuk</span>
        </div>
      </div>

      <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all shadow-lg">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Rasio Teruskan ke Sales</span>
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">🎯</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black text-emerald-400">{metrics.conversionRate}%</span>
          <span className="text-xs text-slate-400">Selesai Wawancara</span>
        </div>
      </div>

      <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all shadow-lg">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Tim Sales Aktif</span>
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">👥</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">{metrics.activeSalesCount}</span>
          <span className="text-xs text-slate-400">
            {saasStatus === 'FREE_TRIAL' ? '/ 2 Maks (Trial)' : 'Akun Sales'}
          </span>
        </div>
      </div>
    </div>
  );
}
