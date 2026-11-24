import React from 'react';

export default function SalesLeaderboardCard({ salesPerformance }) {
  const maxLeads = Math.max(...salesPerformance.map((s) => s.leadsCount), 1);

  return (
    <div className="lg:col-span-5 bg-[#0f172a]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white m-0">🏆 Distribusi Leads Tim Sales</h3>
        <p className="text-xs text-slate-400 m-0 mt-0.5">Pembagian prospek otomatis (Round-Robin / Direct)</p>
      </div>

      {salesPerformance.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
          Belum ada anggota tim sales yang terdaftar.
        </div>
      ) : (
        <div className="space-y-4">
          {salesPerformance.map((sales, idx) => {
            const widthPercent = Math.round((sales.leadsCount / maxLeads) * 100);
            return (
              <div key={sales.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {sales.name}
                  </span>
                  <span className="font-bold text-cyan-400">{sales.leadsCount} Leads</span>
                </div>
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
