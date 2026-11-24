import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout() {
  return (
    <div className="flex bg-[#030712] min-h-screen text-[#f8fafc] font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
