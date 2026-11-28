import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../src/api/authService';
import { useToast } from '../../components/ToastProvider';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tokenCode, setTokenCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Hitung mundur otomatis setiap 1 detik
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 1. TAHAP 1: Request OTP (Bisa dipanggil dari submit form maupun tombol Kirim Ulang)
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim() || cooldown > 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await authService.requestToken(phoneNumber);
      if (data.success) {
        setIsOtpSent(true);
        setSuccess(data.message);
        setCooldown(data.retryAfter || 60);
      }
    } catch (err) {
      // Menangani baik jika authService melempar string pesan error maupun object response Axios/Fetch
      const message = typeof err === 'string' ? err : err?.message || 'Gagal meminta kode OTP.';
      setError(message);

      // Jika backend mengirim retryAfter (misal saat kena rate limit 429)
      if (err?.retryAfter) {
        setCooldown(err.retryAfter);
        setIsOtpSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. TAHAP 2: Verifikasi OTP menggunakan Service
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!tokenCode.trim()) return;
    setLoading(true);
    setError('');

    try {
      const data = await authService.verifyToken(phoneNumber, tokenCode);
      if (data.success && data.token) {
        localStorage.setItem('saas_token', data.token);
        localStorage.setItem('saas_user', JSON.stringify(data.user));

        showToast(`🎉 Selamat datang kembali, ${data.user.name}!`, 'success');

        if (data.user?.role?.toUpperCase() === 'SALES') {
          navigate('/dashboard/crm', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (errMessage) {
      const message = typeof errMessage === 'string' ? errMessage : errMessage?.message || 'Verifikasi token gagal.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b0f19] text-gray-100 font-sans p-5 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.1),transparent_400px)] box-border">
      <div className="bg-[#111827] p-10 sm:p-[40px_30px] rounded-xl border border-white/5 w-full max-w-[400px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] box-border">
        
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h2 className="mt-2.5 mb-1.5 text-2xl font-extrabold text-blue-400">
            Masuk ke Dashboard Bisnis
          </h2>
          <p className="text-gray-400 text-sm m-0">
            Kami akan mengirimkan kode OTP langsung ke WhatsApp Anda
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm mb-5 border border-red-500/20">
            {error}
          </div>
        )}

        {/* Notifikasi Sukses */}
        {success && (
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-md text-sm mb-5 border border-emerald-500/20">
            {success}
          </div>
        )}

        {/* Form Input */}
        {!isOtpSent ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-400">
                Nomor WhatsApp Terdaftar
              </label>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full p-3 text-white border-none rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Mengirim Token...'
                : cooldown > 0
                ? `Tunggu ${cooldown} detik...`
                : 'Minta Kode Verifikasi'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-400">
                  Masukkan 6 Digit Token
                </label>
                <span className="text-xs text-gray-500">Berlaku 5 menit</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white box-border outline-none tracking-[8px] text-center text-xl font-bold focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || tokenCode.length < 6}
              className="w-full p-3 text-white border-none rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk Dashboard'}
            </button>

            {/* Aksi Sekunder: Kirim Ulang & Ganti Nomor */}
            <div className="flex justify-between items-center mt-4 text-xs">
              <button
                type="button"
                disabled={loading || cooldown > 0}
                onClick={() => handleRequestOtp()}
                className="bg-transparent border-none text-sky-400 cursor-pointer hover:text-sky-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors p-0"
              >
                {cooldown > 0 ? `Kirim ulang (${cooldown}d)` : 'Kirim Ulang Kode'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setTokenCode('');
                  setError('');
                  setSuccess('');
                }}
                className="bg-transparent border-none text-gray-400 cursor-pointer underline hover:text-gray-300 transition-colors p-0"
              >
                Ganti Nomor WA
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <p className="text-center text-gray-400 text-sm mt-6 mb-0">
          Belum mendaftarkan bisnis?{' '}
          <Link to="/register" className="text-sky-400 no-underline font-semibold hover:text-sky-300 transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}


// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { authService } from '../../../src/api/authService';
// import { useToast } from '../../components/ToastProvider';

// export default function Login() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [tokenCode, setTokenCode] = useState('');
//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();
//   const { showToast } = useToast();

//   // 1. TAHAP 1: Request OTP menggunakan Service
//   const handleRequestOtp = async (e) => {
//     e.preventDefault();
//     if (!phoneNumber.trim()) return;
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     try {
//       const data = await authService.requestToken(phoneNumber);
//       if (data.success) {
//         setIsOtpSent(true);
//         setSuccess(data.message);
//       }
//     } catch (errMessage) {
//       setError(errMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. TAHAP 2: Verifikasi OTP menggunakan Service
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     if (!tokenCode.trim()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const data = await authService.verifyToken(phoneNumber, tokenCode);
//       if (data.success && data.token) {
//         localStorage.setItem('saas_token', data.token);
//         localStorage.setItem('saas_user', JSON.stringify(data.user));

//         // ✅ Tampilkan toast cantik yang tetap muncul walau langsung pindah halaman
//         showToast(`🎉 Selamat datang kembali, ${data.user.name}!`, 'success');

//         if (data.user?.role?.toUpperCase() === 'SALES') {
//           navigate('/dashboard/crm', { replace: true });
//         } else {
//           navigate('/dashboard', { replace: true });
//         }
//       }
//     } catch (errMessage) {
//       setError(errMessage);
//       showToast(typeof errMessage === 'string' ? errMessage : 'Verifikasi token gagal.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };



//   return (
//     <div className="flex justify-center items-center min-h-screen bg-[#0b0f19] text-gray-100 font-sans p-5 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.1),transparent_400px)] box-border">
//       <div className="bg-[#111827] p-10 sm:p-[40px_30px] rounded-xl border border-white/5 w-full max-w-[400px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] box-border">
        
//         {/* Header */}
//         <div className="text-center mb-6">
//           <span className="text-4xl">🔐</span>
//           <h2 className="mt-2.5 mb-1.5 text-2xl font-extrabold text-blue-400">
//             Masuk ke Dashboard Bisnis
//           </h2>
//           <p className="text-gray-400 text-sm m-0">
//             Kami akan mengirimkan kode OTP langsung ke WhatsApp Anda
//           </p>
//         </div>


//         {/* Notifikasi Error */}
//         {error && (
//           <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm mb-5 border border-red-500/20">
//             {error}
//           </div>
//         )}

//         {/* Notifikasi Sukses */}
//         {success && (
//           <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-md text-sm mb-5 border border-emerald-500/20">
//             {success}
//           </div>
//         )}

//         {/* Form Input */}
//         {!isOtpSent ? (
//           <form onSubmit={handleRequestOtp}>
//             <div className="mb-6">
//               <label className="block mb-2 text-sm font-medium text-gray-400">
//                 Nomor WhatsApp Terdaftar
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value)}
//                 placeholder="Contoh: 08123456789"
//                 className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-blue-500 transition-colors"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full p-3 text-white border-none rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Mengirim Token...' : 'Minta Kode Verifikasi'}
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleVerifyOtp}>
//             <div className="mb-6">
//               <label className="block mb-2 text-sm font-medium text-gray-400">
//                 Masukkan 6 Digit Token
//               </label>
//               <input
//                 type="text"
//                 required
//                 maxLength={6}
//                 value={tokenCode}
//                 onChange={(e) => setTokenCode(e.target.value)}
//                 placeholder="••••••"
//                 className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white box-border outline-none tracking-[8px] text-center text-xl font-bold focus:border-emerald-500 transition-colors"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full p-3 text-white border-none rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk Dashboard'}
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsOtpSent(false)}
//               className="w-full bg-transparent border-none text-gray-400 mt-4 cursor-pointer text-xs underline hover:text-gray-300 transition-colors"
//             >
//               Ganti Nomor WhatsApp
//             </button>
//           </form>
//         )}

//         {/* Footer Link */}
//         <p className="text-center text-gray-400 text-sm mt-6 mb-0">
//           Belum mendaftarkan bisnis?{' '}
//           <Link to="/register" className="text-sky-400 no-underline font-semibold hover:text-sky-300 transition-colors">
//             Daftar di sini
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
