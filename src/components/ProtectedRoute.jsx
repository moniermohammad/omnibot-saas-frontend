import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('saas_token');

  // Jika token TIDAK ditemukan di browser, otomatis alihkan ke Landing Page Publik (/)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Jika token ada, izinkan pengguna melihat isi halaman dashboard
  return children;
}
