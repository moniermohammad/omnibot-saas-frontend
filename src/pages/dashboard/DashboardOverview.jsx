import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BillingModal from '../../components/BillingModal';
import DashboardHeader from './components/DashboardHeader';
import KpiStatsGrid from './components/KpiStatsGrid';
import RecentLeadsCard from './components/RecentLeadsCard';
import SalesLeaderboardCard from './components/SalesLeaderboardCard';
import { dashboardService } from '../../api/dashboardService';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'User', businessName: 'Bisnis Anda', tenantId: '...' });
  const [waStatus, setWaStatus] = useState('CHECKING');
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [saasInfo, setSaasInfo] = useState({ status: 'FREE_TRIAL', daysLeft: 0, loading: true });
  
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const [botMetrics, setBotMetrics] = useState({
    totalActive: 0,
    totalLeads: 0,
    activeSalesCount: 0,
    conversionRate: 0,
    phoneNumber: '',
    loading: true,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [salesPerformance, setSalesPerformance] = useState([]);

  // ✅ Bungkus dengan useCallback agar bisa dipanggil oleh tombol "Periksa Ulang" (onCheck)
  const fetchDashboardData = useCallback(async () => {
    const savedUser = localStorage.getItem('saas_user');
    if (!savedUser) return;

    let currentTenantId = null;
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser((prev) => ({ ...prev, ...parsedUser }));
      currentTenantId = parsedUser.tenantId;
    } catch (e) {
      console.error('Gagal membaca session user:', e);
    }

    if (!currentTenantId || currentTenantId === '...') return;

    try {
      setBotMetrics((prev) => ({ ...prev, loading: true }));
      const data = await dashboardService.getOverviewMetrics();

      if (data?.success && data?.tenant) {
        setWaStatus(data.whatsapp?.status || 'OFFLINE');
        setUser((prev) => ({
          ...prev,
          businessName: data.tenant.businessName || prev.businessName,
        }));
        setSaasInfo({
          status: data.tenant.status,
          daysLeft: data.tenant.daysLeft,
          loading: false,
          tenantCode: data.tenant.tenantCode || prev.tenantCode, // <-- Tambahkan 1 baris ini saja!
        });
        setBotMetrics({
          totalActive: data.metrics?.totalChatbots || 0,
          totalLeads: data.metrics?.totalLeads || 0,
          activeSalesCount: data.metrics?.activeSalesCount || 0,
          conversionRate: data.metrics?.conversionRate || 0,
          phoneNumber: data.whatsapp?.botNumber || '',
          loading: false,
        });
        setRecentLeads(data.recentLeads || []);
        setSalesPerformance(data.salesPerformance || []);
      } else {
        setSaasInfo({ status: 'EXPIRED', daysLeft: 0, loading: false });
        setBotMetrics((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('🚨 Gagal sinkronisasi data dasbor:', error);
      setWaStatus('OFFLINE');
      setSaasInfo({ status: 'EXPIRED', daysLeft: 0, loading: false });
      setBotMetrics((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="flex bg-[#030712] min-h-screen text-[#f8fafc] font-sans antialiased box-border relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row w-full relative z-10">
        {/* <Sidebar /> */}

        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          
          <DashboardHeader
            user={user}
            saasInfo={saasInfo}
            onOpenBilling={() => setIsBillingOpen(true)}
          />

          {/* Banner Masa Trial Habis */}
          {!saasInfo.loading && saasInfo.status !== 'ACTIVE' && saasInfo.daysLeft === 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="text-sm font-bold text-white m-0">Akses Bot Terkunci - Masa Trial Habis!</h4>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Sesi trial 14 hari Anda sudah kedaluwarsa. Perpanjang sekarang agar bot WhatsApp kembali merespons pelanggan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBillingOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shrink-0 cursor-pointer"
              >
                💳 Perpanjang Sekarang
              </button>
            </div>
          )}
          {/* Letakkan tepat di bawah <WaStatusCard ... /> di DashboardOverview.jsx */}
           {!botMetrics.loading && botMetrics.totalActive === 0 && (
             <div className="p-4 bg-sky-500/10 border border-sky-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">🤖</span>
                 <div>
                   <h4 className="text-sm font-bold text-white m-0">Alur Auto-Reply Bot Belum Diatur</h4>
                   <p className="text-xs text-slate-400 m-0 mt-0.5">
                     Buat minimal 1 subjek layanan agar AI mulai melayani pelanggan dan membagikan prospek ke tim sales.
                   </p>
                 </div>
               </div>
               <button
                 type="button"
                 onClick={() => navigate('/dashboard/chatbots')}
                 className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
               >
                 ⚙️ Atur Chatbot Sekarang →
               </button>
             </div>
           )}

          <KpiStatsGrid metrics={botMetrics} saasStatus={saasInfo.status} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            <RecentLeadsCard recentLeads={recentLeads} />
            <SalesLeaderboardCard salesPerformance={salesPerformance} />
          </div>
        </div>
      </div>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} tenant={user} />
    </div>
  );
}
