import React, { useState } from 'react';
import LegalModal from '../pages/whatsapp/components/LegalModal'; // Sesuaikan path relatif ke LegalModal.jsx

export default function Footer() {
  const [activeLegalDoc, setActiveLegalDoc] = useState(null); // 'TERMS' | 'PRIVACY' | null
  const currentYear = new Date().getFullYear();

  // Gunakan wa.me agar langsung membuka ruang chat WhatsApp
  const waHelpUrl = `https://wa.me{encodeURIComponent(
    'Halo Admin OmniBot Engine, saya butuh bantuan teknis terkait aplikasi.'
  )}`;

  return (
    <>
      <footer className="w-full border-t border-white/5 bg-[#0f172a]/30 px-6 md:px-8 lg:px-10 py-4 pb-20 lg:pb-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Kiri: Brand & Copyright */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-slate-300">🤖 OmniBot Engine</span>
            <span>•</span>
            <span>© {currentYear} Mohammad Munir. All rights reserved.</span>
          </div>

          {/* Kanan: Tautan Legal, Developer & Bantuan */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveLegalDoc('TERMS')}
              className="text-slate-400 hover:text-amber-300 transition-colors bg-transparent border-0 p-0 cursor-pointer"
            >
              Syarat &amp; Ketentuan
            </button>
            <span className="text-white/10">|</span>
            <button
              type="button"
              onClick={() => setActiveLegalDoc('PRIVACY')}
              className="text-slate-400 hover:text-amber-300 transition-colors bg-transparent border-0 p-0 cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <span className="text-white/10">|</span>
            <a
              href="https://portofolio.nir.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-sky-400 transition-colors no-underline"
            >
              Tentang Developer
            </a>
            <span className="text-white/10">|</span>
            <a
              href={waHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors no-underline"
            >
              💬 Bantuan Teknis
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Dokumen Legal (Bisa dibaca kapan saja dari Footer) */}
      <LegalModal
        activeDoc={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
        onAccept={() => setActiveLegalDoc(null)}
      />
    </>
  );
}


// import React from 'react';

// export default function Footer() {
//   const currentYear = new Date().getFullYear();

//   const waHelpUrlObj = new URL('https://whatsapp.com');
//   waHelpUrlObj.searchParams.set('phone', '628558836680');
//   waHelpUrlObj.searchParams.set(
//     'text',
//     'Halo Admin OmniBot Engine, saya butuh bantuan teknis terkait aplikasi.'
//   );
//   const waHelpUrl = waHelpUrlObj.toString();

//   return (
//     <footer className="w-full border-t border-white/5 bg-[#0f172a]/30 px-6 md:px-8 lg:px-10 py-4 pb-20 lg:pb-4 text-xs text-slate-400">
//       <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <span className="font-bold text-slate-300">🤖 OmniBot Engine</span>
//           <span>•</span>
//           <span>© {currentYear} Mohammad Munir. All rights reserved.</span>
//         </div>

//         <div className="flex items-center gap-4 text-[11px]">
//           <a
//             href="https://portofolio.nir.my.id"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-slate-400 hover:text-sky-400 transition-colors no-underline"
//           >
//             Tentang Developer
//           </a>
//           <span className="text-white/10">|</span>
//           <a
//             href={waHelpUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors no-underline"
//           >
//             💬 Bantuan Teknis
//           </a>
//         </div>
//       </div>
//     </footer>
//   );
// }


// import React from 'react';

// export default function Footer() {
//   const currentYear = new Date().getFullYear();
//   const adminWa = '628558836680';
//   const defaultMessage = encodeURIComponent(
//     'Halo Admin OmniBot Engine, saya butuh bantuan teknis terkait aplikasi.'
//   );

//   return (
//     <footer className="w-full border-t border-white/5 bg-[#0f172a]/30 px-6 md:px-8 lg:px-10 py-4 pb-20 lg:pb-4 text-xs text-slate-400">
//       <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <span className="font-bold text-slate-300">🤖 OmniBot Engine</span>
//           <span>•</span>
//           <span>© {currentYear} Mohammad Munir. All rights reserved.</span>
//         </div>

//         <div className="flex items-center gap-4 text-[11px]">
//           <a
//             href="https://portofolio.nir.my.id"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-slate-400 hover:text-sky-400 transition-colors no-underline"
//           >
//             Tentang Developer
//           </a>
//           <span className="text-white/10">|</span>
//           <a
//             href={`https://whatsapp.com{adminWa}&text=${defaultMessage}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors no-underline"
//           >
//             💬 Bantuan Teknis
//           </a>
//         </div>
//       </div>
//     </footer>
//   );
// }


// import React from 'react';

// export default function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="w-full border-t border-white/5 bg-[#0f172a]/30 px-6 md:px-8 lg:px-10 py-4 pb-20 lg:pb-4 text-xs text-slate-400">
//       <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <span className="font-bold text-slate-300">🤖 OmniBot Engine</span>
//           <span>•</span>
//           <span>© {currentYear} Mohammad Munir. All rights reserved.</span>
//         </div>

//         <div className="flex items-center gap-4 text-[11px]">
//           <a
//             href="https://portofolio.nir.my.id"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-slate-400 hover:text-sky-400 transition-colors no-underline"
//           >
//             Tentang Developer
//           </a>
//           <span className="text-white/10">|</span>
//           <a
//             href="window.open(`https://wa.me/${cleanWa}?text=${confirmMessage}`, '_blank', 'noopener,noreferrer');"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors no-underline"
//           >
//             💬 Bantuan Teknis
//           </a>
//         </div>
//       </div>
//     </footer>
//   );
// }
