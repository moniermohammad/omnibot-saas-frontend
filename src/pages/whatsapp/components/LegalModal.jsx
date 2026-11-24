import React from 'react';

export default function LegalModal({ activeDoc, onClose, onAccept }) {
  if (!activeDoc) return null;

  const isTerms = activeDoc === 'TERMS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-left">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white m-0">
              {isTerms
                ? '📜 Syarat & Ketentuan Layanan (Terms of Service)'
                : '🔒 Kebijakan Privasi & Pelindungan Data (UU PDP)'}
            </h3>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">
              Terakhir diperbarui: November 2026 • Berlaku untuk seluruh Pengguna/Tenant Platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Isi Dokumen Legal */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {isTerms ? (
            <>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. Ruang Lingkup Layanan</h4>
                <p className="m-0">
                  Platform menyediakan perangkat lunak otomasi balasan pesan berbasis kecerdasan buatan (AI Auto-Reply) dan manajemen prospek (CRM). Platform bertindak semata-mata sebagai penyedia infrastruktur teknologi dan <strong>bukan merupakan afiliasi resmi dari WhatsApp LLC maupun Meta Platforms, Inc.</strong>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">2. Kepemilikan Nomor & Tanggung Jawab Perangkat</h4>
                <p className="m-0">
                  Pengguna (Tenant) menautkan nomor WhatsApp miliknya sendiri secara sukarela. Pengguna bertanggung jawab penuh atas keamanan akun, kerahasiaan perangkat, serta seluruh isi percakapan yang dikirimkan maupun diterima melalui nomor tersebut.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">3. Larangan Penggunaan (Anti-Spam & Konten Ilegal)</h4>
                <p className="m-0 mb-1">Pengguna dilarang keras menggunakan layanan ini untuk:</p>
                <ul className="list-disc pl-5 space-y-1 m-0">
                  <li>Mengirimkan pesan massal tidak diminta (<em>spam/blast</em>), penipuan, phishing, atau skema ponzi.</li>
                  <li>Menyebarkan konten yang melanggar hukum Republik Indonesia (perjudian online, pinjaman online ilegal, pornografi, atau ujaran kebencian).</li>
                  <li>Melanggar Syarat Layanan WhatsApp maupun peraturan perundang-undangan yang berlaku.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">4. Batasan Tanggung Jawab (Limitation of Liability)</h4>
                <p className="m-0">
                  Platform tidak bertanggung jawab atas pembatasan fitur, penangguhan sementara, maupun pemblokiran permanen akun WhatsApp milik Pengguna oleh pihak WhatsApp/Meta. Ganti rugi atas gangguan teknis layanan dibatasi maksimal sebesar nilai biaya langganan bulan berjalan yang telah dibayarkan Pengguna.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">5. Penangguhan & Pengembalian Dana</h4>
                <p className="m-0">
                  Platform berhak menangguhkan atau memutus akses layanan secara sepihak tanpa pengembalian dana (<em>non-refundable</em>) apabila Pengguna terbukti melanggar ketentuan Anti-Spam atau hukum yang berlaku.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. Peran Pemrosesan Data (UU No. 27 Tahun 2022)</h4>
                <p className="m-0">
                  Sesuai dengan Undang-Undang Pelindungan Data Pribadi (UU PDP) Republik Indonesia, Pengguna (Tenant) bertindak sebagai <strong>Pengendali Data Pribadi</strong> atas data pelanggan/leads miliknya, sedangkan Platform bertindak sebagai <strong>Prosesor Data Pribadi</strong> yang memproses data hanya berdasarkan instruksi dan konfigurasi Pengguna.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">2. Data yang Dikumpulkan & Diproses</h4>
                <ul className="list-disc pl-5 space-y-1 m-0">
                  <li><strong>Data Akun & Bisnis:</strong> Nama bisnis, nama pengguna, nomor telepon operasional, dan konfigurasi alur chatbot.</li>
                  <li><strong>Data Sesi Autentikasi:</strong> Token sesi terenkripsi untuk menjaga koneksi perangkat WhatsApp tetap aktif.</li>
                  <li><strong>Data Prospek (Leads):</strong> Nomor WhatsApp pelanggan dan informasi formulir yang diberikan pelanggan saat berinteraksi dengan bot.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">3. Penggunaan Kecerdasan Buatan (AI) & Pihak Ketiga</h4>
                <p className="m-0">
                  Isi pesan masuk diproses secara otomatis menggunakan model bahasa AI untuk menghasilkan balasan yang relevan. Platform tidak menjual, menyewakan, atau membagikan database kontak maupun leads milik Pengguna kepada pihak ketiga mana pun.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">4. Keamanan & Penghapusan Data</h4>
                <p className="m-0">
                  Data setiap Tenant dipisahkan secara ketat dalam sistem basis data (isolasi multi-tenant). Pengguna dapat memutus koneksi perangkat kapan saja untuk menghapus token autentikasi dari server, serta berhak mengajukan penghapusan seluruh data akun setelah masa langganan berakhir.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/20 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            ✅ Saya Setuju &amp; Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
