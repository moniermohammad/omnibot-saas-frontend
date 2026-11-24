import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../index.css';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-gray-100 font-sans overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_400px)]">
      <div>
        {/* 🧭 Header / Navigation bar */}
        <header className="flex justify-between items-center px-[4%] md:px-[8%] py-4 md:py-5 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="m-0 font-extrabold text-lg bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              OmniBot Engine
            </h2>
          </div>
          <div className="flex items-center text-sm md:text-base">
            <Link
              to="/login"
              className="text-gray-400 no-underline mr-4 font-medium hover:text-gray-200 transition-colors"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white no-underline rounded-md font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors"
            >
              Daftar
            </Link>
          </div>
        </header>

        {/* 🚀 Hero Section */}
        <main className="px-5 md:px-[5%] py-12 md:py-16 text-center max-w-[1000px] mx-auto">
          <div className="inline-block bg-sky-500/10 text-sky-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border border-sky-500/20 max-w-[90%] leading-relaxed">
            ✨ Asisten AI WhatsApp 24/7 &amp; CRM Tim Sales Terintegrasi
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[54px] font-extrabold text-white leading-tight md:leading-[1.3] mt-0 mb-5 tracking-tight">
            Kelola Otomasi Bot Bisnis Anda <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Dalam Satu Dashboard
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-[650px] mx-auto mb-10 leading-relaxed">
            Bangun, pantau, dan kendalikan bot WhatsApp pintar, alokasi prospek otomatis ke tim sales, dan CRM bisnis Anda secara instan.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full px-5 sm:px-0 box-border">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white no-underline rounded-lg text-sm md:text-[15px] font-semibold shadow-[0_4px_20px_rgba(37,99,235,0.4)] text-center hover:bg-blue-700 transition-colors box-border"
            >
              Mulai 14-Hari Free Trial
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 text-white no-underline rounded-lg text-sm md:text-[15px] font-semibold border border-white/10 text-center hover:bg-white/10 transition-colors box-border"
            >
              Akses Workspace
            </Link>
          </div>

          {/* 🌟 Features Grid Section */}
          <section className="mt-20 mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-left px-2 sm:px-0">
            {/* Card 1 */}
            <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
              <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                💬
              </div>
              <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">WhatsApp Integration</h3>
              <p className="text-gray-400 text-sm m-0 leading-relaxed">
                Scan QR Code langsung dari dashboard, hubungkan perangkat, dan balas pesan pelanggan masuk secara{' '}
                <span className="text-blue-400 font-medium">real-time</span> 24 jam.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
              <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                🤖
              </div>
              <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">AI Chatbot Builder</h3>
              <p className="text-gray-400 text-sm m-0 leading-relaxed">
                Atur gaya bahasa dan layanan chatbot AI sesuai bidang usaha Anda untuk menyaring prospek potensial secara otomatis.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
              <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                👥
              </div>
              <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">CRM &amp; Leads Routing</h3>
              <p className="text-gray-400 text-sm m-0 leading-relaxed">
                Simpan data pelanggan otomatis, distribusikan prospek ke tim sales secara adil, dan pantau progres closing.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* 🧾 Footer Legal & Bantuan */}
      <Footer />
    </div>
  );
}

// import React from 'react';
// import { Link } from 'react-router-dom';
// import '../index.css'; // 🌟 IMPORT YANG INI
// // import '../App.css';
// // // import './App.css';

// export function LandingPage() {
//   return (
//     <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_400px)]">
      
//       {/* 🧭 Header / Navigation bar */}
//       <header className="flex justify-between items-center px-[4%] md:px-[8%] py-4 md:py-5 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
//         <div className="flex items-center gap-2">
//           <span className="text-2xl">🤖</span>
//           <h2 className="m-0 font-extrabold text-lg bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
//             OmniBot SaaS
//           </h2>
//         </div>
//         <div className="flex items-center text-sm md:text-base">
//           <Link to="/login" className="text-gray-400 no-underline mr-4 font-medium hover:text-gray-200 transition-colors">
//             Masuk
//           </Link>
//           <Link to="/register" className="px-4 py-2 bg-blue-600 text-white no-underline rounded-md font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors">
//             Daftar
//           </Link>
//         </div>
//       </header>

//       {/* 🚀 Hero Section */}
//       <main className="px-5 md:px-[5%] py-10 text-center max-w-[1000px] mx-auto">
//         <div className="inline-block bg-sky-500/10 text-sky-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border border-sky-500/20 max-w-[90%] leading-relaxed">
//           🚀 Platform Multi-Tenant Terintegrasi Express.js & Prisma
//         </div>
        
//         {/* 🌟 PERBAIKAN: Menggunakan text-white agar teks "Kelola Otomasi..." kontras dan terbaca jelas */}
//         <h1 className="text-3xl sm:text-4xl md:text-[54px] font-extrabold text-white leading-tight md:leading-[1.3] mt-0 mb-5 tracking-tight">
//           Kelola Otomasi Bot Bisnis Anda <br className="hidden sm:inline" />
//           <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
//             Dalam Satu Dashboard
//           </span>
//         </h1>
        
//         <p className="text-gray-400 text-base md:text-lg max-w-[650px] mx-auto mb-10 leading-relaxed">
//           Bangun, pantau, dan kendalikan bot WhatsApp, chatbot kustom, dan leads CRM bisnis Anda secara instan. Tingkatkan efisiensi kerja tim sekarang juga.
//         </p>

//         <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full px-5 sm:px-0 box-border">
//           <Link to="/register" className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white no-underline rounded-lg text-sm md:text-[15px] font-semibold shadow-[0_4px_20px_rgba(37,99,235,0.4)] text-center hover:bg-blue-700 transition-colors box-border">
//             Mulai 14-Hari Free Trial
//           </Link>
//           <Link to="/login" className="w-full sm:w-auto px-6 py-3.5 bg-white/5 text-white no-underline rounded-lg text-sm md:text-[15px] font-semibold border border-white/10 text-center hover:bg-white/10 transition-colors box-border">
//             Akses Workspace
//           </Link>
//         </div>

//         {/* 🌟 Features Grid Section */}
//         <section className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-left px-2 sm:px-0">
          
//           {/* Card 1 */}
//           <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
//             <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//               💬
//             </div>
//             <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">WhatsApp Integration</h3>
//             <p className="text-gray-400 text-sm m-0 leading-relaxed">
//               Scan QR Code langsung dari dashboard, hubungkan perangkat, dan kelola pesan masuk otomatis secara <span className="text-blue-400 font-medium">real-time</span>.
//             </p>
//           </div>

//           {/* Card 2 */}
//           <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
//             <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//               ⚙️
//             </div>
//             <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">Chatbot Builder</h3>
//             <p className="text-gray-400 text-sm m-0 leading-relaxed">
//               Atur alur percakapan otomatis menggunakan pengaturan visual berbasis menu untuk membalas prospek potensial.
//             </p>
//           </div>

//           {/* Card 3 */}
//           <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
//             <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//               👥
//             </div>
//             <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">CRM & Leads Management</h3>
//             <p className="text-gray-400 text-sm m-0 leading-relaxed">
//               Simpan data pelanggan, pantau status interaksi, dan integrasikan dengan sistem kalender janji temu otomatis.
//             </p>
//           </div>

//         </section>
//       </main>
//     </div>
//   );
// }
