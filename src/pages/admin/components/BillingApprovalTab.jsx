import React, { useState } from "react";

export default function BillingApprovalTab({
  transactions = [],
  approvingId,
  onApprove,
  onReject,
}) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Hitung ringkasan pendapatan
  const totalRevenue = transactions
    .filter((t) => t.status === "PAID")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const pendingCount = transactions.filter(
    (t) => t.status === "PENDING",
  ).length;
  const paidCount = transactions.filter((t) => t.status === "PAID").length;

  // Filter daftar transaksi
  const filteredTransactions = transactions.filter((t) => {
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchStatus;
    const matchSearch =
      t.orderId?.toLowerCase().includes(q) ||
      t.tenant?.businessName?.toLowerCase().includes(q) ||
      String(t.tenant?.waNumber || "")
        .toLowerCase()
        .includes(q);
    return matchStatus && matchSearch;
  });

  // Helper format nomor WA (08xx -> 628xx) dan URL wa.me yang valid
  const buildWaUrl = (rawPhone, message) => {
    let cleanWa = String(rawPhone || "").replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }
    return `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">
            Menunggu Konfirmasi (PENDING)
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {pendingCount} Invoice
          </div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">
            Total Transaksi Berhasil
          </span>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {paidCount} Lunas
          </div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total Pendapatan Masuk</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PAID", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-sky-600 text-white"
                  : "bg-[#0f172a] text-slate-400 border border-white/10 hover:text-white"
              }`}
            >
              {st === "ALL"
                ? "Semua"
                : st === "PENDING"
                  ? "⏳ Pending"
                  : st === "PAID"
                    ? "✅ Lunas"
                    : "❌ Ditolak"}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Cari No. Invoice atau Nama Bisnis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white outline-none focus:border-sky-500 sm:w-72"
        />
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 uppercase text-[11px]">
                <th className="py-3.5 px-4">No. Invoice &amp; Waktu</th>
                <th className="py-3.5 px-4">Bisnis / Tenant</th>
                <th className="py-3.5 px-4">Detail Paket</th>
                <th className="py-3.5 px-4">Nominal Transfer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500 italic"
                  >
                    Tidak ada data transaksi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const formattedAmount = `Rp ${Number(trx.amount || 0).toLocaleString("id-ID")}`;

                  const waNotifyUrl = buildWaUrl(
                    trx.tenant?.waNumber,
                    `Halo *${trx.tenant?.businessName || "Kak"}*, pembayaran invoice *${trx.orderId}* sebesar *${formattedAmount}* telah kami terima.\n\nPaket langganan Anda untuk *${trx.salesQuota} Akun Sales (${trx.months} Bulan)* sudah aktif kembali. Terima kasih! 🙏`,
                  );

                  const waRejectUrl = buildWaUrl(
                    trx.tenant?.waNumber,
                    `Halo *${trx.tenant?.businessName || "Kak"}*, mohon maaf pengajuan pembayaran invoice *${trx.orderId}* sebesar *${formattedAmount}* belum dapat kami setujui (DITOLAK) karena dana transfer belum terverifikasi.\n\nSilakan lakukan konfirmasi ulang dengan melampirkan bukti transfer yang valid atau hubungi admin kami. Terima kasih 🙏`,
                  );

                  return (
                    <tr
                      key={trx.transactionId || trx.orderId}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white">
                          {trx.orderId}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(trx.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">
                          {trx.tenant?.businessName || "-"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          +{trx.tenant?.waNumber || "-"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                          {trx.salesQuota} Sales • {trx.months} Bulan
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-white">
                        {formattedAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            trx.status === "PAID"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : trx.status === "REJECTED"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {trx.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {trx.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={approvingId === trx.orderId}
                              onClick={() => onApprove(trx)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer shadow-md disabled:opacity-50"
                            >
                              {approvingId === trx.orderId
                                ? "⏳ Memproses..."
                                : "✅ Setujui & Aktifkan"}
                            </button>

                            <button
                              type="button"
                              disabled={approvingId === trx.orderId}
                              onClick={() => onReject(trx)}
                              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/35 font-bold rounded-lg text-[11px] transition-all cursor-pointer disabled:opacity-50"
                            >
                              ❌ Tolak
                            </button>
                          </div>
                        ) : trx.status === "REJECTED" ? (
                          <a
                            href={waRejectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-semibold no-underline transition-colors"
                          >
                            📲 Kabari Penolakan via WA
                          </a>
                        ) : (
                          <a
                            href={waNotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold no-underline transition-colors"
                          >
                            📲 Kabari via WA
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}