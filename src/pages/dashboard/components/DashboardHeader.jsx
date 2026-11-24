import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader({ user, saasInfo, onOpenBilling }) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  const activeTenantCode = saasInfo?.tenantCode || user?.tenantCode || '...';

  const handleCopyTenantId = () => {
    if (!activeTenantCode || activeTenantCode === '...') return;
    navigator.clipboard?.writeText(activeTenantCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };


  // ✅ Deteksi status masa aktif paket
  const isExpired = saasInfo.status === 'EXPIRED' || saasInfo.daysLeft <= 0;
  const isExpiringSoon = !isExpired && saasInfo.daysLeft <= 7;
  // const activeTenantCode = user?.tenantCode || '...';
  

  // const activeTenantCode = tenant?.tenantCode || user?.tenantCode || user?.tenantId || '...';
// tenantCode
// console.log(activeTenantCode);

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0f172a]/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl text-left">
      {/* ✅ SISI KIRI: SAPAAN, NAMA PERUSAHAAN & ID TENANT */}
      <div>
        <h2 className="m-0 font-extrabold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Selamat Datang Kembali,{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {user?.name || 'User'}
          </span>
          !
        </h2>
        <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs md:text-sm text-slate-400">
          <span>
            🏢 Workspace:{' '}
            <strong className="text-slate-200 font-semibold">
              {user?.businessName || 'Perusahaan Anda'}
            </strong>
          </span>
          <span className="hidden md:inline text-white/15">|</span>
          <div className="flex items-center gap-1.5">
            <span>ID Tenant:</span>
            <code className="text-cyan-400 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-xs">
              {activeTenantCode || '...'}
            </code>
            <button
              type="button"
              onClick={handleCopyTenantId}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[11px] border border-white/10 transition-colors cursor-pointer"
            >
              {copiedId ? '✅ Disalin' : '📋 Salin'}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ SISI KANAN: STATUS PAKET (DENGAN PERINGATAN H-3) & TOMBOL PERPANJANG */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className={`px-4 py-2 rounded-xl font-bold text-xs border flex items-center gap-1.5 shadow-lg ${
            isExpired
              ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
              : isExpiringSoon
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
              : saasInfo.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-blue-500/10 text-cyan-400 border-cyan-500/20'
          }`}
        >
          <span>{isExpired ? '⛔' : isExpiringSoon ? '⚠️' : '💎'}</span>
          <span>
            {isExpired
              ? 'PAKET EXPIRED (Bot Nonaktif)'
              : isExpiringSoon
              ? `SEGERA HABIS (Sisa ${saasInfo.daysLeft} Hari)`
              : saasInfo.status === 'ACTIVE'
              ? `PREMIUM ACTIVE (${saasInfo.daysLeft} Hari)`
              : `FREE TRIAL (${saasInfo.daysLeft} Hari)`}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenBilling}
          className={`px-3.5 py-2 font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer ${
            isExpired || isExpiringSoon
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25 hover:brightness-110'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/20 hover:brightness-110'
          }`}
        >
          {isExpired || isExpiringSoon ? '🔥 Perpanjang Sekarang' : '⚡ Kelola Paket'}
        </button>
      </div>
    </header>
  );
}

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function DashboardHeader({ user, saasInfo, onOpenBilling }) {
//   const navigate = useNavigate();
//   const [copiedId, setCopiedId] = useState(false);

//   const handleCopyTenantId = () => {
//     if (!user?.tenantId) return;
//     navigator.clipboard.writeText(user.tenantId);
//     setCopiedId(true);
//     setTimeout(() => setCopiedId(false), 2000);
//   };

//   return (
//     <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0f172a]/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl text-left">
//       {/* ✅ SISI KIRI: SAPAAN, NAMA PERUSAHAAN & ID TENANT */}
//       <div>
//         <h2 className="m-0 font-extrabold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
//           Selamat Datang Kembali,{' '}
//           <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//             {user?.name || 'User'}
//           </span>
//           !
//         </h2>
//         <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs md:text-sm text-slate-400">
//           <span>
//             🏢 Workspace:{' '}
//             <strong className="text-slate-200 font-semibold">
//               {user?.businessName || 'Perusahaan Anda'}
//             </strong>
//           </span>
//           <span className="hidden md:inline text-white/15">|</span>
//           <div className="flex items-center gap-1.5">
//             <span>ID Tenant:</span>
//             <code className="text-cyan-400 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-xs">
//               {user?.tenantId || '...'}
//             </code>
//             <button
//               type="button"
//               onClick={handleCopyTenantId}
//               className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[11px] border border-white/10 transition-colors cursor-pointer"
//             >
//               {copiedId ? '✅ Disalin' : '📋 Salin'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ✅ SISI KANAN: STATUS PAKET, PENGATURAN CHAT & KELOLA PAKET */}
//       <div className="flex flex-wrap items-center gap-2.5">
//         <div
//           className={`px-4 py-2 rounded-xl font-bold text-xs border flex items-center gap-1.5 shadow-lg ${
//             saasInfo.status === 'ACTIVE'
//               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
//               : saasInfo.daysLeft === 0
//               ? 'bg-red-500/10 text-red-400 border-red-500/30'
//               : 'bg-blue-500/10 text-cyan-400 border-cyan-500/20'
//           }`}
//         >
//           <span>💎</span>
//           <span>
//             {saasInfo.status === 'ACTIVE'
//               ? `PREMIUM ACTIVE (${saasInfo.daysLeft} Hari)`
//               : saasInfo.daysLeft > 0
//               ? `FREE TRIAL (${saasInfo.daysLeft} Hari)`
//               : 'EXPIRED'}
//           </span>
//         </div>

//         <button
//           type="button"
//           onClick={onOpenBilling}
//           className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
//         >
//           ⚡ Kelola Paket
//         </button>
//       </div>
//     </header>
//   );
// }
