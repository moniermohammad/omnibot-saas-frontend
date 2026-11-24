import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../src/api/authService';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tokenCode, setTokenCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // 1. TAHAP 1: Request OTP menggunakan Service
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await authService.requestToken(phoneNumber);
      if (data.success) {
        setIsOtpSent(true);
        setSuccess(data.message);
      }
    } catch (errMessage) {
      setError(errMessage);
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
        alert(`🎉 Selamat datang kembali, ${data.user.name}!`);
        navigate('/dashboard');
      }
    } catch (errMessage) {
      setError(errMessage);
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
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white text-base box-border outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-white border-none rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim Token...' : 'Minta Kode Verifikasi'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-400">
                Masukkan 6 Digit Token
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value)}
                placeholder="••••••"
                className="w-full p-3 rounded-lg bg-gray-800 border border-white/10 text-white box-border outline-none tracking-[8px] text-center text-xl font-bold focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-white border-none rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk Dashboard'}
            </button>
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className="w-full bg-transparent border-none text-gray-400 mt-4 cursor-pointer text-xs underline hover:text-gray-300 transition-colors"
            >
              Ganti Nomor WhatsApp
            </button>
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
