import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/register/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import DashboardOverview from './pages/dashboard/DashboardOverview';
import WaDevicePage from './pages/whatsapp/WaDevicePage';
import ChatbotConfig from './pages/chatbot/ChatbotConfig';
import CrmLeadsPage from './pages/crm/CrmLeadsPage';
import SuperAdminBilling from './pages/admin/SuperAdminBilling';

import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 JALUR PUBLIK */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/superadmin/billing" element={<SuperAdminBilling />} />

        {/* 🔒 JALUR DASHBOARD (Sidebar & Footer Tetap, Konten Tengah Berubah-ubah) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/whatsapp" element={<WaDevicePage />} />
          <Route path="/dashboard/wa-device" element={<WaDevicePage />} />
          <Route path="/dashboard/chatbots" element={<ChatbotConfig />} />
          <Route path="/dashboard/crm" element={<CrmLeadsPage />} />
          <Route path="/dashboard/leads" element={<CrmLeadsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { LandingPage } from './pages/LandingPage';
// import Login from './pages/auth/Login';
// import Register from './pages/register/Register';
// import DashboardOverview from './pages/dashboard/DashboardOverview';
// import ProtectedRoute from './components/ProtectedRoute';
// import ChatbotConfig from './pages/chatbot/ChatbotConfig'; // 🌟 Pastikan import ini aktif
// import WaDevicePage from './pages/whatsapp/WaDevicePage';
// import SuperAdminBilling from './pages/admin/SuperAdminBilling';
// import CrmLeadsPage from './pages/crm/CrmLeadsPage';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* 🌍 JALUR UTAMA PUBLIK */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/superadmin/billing" element={<SuperAdminBilling />} />
        
//         {/* 🔒 JALUR AMAN INTERNAL INTERNAL SAAS */}
//         {/* 1. Halaman Beranda Utama Overview */}
//         <Route 
//           path="/dashboard" 
//           element={
//             <ProtectedRoute>
//               <DashboardOverview />
//             </ProtectedRoute>
//           } 
//         />

//         {/* 2. Halaman Konfigurasi Chatbot Auto-Reply (KUNCI PERBAIKAN) */}
//         <Route 
//           path="/dashboard/chatbots" 
//           element={
//             <ProtectedRoute>
//               <ChatbotConfig /> {/* 🌟 PERBAIKAN: Ganti dengan ChatbotConfig */}
//             </ProtectedRoute>
//           } 
//         />

//         {/* 2. Halaman Konfigurasi Chatbot Auto-Reply (KUNCI PERBAIKAN) */}
//         <Route 
//           path="/dashboard/whatsapp" 
//           element={
//             <ProtectedRoute>
//               <WaDevicePage /> 
//             </ProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/dashboard/wa-device" 
//           element={
//             <ProtectedRoute>
//               <WaDevicePage /> 
//             </ProtectedRoute>
//           } 
//         />

//         {/* // Di dalam <Routes>: */}
//         <Route 
//           path="/dashboard/crm" 
//           element={
//             <ProtectedRoute>
//               <CrmLeadsPage />
//             </ProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/dashboard/leads" 
//           element={
//             <ProtectedRoute>
//               <CrmLeadsPage />
//             </ProtectedRoute>
//           } 
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
