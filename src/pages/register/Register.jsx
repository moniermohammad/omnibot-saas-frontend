import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import { tenantService } from '../../api/tenantService';
import LegalModal from '../whatsapp/components/LegalModal'; // Sesuaikan jika folder register berada di level yang berbeda
import { Link, useNavigate } from 'react-router-dom';


export default function Register() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState(null); // 'TERMS' | 'PRIVACY' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

    const submitRegistration = async () => {
    setLoading(true);
    try {
      const data = await tenantService.registerTenant({
        businessName,
        ownerName,
        ownerPhone,
        businessType,
        agreedTerms: true,
        termsAcceptedAt: new Date().toISOString(),
      });

      const registeredPhone = ownerPhone;

      setSuccess(
        `🎉 Sukses! Bisnis "${data?.tenant?.businessName || businessName}" telah terdaftar aktif dengan Free Trial 14 hari. Mengalihkan ke halaman masuk...`
      );

      setBusinessName('');
      setOwnerName('');
      setOwnerPhone('');
      setBusinessType('');
      setAgreedTerms(false);

      // Otomatis pindah ke halaman Login setelah 2 detik
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { prefillPhone: registeredPhone },
        });
      }, 2000);
    } catch (errMessage) {
      setError(errMessage?.toString() || '❌ Gagal mendaftarkan sistem bisnis baru.');
    } finally {
      setLoading(false);
    }
  };


  // const submitRegistration = async () => {
  //   setLoading(true);
  //   try {
  //     const data = await tenantService.registerTenant({
  //       businessName,
  //       ownerName,
  //       ownerPhone,
  //       businessType,
  //       agreedTerms: true,
  //       termsAcceptedAt: new Date().toISOString(),
  //     });

  //     setSuccess(
  //       `🎉 Sukses! Bisnis "${data?.tenant?.businessName || businessName}" telah terdaftar aktif dengan Free Trial 14 hari.`
  //     );

  //     setBusinessName('');
  //     setOwnerName('');
  //     setOwnerPhone('');
  //     setBusinessType('');
  //     setAgreedTerms(false);
  //   } catch (errMessage) {
  //     setError(errMessage?.toString() || '❌ Gagal mendaftarkan sistem bisnis baru.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validasi Input Form
    if (businessName.trim().length < 3) {
      setError('⚠️ Nama bisnis minimal harus 3 karakter.');
      return;
    }
    if (ownerName.trim().length < 3) {
      setError('⚠️ Nama lengkap pemilik minimal harus 3 karakter.');
      return;
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(ownerPhone)) {
      setError('❌ Nomor WhatsApp hanya boleh berisi angka tanpa spasi atau huruf!');
      return;
    }
    if (ownerPhone.length < 9 || ownerPhone.length > 15) {
      setError('❌ Panjang nomor WhatsApp tidak valid (minimal 9 digit & maksimal 15 digit).');
      return;
    }

    // 2. Jika belum centang persetujuan, otomatis buka modal Syarat & Ketentuan
    if (!agreedTerms) {
      setActiveLegalDoc('TERMS');
      return;
    }

    // 3. Jika sudah centang, langsung daftar
    await submitRegistration();
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b0f19] text-gray-100 font-sans p-5 box-border">
      <div className="bg-[#111827] p-[35px_30px] rounded-xl border border-white/5 w-full max-w-[440px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] box-border">
        
        {/* Header */}
             {/* Header */}
      <div className="text-center mb-6">
        <span className="text-4xl">🚀</span>
        <h2 className="mt-2.5 mb-1.5 text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
          Mulai Otomasi Bisnis Anda
        </h2>
        <p className="text-gray-400 text-sm m-0">
          Coba gratis 14 hari Asisten WhatsApp AI &amp; CRM untuk bisnis Anda
        </p>
      </div>


        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm mb-[15px] border border-red-500/20">
            {error}
          </div>
        )}

        {/* Notifikasi Sukses */}
        {success && (
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-md text-sm mb-[15px] border border-emerald-500/20">
            {success}
          </div>
        )}

        {/* Form Pendaftaran */}
        <form onSubmit={handleRegister}>
          <div className="mb-[15px]">
            <label className="block mb-1.5 text-sm font-medium text-gray-400">Nama Bisnis / Perusahaan</label>
            <input 
              type="text" 
              required 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)} 
              placeholder="Contoh: BotKilat Digital" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
              disabled={loading} 
            />
          </div>

          <div className="mb-[15px]">
            <label className="block mb-1.5 text-sm font-medium text-gray-400">Nama Lengkap Pemilik</label>
            <input 
              type="text" 
              required 
              value={ownerName} 
              onChange={(e) => setOwnerName(e.target.value)} 
              placeholder="Contoh: Ahmad Fauzi" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
              disabled={loading} 
            />
          </div>

          <div className="mb-[15px]">
            <label className="block mb-1.5 text-sm font-medium text-gray-400">Nomor WhatsApp / HP</label>
            <input 
              type="text" 
              required 
              value={ownerPhone} 
              onChange={(e) => setOwnerPhone(e.target.value)} 
              placeholder="Contoh: 08123456789" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
              disabled={loading} 
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-gray-400">Tipe Bisnis (Opsional)</label>
            <select 
              value={businessType} 
              onChange={(e) => setBusinessType(e.target.value)} 
              className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
              disabled={loading}
            >
              <option value="">-- Pilih Tipe Bisnis --</option>
              <option value="RETAIL">Retail / Dagang</option>
              <option value="SERVICE">Jasa / Agensi</option>
              <option value="FNB">Kuliner / FnB</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          {/* Checkbox Persetujuan Legal (Syarat & Ketentuan + Kebijakan Privasi) */}
          <div className="mb-5 p-3 rounded-lg bg-gray-800/60 border border-white/10 flex items-start gap-2.5 text-left">
            <input
              id="register-agree-terms"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer shrink-0"
            />
            <label htmlFor="register-agree-terms" className="text-xs text-gray-300 leading-relaxed cursor-pointer select-none">
              Saya menyetujui{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveLegalDoc('TERMS');
                }}
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold bg-transparent border-0 p-0 cursor-pointer"
              >
                Syarat &amp; Ketentuan Layanan
              </button>{' '}
              serta{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveLegalDoc('PRIVACY');
                }}
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold bg-transparent border-0 p-0 cursor-pointer"
              >
                Kebijakan Privasi (UU PDP)
              </button>{' '}
              yang berlaku.
            </label>
          </div>

          {/* Tombol Submit Interaktif */}
        <button 
          type="submit" 
          disabled={loading || !agreedTerms} 
          className={`w-full p-3 border-none rounded-lg font-semibold text-base transition-all duration-200 
            ${loading || !agreedTerms
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60 shadow-none' 
              : 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
            }`}
        >
          {loading ? '⏳ Memproses Pendaftaran...' : 'Daftar Sekarang'}
        </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-gray-400 text-sm mt-5 mb-0">
          Sudah punya akun bisnis?{' '}
          <Link to="/login" className="text-emerald-400 no-underline font-semibold hover:text-emerald-300 transition-colors">
            Masuk di sini
          </Link>
        </p>

      </div>

      {/* Modal Dokumen Legal */}
            {/* Modal Dokumen Legal Terintegrasi */}
      <LegalModal
        activeDoc={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
        onAccept={async () => {
          setAgreedTerms(true);
          // Jika data form sudah lengkap terisi, langsung proses pendaftaran otomatis!
          if (
            businessName.trim().length >= 3 &&
            ownerName.trim().length >= 3 &&
            /^[0-9]{9,15}$/.test(ownerPhone)
          ) {
            await submitRegistration();
          }
        }}
      />

      {/* <LegalModal
        activeDoc={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
        onAccept={() => setAgreedTerms(true)}
      /> */}
    </div>
  );
}


// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { tenantService } from '../../api/tenantService';

// export default function Register() {
//   const [businessName, setBusinessName] = useState('');
//   const [ownerName, setOwnerName] = useState('');
//   const [ownerPhone, setOwnerPhone] = useState('');
//   const [businessType, setBusinessType] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     // 🌟 1. VALIDASI FRONTEND STANDARD INDUSTRI
//     if (businessName.trim().length < 3) {
//       setError('⚠️ Nama bisnis minimal harus 3 karakter.');
//       return;
//     }
//     if (ownerName.trim().length < 3) {
//       setError('⚠️ Nama lengkap pemilik minimal harus 3 karakter.');
//       return;
//     }

//     // Validasi Nomor HP menggunakan Regex (Hanya boleh angka saja, minimal 9 digit, maksimal 15 digit)
//     const phoneRegex = /^[0-9]+$/;
//     if (!phoneRegex.test(ownerPhone)) {
//       setError('❌ Nomor WhatsApp hanya boleh berisi angka tanpa spasi atau huruf!');
//       return;
//     }
//     if (ownerPhone.length < 9 || ownerPhone.length > 15) {
//       setError('❌ Panjang nomor WhatsApp tidak valid (minimal 9 digit & maksimal 15 digit).');
//       return;
//     }

//     // 🌟 2. JIKA VALIDASI LOLOS, AKTIFKAN LOADING STATE
//     setLoading(true);

//     try {
//       const data = await tenantService.registerTenant({
//         businessName,
//         ownerName,
//         ownerPhone,
//         businessType
//       });

//       setSuccess(`🎉 Sukses! Bisnis "${data?.tenant?.businessName || businessName}" telah terdaftar aktif dengan Free Trial 14 hari.`);
      
//       // Bersihkan form jika sukses
//       setBusinessName(''); setOwnerName(''); setOwnerPhone(''); setBusinessType('');
//     } catch (errMessage) {
//       setError(errMessage?.toString() || '❌ Gagal mendaftarkan sistem bisnis baru.');
//     } finally {
//       setLoading(false); // Matikan loading state jika proses selesai / gagal
//     }
//   };

//   return (
//   <div className="flex justify-center items-center min-h-screen bg-[#0b0f19] text-gray-100 font-sans p-5 box-border">
//     <div className="bg-[#111827] p-[35px_30px] rounded-xl border border-white/5 w-full max-w-[440px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] box-border">
      
//       {/* Header */}
//       <div className="text-center mb-6">
//         <span className="text-4xl">🏢</span>
//         <h2 className="mt-2.5 mb-1.5 text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
//           Daftar Akun SaaS
//         </h2>
//         <p className="text-gray-400 text-sm m-0">Sistem Proteksi Validasi & Anti-Spam</p>
//       </div>

//       {/* Notifikasi Error */}
//       {error && (
//         <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm mb-[15px] border border-red-500/20">
//           {error}
//         </div>
//       )}

//       {/* Notifikasi Sukses */}
//       {success && (
//         <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-md text-sm mb-[15px] border border-emerald-500/20">
//           {success}
//         </div>
//       )}

//       {/* Form Pendaftaran */}
//       <form onSubmit={handleRegister}>
//         <div className="mb-[15px]">
//           <label className="block mb-1.5 text-sm font-medium text-gray-400">Nama Bisnis / Perusahaan</label>
//           <input 
//             type="text" 
//             required 
//             value={businessName} 
//             onChange={(e) => setBusinessName(e.target.value)} 
//             placeholder="Contoh: BotKilat Digital" 
//             className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
//             disabled={loading} 
//           />
//         </div>

//         <div className="mb-[15px]">
//           <label className="block mb-1.5 text-sm font-medium text-gray-400">Nama Lengkap Pemilik</label>
//           <input 
//             type="text" 
//             required 
//             value={ownerName} 
//             onChange={(e) => setOwnerName(e.target.value)} 
//             placeholder="Contoh: Ahmad Fauzi" 
//             className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
//             disabled={loading} 
//           />
//         </div>

//         <div className="mb-[15px]">
//           <label className="block mb-1.5 text-sm font-medium text-gray-400">Nomor WhatsApp / HP</label>
//           <input 
//             type="text" 
//             required 
//             value={ownerPhone} 
//             onChange={(e) => setOwnerPhone(e.target.value)} 
//             placeholder="Contoh: 08123456789" 
//             className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
//             disabled={loading} 
//           />
//         </div>

//         <div className="mb-5">
//           <label className="block mb-1.5 text-sm font-medium text-gray-400">Tipe Bisnis (Opsional)</label>
//           <select 
//             value={businessType} 
//             onChange={(e) => setBusinessType(e.target.value)} 
//             className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors" 
//             disabled={loading}
//           >
//             <option value="">-- Pilih Tipe Bisnis --</option>
//             <option value="RETAIL">Retail / Dagang</option>
//             <option value="SERVICE">Jasa / Agensi</option>
//             <option value="FNB">Kuliner / FnB</option>
//             <option value="OTHER">Lainnya</option>
//           </select>
//         </div>

//         {/* Tombol Submit Interaktif */}
//         <button 
//           type="submit" 
//           disabled={loading} 
//           className={`w-full p-3 border-none rounded-lg font-semibold text-base transition-all duration-200 
//             ${loading 
//               ? 'bg-gray-700 text-gray-400 cursor-not-allowed shadow-none' 
//               : 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
//             }`}
//         >
//           {loading ? '⏳ Memproses Pendaftaran...' : 'Daftar Sekarang'}
//         </button>
//       </form>

//       {/* Footer Link */}
//       <p className="text-center text-gray-400 text-sm mt-5 mb-0">
//         Sudah punya akun bisnis?{' '}
//         <Link to="/login" className="text-emerald-400 no-underline font-semibold hover:text-emerald-300 transition-colors">
//           Masuk di sini
//         </Link>
//       </p>

//     </div>
//   </div>
// );

// }

// const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#9ca3af' };
// const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '15px', boxSizing: 'border-box', outline: 'none' };
