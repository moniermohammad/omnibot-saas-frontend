import React from "react";

export default function BillingTabs({
  activeTab,
  onTabChange,
  pendingCount = 0,
  disconnectedCount = 0,
}) {
  const tabs = [
    {
      id: "BILLING",
      label: "💳 Approval Pembayaran SaaS",
      badge: pendingCount > 0 ? `${pendingCount} Pending` : null,
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "MONITOR",
      label: "📡 Monitor Tenant & Koneksi WA",
      badge: disconnectedCount > 0 ? `${disconnectedCount} Putus` : null,
      badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-white/10 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer bg-transparent ${
              isActive
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${tab.badgeClass}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
