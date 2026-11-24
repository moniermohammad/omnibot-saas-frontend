import React from 'react';

export default function BusinessProfileSection({ keywordTrigger, setKeywordTrigger, companyProfile, setCompanyProfile }) {
  return (
    <div className="space-y-4 border-b border-white/5 pb-5">
      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider m-0">🏢 Profil Bisnis Utama</h4>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-300">🔑 Kata Kunci Utama (Keyword Trigger)</label>
        <input
          type="text"
          required
          value={keywordTrigger}
          onChange={(e) => setKeywordTrigger(e.target.value)}
          placeholder="Contoh: halo, menu, layanan"
          className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors"
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-300">Pesan Pembuka / Keterangan Perusahaan</label>
        <textarea
          rows={3}
          required
          value={companyProfile}
          onChange={(e) => setCompanyProfile(e.target.value)}
          placeholder="Contoh: Kami adalah PT BotKilat Digital yang bergerak di bidang software otomasi marketing..."
          className="w-full p-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm outline-none focus:border-sky-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
}
