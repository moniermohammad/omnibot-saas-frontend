import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔒 MENGAMBIL DATA HAK AKSES DARI LOCALSTORAGE
  const savedUser = localStorage.getItem('saas_user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userRole = user?.role?.toUpperCase() || 'SALES';

  // Evaluasi apakah user memiliki akses penuh (OWNER / ADMIN)
  const hasFullAccess = userRole === 'OWNER' || userRole === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    navigate('/', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const getMenuClass = (path) => {
    const baseClass =
      'flex items-center px-4 py-3 text-sm font-semibold rounded-xl mb-1.5 transition-all duration-200 group';
    const activeClass =
      'bg-blue-600/10 text-[#38bdf8] border-l-4 border-[#38bdf8] pl-3 shadow-[0_0_15px_rgba(56,189,248,0.05)]';
    const inactiveClass = 'text-slate-400 hover:text-slate-200 hover:bg-white/5';
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <>
      {/* 💻 TAMPILAN DESKTOP */}
      <div className="hidden lg:flex flex-col justify-between w-[260px] h-screen bg-[#0f172a] text-[#f8fafc] font-sans border-r border-white/5 sticky top-0 z-50">
        <div>
          {/* Logo / Judul Brand */}
          <div className="flex items-center gap-2.5 px-5 py-6 border-b border-white/5">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="m-0 font-extrabold text-lg bg-gradient-to-r from-[#38bdf8] to-[#3b82f6] bg-clip-text text-transparent tracking-tight">
                OmniBot Engine
              </h3>
              {!hasFullAccess && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Mode Tim Sales
                </span>
              )}
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="px-3 py-5">
            {/* Menu khusus OWNER & ADMIN */}
            {hasFullAccess && (
              <>
                <Link to="/dashboard" className={getMenuClass('/dashboard')}>
                  <span className="mr-3 text-base group-hover:scale-110 transition-transform">📊</span> Overview
                </Link>
                <Link to="/dashboard/whatsapp" className={getMenuClass('/dashboard/whatsapp')}>
                  <span className="mr-3 text-base group-hover:scale-110 transition-transform">💬</span> WA Device
                </Link>
                <Link to="/dashboard/chatbots" className={getMenuClass('/dashboard/chatbots')}>
                  <span className="mr-3 text-base group-hover:scale-110 transition-transform">⚙️</span> Chatbot
                </Link>
              </>
            )}

            {/* Menu untuk SEMUA Role (Owner, Admin, maupun Sales) */}
            <Link to="/dashboard/crm" className={getMenuClass('/dashboard/crm')}>
              <span className="mr-3 text-base group-hover:scale-110 transition-transform">👥</span> CRM Leads
            </Link>

            {/* Menu Setting khusus OWNER & ADMIN */}
            {hasFullAccess && (
              <Link to="/dashboard/settings" className={getMenuClass('/dashboard/settings')}>
                <span className="mr-3 text-base group-hover:scale-110 transition-transform">🏢</span> Setting
              </Link>
            )}
          </nav>
        </div>

        {/* Tombol Keluar Sesi */}
        <div className="p-5 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-500/10 hover:bg-red-600 text-[#f87171] hover:text-white border border-red-500/20 hover:border-red-600 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-md"
          >
            🚪 Keluar Aplikasi
          </button>
        </div>
      </div>

      {/* 📱 TAMPILAN MOBILE ANDROID (Bottom Navigation Bar) */}
      <div className="lg:hidden flex fixed bottom-0 left-0 right-0 h-[65px] bg-[#0f172a]/95 backdrop-blur-md border-t border-white/5 justify-around items-center z-[999] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-1 pb-safe">
        {hasFullAccess && (
          <>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${
                isActive('/dashboard') ? 'text-[#38bdf8]' : 'text-slate-400'
              }`}
            >
              <span className="text-lg mb-0.5">📊</span>Overview
            </Link>
            <Link
              to="/dashboard/whatsapp"
              className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${
                isActive('/dashboard/whatsapp') ? 'text-[#38bdf8]' : 'text-slate-400'
              }`}
            >
              <span className="text-lg mb-0.5">💬</span>WA Device
            </Link>
            <Link
              to="/dashboard/chatbots"
              className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${
                isActive('/dashboard/chatbots') ? 'text-[#38bdf8]' : 'text-slate-400'
              }`}
            >
              <span className="text-lg mb-0.5">⚙️</span>Chatbot
            </Link>
          </>
        )}

        <Link
          to="/dashboard/crm"
          className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${
            isActive('/dashboard/crm') ? 'text-[#38bdf8]' : 'text-slate-400'
          }`}
        >
          <span className="text-lg mb-0.5">👥</span>CRM Leads
        </Link>

        {hasFullAccess && (
          <Link
            to="/dashboard/settings"
            className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${
              isActive('/dashboard/settings') ? 'text-[#38bdf8]' : 'text-slate-400'
            }`}
          >
            <span className="text-lg mb-0.5">🏢</span>Setting
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-[10px] font-bold tracking-tight bg-transparent border-none p-0 text-[#f87171] cursor-pointer"
        >
          <span className="text-lg mb-0.5">🚪</span>Keluar
        </button>
      </div>
    </>
  );
}


// import React from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';

// export default function Sidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 🔒 MENGAMBIL DATA HAK AKSES DARI LOCALSTORAGE
//   const savedUser = localStorage.getItem('saas_user');
//   const user = savedUser ? JSON.parse(savedUser) : null;
//   const userRole = user?.role?.toUpperCase() || 'SALES'; // Default aman ke SALES jika data kosong

//   // Evaluasi apakah user memiliki akses penuh
//   const hasFullAccess = userRole === 'OWNER' || userRole === 'ADMIN';

//   const handleLogout = () => {
//     localStorage.removeItem('saas_token');
//     localStorage.removeItem('saas_user');
    
//     // Gunakan replace: true agar history halaman terhapus total
//     navigate('/', { replace: true });
//   };

//   const isActive = (path) => location.pathname === path;

//   // Fungsi utilitas kelas untuk menu agar kode tidak duplikatif
//   const getMenuClass = (path) => {
//     const baseClass = "flex items-center Robinson px-4 py-3 text-sm font-semibold rounded-xl mb-1.5 transition-all duration-200 group";
//     const activeClass = "bg-blue-600/10 text-[#38bdf8] border-l-4 border-[#38bdf8] pl-3 shadow-[0_0_15px_rgba(56,189,248,0.05)]";
//     const inactiveClass = "text-slate-400 hover:text-slate-200 hover:bg-white/5";
//     return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
//   };

//   return (
//     <>
//       {/* 💻 TAMPILAN DESKTOP (Sidebar Kiri - Tersembunyi otomatis di layar ponsel < 900px / lg) */}
//       <div className="hidden lg:flex flex-col justify-between w-[260px] h-screen bg-[#0f172a] text-[#f8fafc] font-sans border-right border-white/5 sticky top-0 z-50">
//         <div>
//           {/* Logo / Judul Brand */}
//           <div className="flex items-center gap-2.5 px-5 py-6 border-b border-white/5">
//             <span className="text-2xl">🤖</span>
//             <h3 className="m-0 font-extrabold text-lg bg-gradient-to-r from-[#38bdf8] to-[#3b82f6] bg-clip-text text-transparent tracking-tight">
//               OmniBot Engine
//             </h3>
//           </div>

//           {/* Navigasi Utama */}
//           <nav className="px-3 py-5">
//             <Link to="/dashboard" className={getMenuClass('/dashboard')}>
//               <span className="mr-3 text-base group-hover:scale-110 transition-transform">📊</span> Overview
//             </Link>

//             {/* 🔒 PROTEKSI DESKTOP: Hanya muncul untuk OWNER/ADMIN */}
//             {hasFullAccess && (
//               <>
//                 <Link to="/dashboard/whatsapp" className={getMenuClass('/dashboard/whatsapp')}>
//                   <span className="mr-3 text-base group-hover:scale-110 transition-transform">💬</span> WA Device
//                 </Link>
//                 <Link to="/dashboard/chatbots" className={getMenuClass('/dashboard/chatbots')}>
//                   <span className="mr-3 text-base group-hover:scale-110 transition-transform">⚙️</span> Chatbot
//                 </Link>
//               </>
//             )}

//             <Link to="/dashboard/crm" className={getMenuClass('/dashboard/crm')}>
//               <span className="mr-3 text-base group-hover:scale-110 transition-transform">👥</span> CRM Leads
//             </Link>
//           </nav>
//         </div>

//         {/* Tombol Keluar Sesi */}
//         <div className="p-5 border-t border-white/5">
//           <button 
//             onClick={handleLogout} 
//             className="w-full py-3 bg-red-500/10 hover:bg-red-600 text-[#f87171] hover:text-white border border-red-500/20 hover:border-red-600 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-md"
//           >
//             🚪 Keluar Aplikasi
//           </button>
//         </div>
//       </div>

//       {/* 📱 TAMPILAN MOBILE ANDROID (Bottom Navigation Bar - Hanya muncul di layar ponsel < lg) */}
//       <div className="lg:hidden flex fixed bottom-0 left-0 right-0 h-[65px] bg-[#0f172a]/95 backdrop-blur-md border-t border-white/5 justify-around items-center z-[999] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-2 pb-safe">
        
//         <Link 
//           to="/dashboard" 
//           className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${isActive('/dashboard') ? 'text-[#38bdf8]' : 'text-slate-400'}`}
//         >
//           <span className="text-xl mb-0.5">📊</span>Overview
//         </Link>

//         {/* 🔒 PROTEKSI MOBILE: Hanya muncul untuk OWNER/ADMIN */}
//         {hasFullAccess && (
//           <>
//             <Link 
//               to="/dashboard/whatsapp" 
//               className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${isActive('/dashboard/whatsapp') ? 'text-[#38bdf8]' : 'text-slate-400'}`}
//             >
//               <span className="text-xl mb-0.5">💬</span>WA Device
//             </Link>
//             <Link 
//               to="/dashboard/chatbots" 
//               className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${isActive('/dashboard/chatbots') ? 'text-[#38bdf8]' : 'text-slate-400'}`}
//             >
//               <span className="text-xl mb-0.5">⚙️</span>Chatbot
//             </Link>
//           </>
//         )}

//         <Link 
//           to="/dashboard/crm" 
//           className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-tight transition-colors ${isActive('/dashboard/crm') ? 'text-[#38bdf8]' : 'text-slate-400'}`}
//         >
//           <span className="text-xl mb-0.5">👥</span>CRM Leads
//         </Link>

//         <button 
//           onClick={handleLogout} 
//           className="flex flex-col items-center justify-center text-[10px] font-bold tracking-tight bg-transparent border-none p-0 text-[#f87171]"
//         >
//           <span className="text-xl mb-0.5">🚪</span>Keluar
//         </button>
//       </div>
//     </>
//   );
// }
