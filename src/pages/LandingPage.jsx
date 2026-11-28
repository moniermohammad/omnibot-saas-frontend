import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "../index.css";

const CONTEXT_FIELDS = [
  "Nama Lengkap *",
  "Kebutuhan (Pribadi/Perusahaan?) *",
  "Nama Perusahaan (Jika Perusahaan)",
  "Jabatan (Jika Perusahaan)",
  "Jadwal Survei *",
];

const WORKFLOW_STEPS = [
  {
    step: "1",
    title: "AI Menyambut & Menyaring",
    description:
      "Pelanggan menghubungi WhatsApp bisnis Anda. Resepsionis AI menyapa ramah 24 jam dan mengumpulkan seluruh data kebutuhan wajib.",
    delay: "0ms",
  },
  {
    step: "2",
    title: "Distribusi & @Tag Grup Sales",
    description:
      "Sistem menunjuk sales sesuai giliran (Round Robin / penunjukan langsung) ke WhatsApp sales, atau kirim & @Tag sales di grup tim (untuk paket minimal 2 sales).",
    delay: "100ms",
  },
  {
    step: "3",
    title: "Sales Langsung Follow-Up",
    description:
      "Sales langsung menghubungi calon pembeli lewat WhatsApp berbekal ringkasan kebutuhan yang sudah rapi, sementara Owner memantau hasilnya di Dashboard CRM.",
    delay: "200ms",
  },
];

export function LandingPage() {
  const pageRef = useRef(null);
  const progressRef = useRef(null);
  const heroMainRef = useRef(null);
  const contextSectionRef = useRef(null);

  useEffect(() => {
    const rootEl = pageRef.current;
    if (!rootEl) return;

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const motionEls = Array.from(rootEl.querySelectorAll(".scroll-motion")).map(
      (el) => ({
        el,
        speed: parseFloat(el.dataset.scrollSpeed || "-12"),
        scaleBoost: parseFloat(el.dataset.scrollScale || "0"),
      })
    );

    let ticking = false;

    const updateScrollEffects = () => {
      const currentScroll = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        docHeight > 0
          ? Math.min(Math.max(currentScroll / docHeight, 0), 1)
          : 0;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }

      if (!prefersReducedMotion) {
        if (heroMainRef.current) {
          const heroOffset = Math.min(currentScroll * 0.025, 22);
          heroMainRef.current.style.setProperty(
            "--hero-glow-y",
            `${15 + heroOffset}%`
          );
        }

        if (contextSectionRef.current) {
          const rect = contextSectionRef.current.getBoundingClientRect();
          const viewH = window.innerHeight || 1;
          const progress = Math.min(
            Math.max((viewH - rect.top) / (viewH + rect.height), 0),
            1
          );
          const contextOffset = (progress - 0.5) * 32;
          contextSectionRef.current.style.setProperty(
            "--context-glow-y",
            `${50 + contextOffset}%`
          );
        }

        const viewH = window.innerHeight || 1;
        for (let i = 0; i < motionEls.length; i++) {
          const item = motionEls[i];
          const rect = item.el.getBoundingClientRect();
          const centerOffset =
            (rect.top + rect.height * 0.5 - viewH * 0.5) / viewH;
          const clamped = Math.max(-1, Math.min(1, centerOffset));
          const yShift = clamped * item.speed;
          const scaleVal = item.scaleBoost
            ? 1 + (1 - Math.abs(clamped)) * item.scaleBoost
            : 1;
          item.el.style.setProperty("--scroll-y", `${yShift.toFixed(2)}px`);
          item.el.style.setProperty("--scroll-scale", scaleVal.toFixed(4));
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor || !rootEl.contains(anchor)) return;
      const id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      const targetEl = document.getElementById(id);
      if (!targetEl) return;
      e.preventDefault();
      const top = Math.max(
        0,
        targetEl.getBoundingClientRect().top + window.scrollY - 76
      );
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rootEl.addEventListener("click", handleAnchorClick);
    updateScrollEffects();

    const reveals = Array.from(rootEl.querySelectorAll(".reveal"));
    let observer;

    const activateElement = (el) => {
      el.classList.add("is-visible");
      if (el.classList.contains("chat-card")) {
        el.classList.remove("is-playing");
        void el.offsetWidth;
        el.classList.add("is-playing");
      }
    };

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      reveals.forEach(activateElement);
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            if (entry.isIntersecting) {
              activateElement(el);
            } else if (el.classList.contains("chat-card")) {
              el.classList.remove("is-playing");
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -10px 0px" }
      );
      reveals.forEach((el) => observer.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      rootEl.removeEventListener("click", handleAnchorClick);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col justify-between bg-[#090d16] text-white font-sans antialiased selection:bg-blue-600 selection:text-white"
    >
      {/* Navbar */}
      <header className="w-full border-b border-white/5 bg-[#090d16]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 group no-underline">
            <span className="text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              🤖
            </span>
            <span className="font-bold text-lg tracking-tight text-blue-500">
              OmniBot Engine
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-400">
            <a href="#fitur" className="hover:text-white transition">
              Keunggulan
            </a>
            <a href="#context-section" className="hover:text-white transition">
              AI Paham Konteks
            </a>
            <a href="#cara-kerja" className="hover:text-white transition">
              Alur Kerja
            </a>
            <a href="#harga" className="hover:text-white transition">
              Harga
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition no-underline"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-4 py-2 rounded-lg transition shadow-lg shadow-blue-600/20 no-underline"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-full h-[2px] bg-white/5">
          <div
            ref={progressRef}
            id="scroll-progress"
            className="h-full w-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400"
          />
        </div>
      </header>

      <main
        id="hero-main"
        ref={heroMainRef}
        className="flex-grow hero-glow overflow-x-clip"
      >
        {/* 1. Hero Section */}
        <section
          id="top"
          className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center"
        >
          <div className="reveal is-visible inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-medium mb-8">
            <span>✨</span>
            <span>
              Resepsionis AI WhatsApp 24/7 &amp; Distribusi Prospek Tim Sales
            </span>
          </div>

          <h1 className="reveal is-visible text-3xl sm:text-5xl md:text-[52px] font-extrabold tracking-tight leading-[1.2] mb-8">
            Resepsionis AI WhatsApp 24 Jam &amp;
            <br />
            <span className="inline-block mt-2 text-blue-500 md:whitespace-nowrap">
              Pembagi Prospek Otomatis ke Sales
            </span>
          </h1>

          <p className="reveal is-visible text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Biarkan AI menyambut dan menyaring calon pembeli secara otomatis,
            lalu kirim rangkuman prospek siap{" "}
            <em className="text-gray-200 not-italic font-medium">closing</em>{" "}
            langsung ke WhatsApp sales atau{" "}
            <span className="text-blue-400 font-medium">
              @Tag sales otomatis
            </span>{" "}
            di grup tim Anda—tanpa sales perlu repot membuka aplikasi baru.
          </p>

          <div className="reveal is-visible flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm transition shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] no-underline"
            >
              Mulai 14-Hari Free Trial
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#131a29] hover:bg-[#1a2336] active:scale-[0.98] border border-white/10 text-gray-200 font-semibold text-sm transition no-underline"
            >
              Akses Workspace
            </Link>
          </div>
        </section>

        {/* 2. Features Grid (3 Pilar Utama) */}
        <section id="fitur" className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              className="reveal scroll-motion group bg-[#0f1523]/90 border border-white/5 hover:border-blue-500/40 rounded-2xl p-7 transition-colors duration-300 hover:shadow-xl hover:shadow-blue-950/30"
              data-scroll-speed="-16"
              style={{ "--delay": "0ms" }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#182236] flex items-center justify-center mb-6 text-lg transition-transform duration-300 group-hover:scale-110">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                Resepsionis AI Anti-Bisu 24/7
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Balas chat dalam hitungan detik dengan bahasa alami. Dilengkapi{" "}
                <span className="text-blue-400">
                  sistem cadangan otomatis
                </span>{" "}
                jika AI pusat terganggu, sehingga tak ada satu pun prospek
                terabaikan.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="reveal scroll-motion group bg-[#0f1523]/90 border border-white/5 hover:border-blue-500/40 rounded-2xl p-7 transition-colors duration-300 hover:shadow-xl hover:shadow-blue-950/30"
              data-scroll-speed="-8"
              style={{ "--delay": "100ms" }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#182236] flex items-center justify-center mb-6 text-lg transition-transform duration-300 group-hover:scale-110">
                📣
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                @Tag Sales Otomatis di Grup WA
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Atur giliran merata (
                <span className="text-blue-400">Round Robin</span>) atau
                penunjukan langsung ke WhatsApp sales, lengkap dengan fitur{" "}
                <span className="text-emerald-400">
                  share &amp; @Tag sales
                </span>{" "}
                di grup tim (mulai 2 akun sales).
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="reveal scroll-motion group bg-[#0f1523]/90 border border-white/5 hover:border-blue-500/40 rounded-2xl p-7 transition-colors duration-300 hover:shadow-xl hover:shadow-blue-950/30"
              data-scroll-speed="-16"
              style={{ "--delay": "200ms" }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#182236] flex items-center justify-center mb-6 text-lg transition-transform duration-300 group-hover:scale-110">
                🔐
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                Kontrol Owner &amp; Privasi Sales
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Owner dapat memantau seluruh performa tim &amp; ekspor Excel
                dalam satu layar. Sementara tiap sales hanya melihat data prospek
                miliknya sendiri—bebas rebutan data.
              </p>
            </div>
          </div>
        </section>

        {/* 3. AI Paham Konteks */}
        <section
          id="context-section"
          ref={contextSectionRef}
          className="context-glow max-w-5xl mx-auto px-6 py-24"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-medium mb-5">
              <span>⚙️</span>
              <span>AI Paham Konteks</span>
            </div>
            <h2 className="reveal text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Bukan Bot Kaku Biasa — AI Paham Konteks
            </h2>
            <p className="reveal text-gray-400 text-sm sm:text-base leading-relaxed">
              Tersedia 8 template bidang usaha siap pakai (Properti, B2B, Toko
              Online, Klinik, Travel, Kursus, Kemitraan, &amp; CS). Atur alur
              otomatis cukup pakai kalimat biasa.
            </p>
          </div>

          <div className="reveal bg-[#0f1523]/90 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-4">
              Cukup Ketik Target Data Seperti Ini (Tanpa Diagram Rumit) • ★
              Tanda (*) = Data Wajib Diisi Sebelum ke Sales
            </p>
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
              {CONTEXT_FIELDS.map((field, index) => (
                <React.Fragment key={field}>
                  <span className="px-3 py-1.5 rounded-lg bg-[#182236] border border-white/10 text-gray-200">
                    {field}
                  </span>
                  {index < CONTEXT_FIELDS.length - 1 && (
                    <span className="text-gray-500">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulasi Pembeli Pribadi */}
            <div className="reveal chat-card bg-[#0f1523]/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    ↙ Otomatis Skip 2 Pertanyaan
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/20">
                    Pembeli Pribadi
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="chat-bubble bg-[#182236] text-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%]">
                    Kebutuhan ini untuk Pribadi atau Perusahaan?
                  </div>
                  <div className="chat-bubble bg-blue-600/20 border border-blue-500/30 text-blue-100 px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] ml-auto">
                    Untuk pribadi aja kak
                  </div>
                  <div className="chat-bubble bg-[#182236] text-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%]">
                    Baik Kak, boleh info rencana jadwal surveinya?
                  </div>
                </div>
              </div>
              <div className="chat-outcome mt-5 pt-4 border-t border-white/5 text-xs text-emerald-400 font-medium">
                ✓ Langsung melompati pertanyaan Nama Perusahaan &amp; Jabatan
              </div>
            </div>

            {/* Simulasi Pembeli Perusahaan */}
            <div className="reveal chat-card bg-[#0f1523]/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    ↘ Otomatis Gali Data B2B
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950/70 text-blue-300 border border-blue-500/20">
                    Pembeli Perusahaan
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="chat-bubble bg-[#182236] text-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%]">
                    Kebutuhan ini untuk Pribadi atau Perusahaan?
                  </div>
                  <div className="chat-bubble bg-blue-600/20 border border-blue-500/30 text-blue-100 px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] ml-auto">
                    Untuk pengadaan perusahaan
                  </div>
                  <div className="chat-bubble bg-[#182236] text-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%]">
                    Baik Pak/Bu, boleh info Nama Perusahaan &amp; jabatannya?
                  </div>
                </div>
              </div>
              <div className="chat-outcome mt-5 pt-4 border-t border-white/5 text-xs text-blue-400 font-medium">
                ✓ Otomatis menanyakan data wajib perusahaan
              </div>
            </div>
          </div>
        </section>

        {/* 4. Alur Kerja Nyata */}
        <section id="cara-kerja" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="reveal text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Alur Kerja Nyata
            </p>
            <h2 className="reveal text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Tim Sales Cukup Pantau WhatsApp
            </h2>
            <p className="reveal text-gray-400 text-sm sm:text-base">
              Tidak perlu memaksa tim sales belajar sistem baru. Begitu AI
              selesai menyaring tamu, laporan langsung masuk ke WhatsApp sales
              atau grup tim Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="reveal bg-[#0f1523]/90 border border-white/10 rounded-2xl p-7"
                style={{ "--delay": item.delay }}
              >
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-sm flex items-center justify-center mb-5">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Paket Harga Early Bird */}
        <section id="harga" className="max-w-3xl mx-auto px-6 pt-8 pb-24">
          <div className="reveal bg-[#0f1523] border border-blue-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl shadow-blue-950/30">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-medium mb-6">
              <span>⚡</span>
              <span>Promo Early Bird • Terbatas untuk 50 Klien Awal</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Paket Harga Early Bird
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Harga Hemat, Nilai Maksimal untuk Tim Sales
            </p>

            <div className="mb-6">
              <div className="text-sm text-gray-500 line-through mb-1">
                Rp 125.000
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white">
                Rp 85.000{" "}
                <span className="text-base font-medium text-gray-400">
                  / Akun Sales / Bulan
                </span>
              </div>
              <p className="text-xs text-blue-400 mt-3 leading-relaxed">
                Sudah termasuk 1 Akun Owner/Admin &amp; Resepsionis AI Anti-Bisu
                24/7
              </p>
            </div>

            <div className="max-w-md mx-auto text-left bg-[#131a29]/90 border border-white/10 rounded-2xl p-4 mb-8 space-y-2 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>
                  <strong className="text-white">1 Akun Sales:</strong> Laporan
                  prospek dikirim langsung ke WhatsApp pribadi sales.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>
                  <strong className="text-white">Minimal 2 Akun Sales:</strong>{" "}
                  Otomatis membuka pengaturan Share &amp; @Tag Sales ke Grup
                  WhatsApp Tim.
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-4 py-2 rounded-full mb-8">
              <span>🎁</span>
              <span>Uji Coba Gratis 14 Hari Tanpa Risiko</span>
            </div>

            <div>
              <Link
                to="/register"
                className="inline-block w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 no-underline"
              >
                Klaim Promo &amp; Coba Gratis 14 Hari
              </Link>
              <p className="text-xs text-gray-500 mt-4">
                Tanpa kartu kredit • Langsung aktif dalam 2 menit • Garansi
                support penuh
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// import React from "react";
// import { Link } from "react-router-dom";
// import Footer from "../components/Footer";
// import "../index.css";

// export function LandingPage() {
//   return (
//     <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-gray-100 font-sans overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_400px)]">
//       <div>
//         {/* 🧭 Header / Navigation bar */}
//         <header className="flex justify-between items-center px-[4%] md:px-[8%] py-4 md:py-5 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
//           <div className="flex items-center gap-2">
//             <span className="text-2xl">🤖</span>
//             <h2 className="m-0 font-extrabold text-lg bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
//               OmniBot Engine
//             </h2>
//           </div>
//           <div className="flex items-center text-sm md:text-base">
//             <Link
//               to="/login"
//               className="text-gray-400 no-underline mr-4 font-medium hover:text-gray-200 transition-colors"
//             >
//               Masuk
//             </Link>
//             <Link
//               to="/register"
//               className="px-4 py-2 bg-blue-600 text-white no-underline rounded-md font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors"
//             >
//               Daftar
//             </Link>
//           </div>
//         </header>

//         {/* 🚀 Hero Section */}
//         <main className="px-5 md:px-[5%] py-12 md:py-16 text-center max-w-[1000px] mx-auto">
//           <div className="inline-block bg-sky-500/10 text-sky-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border border-sky-500/20 max-w-[90%] leading-relaxed">
//             ✨ Asisten AI WhatsApp 24/7 &amp; CRM Tim Sales Terintegrasi
//           </div>

//           <h1 className="text-3xl sm:text-4xl md:text-[54px] font-extrabold text-white leading-tight md:leading-[1.3] mt-0 mb-5 tracking-tight">
//             Kelola Otomasi Bot Bisnis Anda <br className="hidden sm:inline" />
//             <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
//               Dalam Satu Dashboard
//             </span>
//           </h1>

//           <p className="text-gray-400 text-base md:text-lg max-w-[650px] mx-auto mb-10 leading-relaxed">
//             Bangun, pantau, dan kendalikan bot WhatsApp pintar, alokasi prospek
//             otomatis ke tim sales, dan CRM bisnis Anda secara instan.
//           </p>

//           <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full px-5 sm:px-0 box-border">
//             <Link
//               to="/register"
//               className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white no-underline rounded-lg text-sm md:text-[15px] font-semibold shadow-[0_4px_20px_rgba(37,99,235,0.4)] text-center hover:bg-blue-700 transition-colors box-border"
//             >
//               Mulai 14-Hari Free Trial
//             </Link>
//             <Link
//               to="/login"
//               className="w-full sm:w-auto px-6 py-3.5 bg-white/5 text-white no-underline rounded-lg text-sm md:text-[15px] font-semibold border border-white/10 text-center hover:bg-white/10 transition-colors box-border"
//             >
//               Akses Workspace
//             </Link>
//           </div>

//           {/* 🌟 Features Grid Section */}
//           <section className="mt-20 mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-left px-2 sm:px-0">
//             {/* Card 1 */}
//             <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
//               <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//                 💬
//               </div>
//               <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">
//                 WhatsApp Integration
//               </h3>
//               <p className="text-gray-400 text-sm m-0 leading-relaxed">
//                 Scan QR Code langsung dari dashboard, hubungkan perangkat, dan
//                 balas pesan pelanggan masuk secara{" "}
//                 <span className="text-blue-400 font-medium">real-time</span> 24
//                 jam.
//               </p>
//             </div>

//             {/* Card 2 */}
//             <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
//               <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//                 🤖
//               </div>
//               <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">
//                 AI Chatbot Builder
//               </h3>
//               <p className="text-gray-400 text-sm m-0 leading-relaxed">
//                 Atur gaya bahasa dan layanan chatbot AI sesuai bidang usaha Anda
//                 untuk menyaring prospek potensial secara otomatis.
//               </p>
//             </div>

//             {/* Card 3 */}
//             <div className="bg-[#111827] p-6 rounded-xl border border-white/5 shadow-md hover:border-blue-500/20 transition-all group">
//               <div className="text-xl bg-blue-500/10 w-11 h-11 flex items-center justify-center rounded-lg mb-4 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//                 👥
//               </div>
//               <h3 className="mt-0 mb-2.5 text-lg font-bold text-white">
//                 CRM &amp; Leads Routing
//               </h3>
//               <p className="text-gray-400 text-sm m-0 leading-relaxed">
//                 Simpan data pelanggan otomatis, distribusikan prospek ke tim
//                 sales secara adil, dan pantau progres closing.
//               </p>
//             </div>
//           </section>
//         </main>
//       </div>

//       {/* 🧾 Footer Legal & Bantuan */}
//       <Footer />
//     </div>
//   );
// }
