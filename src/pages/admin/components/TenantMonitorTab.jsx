import React, { useState, useEffect, useCallback } from "react";
import { billingService } from "../../../api/billingService";

export default function TenantMonitorTab({
  adminKey,
  refreshTrigger,
  onDisconnectedCountChange,
}) {
  const [tenants, setTenants] = useState([]);
  const [summary, setSummary] = useState({
    totalTenants: 0,
    totalAdmins: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reconnectingId, setReconnectingId] = useState(null);
  const [suspendingId, setSuspendingId] = useState(null);
  const [detailTenant, setDetailTenant] = useState(null);

  const fetchData = useCallback(async () => {
    if (!adminKey || typeof billingService.getTenantWaMonitor !== "function") {
      return;
    }
    try {
      setLoading(true);
      const res = await billingService.getTenantWaMonitor(adminKey);
      if (res?.success) {
        const list = res.data || [];
        setTenants(list);
        if (res.summary) setSummary(res.summary);
        onDisconnectedCountChange?.(
          list.filter((t) => t.waStatus === "DISCONNECTED").length
        );
      }
    } finally {
      setLoading(false);
    }
  }, [adminKey, onDisconnectedCountChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleReconnect = async (t) => {
    if (
      !window.confirm(
        `Paksa reconnect & aktifkan kembali WA untuk ${t.businessName}?`
      )
    ) {
      return;
    }
    try {
      setReconnectingId(t.id);
      const res = await billingService.forceReconnectTenant(t.id, adminKey);
      alert(res?.message || "Perintah reconnect dikirim.");
      fetchData();
    } catch (err) {
      alert(err);
    } finally {
      setReconnectingId(null);
    }
  };

  const handleSuspend = async (t) => {
    if (
      !window.confirm(
        `Putuskan koneksi WA & nonaktifkan sementara layanan untuk "${t.businessName}"?\n\nBot akan berhenti merespons chat sampai diaktifkan kembali.`
      )
    ) {
      return;
    }
    try {
      setSuspendingId(t.id);
      const res = await billingService.suspendTenant(t.id, adminKey);
      alert(`⛔ ${res?.message || "Layanan tenant berhasil diputuskan."}`);
      fetchData();
    } catch (err) {
      alert(err);
    } finally {
      setSuspendingId(null);
    }
  };

  const getWaUrl = (t) => {
    const phone = String(t.waNumber || "")
      .replace(/\D/g, "")
      .replace(/^0/, "62");
    const msg = `Halo *${t.businessName}*, admin OmniBot Engine ingin menginfokan status WA bot Anda saat ini *${t.waStatus}*. Ada yang bisa kami bantu?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const filtered = tenants.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.waStatus === statusFilter;
    const q = searchQuery.toLowerCase();
    return (
      matchStatus &&
      (!q ||
        t.businessName?.toLowerCase().includes(q) ||
        t.tenantCode?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5">
      {/* 3 Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Tenant</span>
          <div className="text-2xl font-black text-white mt-1">
            {summary.totalTenants} Bisnis
          </div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Admin / Owner</span>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {summary.totalAdmins} Akun
          </div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Sales Aktif</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {summary.totalSales} Sales
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["ALL", `Semua (${tenants.length})`],
            [
              "CONNECTED",
              `🟢 Tersambung (${tenants.filter((t) => t.waStatus === "CONNECTED").length})`,
            ],
            [
              "DISCONNECTED",
              `🔴 Terputus (${tenants.filter((t) => t.waStatus === "DISCONNECTED").length})`,
            ],
            [
              "UNSCANNED",
              `🟡 Belum QR (${tenants.filter((t) => t.waStatus === "UNSCANNED").length})`,
            ],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                statusFilter === key
                  ? "bg-sky-600 text-white"
                  : "bg-[#0f172a] text-slate-400 border border-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="🔍 Cari Bisnis / Kode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-1.5 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white outline-none focus:border-sky-500 sm:w-64"
        />
      </div>

      {/* Tabel */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 uppercase text-[11px]">
              <th className="py-3 px-4">Tenant &amp; Tim</th>
              <th className="py-3 px-4">Paket &amp; Riwayat Sewa</th>
              <th className="py-3 px-4">Koneksi WA</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  ⏳ Memuat...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Tidak ada data tenant.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">
                      {t.businessName}{" "}
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({t.tenantCode || "-"})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {t.adminCount} Admin • {t.salesCount}/{t.maxSales} Sales
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        t.subscriptionStatus === "SUSPENDED" ||
                        t.subscriptionStatus === "EXPIRED"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-sky-500/15 text-sky-300"
                      }`}
                    >
                      {t.subscriptionStatus}
                    </span>
                    <span className="ml-1.5 text-slate-300">
                      {t.daysLeft > 0 ? `${t.daysLeft} hari lagi` : "Habis"}
                    </span>
                    <div className="text-[11px] text-emerald-400 mt-0.5">
                      Total Sewa: Rp{" "}
                      {Number(t.totalPaidAmount || 0).toLocaleString("id-ID")} (
                      {t.paidCount || 0}x)
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold">
                      {t.waStatus === "CONNECTED"
                        ? "🟢 Tersambung"
                        : t.waStatus === "DISCONNECTED"
                          ? "🔴 Terputus"
                          : "🟡 Belum QR"}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Bot: {t.botNumber || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setDetailTenant(t)}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      📜 Detail
                    </button>
                    <button
                      type="button"
                      disabled={reconnectingId === t.id}
                      onClick={() => handleReconnect(t)}
                      className="px-2.5 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      🔄 Reconnect
                    </button>
                    <button
                      type="button"
                      disabled={
                        suspendingId === t.id ||
                        t.subscriptionStatus === "SUSPENDED"
                      }
                      onClick={() => handleSuspend(t)}
                      className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-40"
                    >
                      {suspendingId === t.id ? "⏳..." : "⛔ Putuskan"}
                    </button>
                    {t.waNumber && (
                      <a
                        href={getWaUrl(t)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold no-underline"
                      >
                        💬 Chat
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Detail Riwayat Sewa */}
      {detailTenant && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setDetailTenant(null)}
        >
          <div
            className="bg-[#0f172a] border border-white/15 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white m-0">
                  📜 Riwayat Sewa — {detailTenant.businessName}
                </h3>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                  Aktif s/d{" "}
                  {detailTenant.subscriptionEnd
                    ? new Date(detailTenant.subscriptionEnd).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailTenant(null)}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!detailTenant.paidHistory?.length ? (
              <p className="text-xs text-slate-400 text-center py-6 italic">
                Belum ada riwayat pembayaran lunas (Free Trial / Sistem).
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-white/10 text-xs">
                {detailTenant.paidHistory.map((item) => (
                  <div
                    key={item.orderId}
                    className="py-2.5 flex justify-between items-center gap-3"
                  >
                    <div>
                      <div className="font-mono font-bold text-white">
                        {item.orderId}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.salesQuota} Sales • {item.months} Bulan
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">
                        Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.paidAt
                          ? new Date(item.paidAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}