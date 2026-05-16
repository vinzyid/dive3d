'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../lib/useTheme';
import toast from 'react-hot-toast';
import OnboardingTour from '../components/OnboardingTour';
import NavbarLinks from '../components/Navbar';
import { Step } from 'react-joyride';
import { Moon, Sun, Eye, EyeOff, Clapperboard, Volume2, Fish, Lightbulb, Leaf, AlertTriangle, Shield } from '../components/DiveIcons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export default function HomePage() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [forceTour, setForceTour] = useState(false);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [videoDuration, setVideoDuration] = useState('00:00');

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 menit dalam ms

  const getAttemptData = () => {
    const raw = localStorage.getItem('login_attempts');
    if (!raw) return { count: 0, lockUntil: 0 };
    try { return JSON.parse(raw); } catch { return { count: 0, lockUntil: 0 }; }
  };

  const saveAttemptData = (data: { count: number; lockUntil: number }) => {
    localStorage.setItem('login_attempts', JSON.stringify(data));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Cek lockout
    const attempts = getAttemptData();
    const now = Date.now();
    if (attempts.lockUntil > now) {
      const secsLeft = Math.ceil((attempts.lockUntil - now) / 1000);
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${Math.floor(secsLeft / 60)}m ${secsLeft % 60}s.`);
      return;
    }

    setIsLoginProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gagal — tambah hitungan
        const newCount = attempts.count + 1;
        if (newCount >= MAX_ATTEMPTS) {
          const lockUntil = now + LOCKOUT_DURATION;
          saveAttemptData({ count: newCount, lockUntil });
          const secsLeft = Math.ceil(LOCKOUT_DURATION / 1000);
          setError(`Akun dikunci sementara (${MAX_ATTEMPTS}x gagal). Coba lagi dalam 15 menit.`);
          // Mulai countdown
          setLockoutCountdown(secsLeft);
        } else {
          saveAttemptData({ count: newCount, lockUntil: 0 });
          const sisa = MAX_ATTEMPTS - newCount;
          throw new Error((data.message || 'Email atau password salah!') + ` (sisa ${sisa} percobaan)`);
        }
        return;
      }

      // Berhasil — reset hitungan
      saveAttemptData({ count: 0, lockUntil: 0 });
      setLockoutCountdown(0);

      const role = data.role ?? data.user?.role ?? 'user';
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', data.user?.name ?? '');
      localStorage.setItem('user_email', data.user?.email ?? '');

      setIsLoggedIn(true);
      setUserRole(role);
      setIsAdmin(role?.toLowerCase().trim() === 'admin');
      setUserName(data.user?.name ?? '');
      setShowLoginModal(false);
      toast.success('Login Berhasil!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoginProcessing(false);
    }
  };

  // Countdown timer saat lockout
  React.useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('');
          return 0;
        }
        const remaining = prev - 1;
        setError(`Akun dikunci sementara. Coba lagi dalam ${Math.floor(remaining / 60)}m ${remaining % 60}s.`);
        return remaining;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutCountdown]);

  const handleProtectedNav = (e: React.MouseEvent, href: string) => {
    const protectedRoutes = ['/gallery', '/akademi', '/tutorial', '/dashboard'];
    if (!isLoggedIn && protectedRoutes.includes(href)) {
      e.preventDefault();
      setError(`Silakan Login atau Daftar terlebih dahulu untuk mengakses menu ${href.replace('/', '')}.`);
      setShowLoginModal(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    setIsLoggedIn(!!token);
    setUserRole(role);
    setIsAdmin(role?.toLowerCase().trim() === 'admin');
    setUserName(localStorage.getItem('user_name'));

    // Ambil durasi video dari YouTube secara dinamis
    const videoId = 'BaXG2yKrtww';
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      const player = new (window as any).YT.Player('temp-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        events: {
          'onReady': (event: any) => {
            const duration = event.target.getDuration();
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            setVideoDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            event.target.destroy();
          }
        }
      });
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/akademi', label: 'Akademi' },
    { href: '/tutorial', label: 'Tutorial' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const homeTourSteps: Step[] = [
    {
      target: '.tour-logo',
      content: 'Halo! 👋 Selamat datang di DIVEXPLORE. Ini platform keren buat kamu menjelajahi keindahan laut Raja Ampat secara virtual.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav',
      content: 'Di menu ini kamu bisa meluncur ke berbagai fitur seru kayak Galeri, Akademi, Tutorial, dan Dashboard pribadi kamu.',
      placement: 'bottom',
    },
    {
      target: '.tour-auth',
      content: 'Belum punya akun? Daftar atau masuk dulu yuk, biar kamu bisa akses semua materi dan bikin karyamu sendiri!',
    },
    {
      target: '.tour-theme',
      content: 'Lebih suka gelap atau terang? Kamu bebas atur tema website di sini sesuai selera matamu.',
    },
    {
      target: '.tour-explore',
      content: 'Udah siap? Klik tombol ini buat mulai petualangan seru kamu ke dunia bawah laut! 🌊',
      skipScroll: true,
    }
  ];

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden animate-in fade-in duration-1000 transition-colors ${isDark ? 'bg-[#00040a] text-white' : 'bg-sky-50 text-gray-900'}`}>

      {!isAdmin && (
        <OnboardingTour
          steps={homeTourSteps}
          tourKey="homePage"
          forceRun={forceTour}
          onFinish={() => setForceTour(false)}
        />
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 px-6 py-5 grid grid-cols-3 items-center">
        {/* Logo - left */}
        <div className="flex justify-start">
          <div className={`tour-logo flex items-center gap-3 backdrop-blur-xl py-2 px-5 rounded-full border shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/80 border-blue-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/5 border border-blue-500/20 overflow-hidden">
              <img src="/images/logo.png" alt="Dive3D Logo" className="w-full h-full object-cover" />
            </div>
            <span className={`text-lg font-black tracking-widest pr-1 ${isDark ? 'text-white' : 'text-blue-900'}`}>DIVEXPLORE</span>
          </div>
        </div>

        {/* Nav links - center column */}
        <div className="flex justify-center">
          <NavbarLinks
            isDark={isDark}
            className="tour-nav"
            onLinkClick={(href, e) => handleProtectedNav(e, href)}
          />
        </div>

        {/* Auth + Toggle - right column */}
        <div className="flex justify-end">
          <div className="tour-auth hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-4 px-2">
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                  Halo, {userName || (isAdmin ? 'Admin' : 'Pengguna')}!
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_name');
                    localStorage.removeItem('user_email');
                    setIsLoggedIn(false);
                    setUserRole(null);
                    setUserName(null);
                    toast.success('Logout Berhasil!');
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all backdrop-blur-xl ${isDark ? 'text-white border border-white/20 hover:border-white/40 bg-black/40 hover:bg-black/60 shadow-lg shadow-black/20' : 'text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 bg-white'}`}
                >
                  Masuk
                </button>
                <Link href="/register"
                  className="px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                >
                  Daftar
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Mode Gelap' : 'Mode Terang'}
              className={`tour-theme w-10 h-10 rounded-full flex items-center justify-center transition-all text-base backdrop-blur-md ${isDark ? 'bg-black/40 hover:bg-black/60 border border-white/20 shadow-lg shadow-black/20' : 'bg-white hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">

        {/* Background Image - Full Width */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.jpg" alt="Raja Ampat" className="w-full h-full object-cover object-center" />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 transition-colors duration-1000 ${isDark ? 'bg-gradient-to-r from-[#00040a] via-[#00040a]/80 to-transparent' : 'bg-gradient-to-r from-[#eef8ff] via-[#eef8ff]/90 to-transparent'}`}></div>
          {/* Bottom Fade Overlay for smooth transition */}
          <div className={`absolute bottom-0 left-0 right-0 h-40 transition-colors duration-1000 ${isDark ? 'bg-gradient-to-t from-[#00040a] to-transparent' : 'bg-gradient-to-t from-[#eef8ff] to-transparent'}`}></div>
        </div>

        {/* Konten */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-32 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT: Teks */}
          <div className="pr-0 md:pr-10">
            <p className={`text-base md:text-lg mb-1 font-bold transition-colors ${isDark ? 'text-gray-300' : 'text-[#041e42]'}`}>Selamat Datang di</p>
            <h1 className={`text-6xl md:text-[5.5rem] font-black mb-4 leading-none tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#041e42]'}`}>
              DIVEXPLORE
            </h1>
            <p className={`font-bold text-lg md:text-xl mb-6 leading-snug transition-colors ${isDark ? 'text-cyan-400' : 'text-[#0056b3]'}`}>
              Jelajahi Keindahan Raja Ampat,<br />Lestarikan Laut untuk Masa Depan.
            </p>
            <p className={`text-sm md:text-base mb-10 leading-relaxed max-w-xl transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Platform wisata bahari dan pembelajaran interaktif yang mengajakmu mengenal, mencintai, dan menjaga ekosistem laut Raja Ampat melalui pengalaman 3D dan konten edukatif.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <a
                href="#info-raja-ampat"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('info-raja-ampat')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="tour-explore group btn-interactive-wave flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-base font-black rounded-full transition-all duration-300 shadow-[0_0_40px_-10px_rgba(0,168,255,0.5)] hover:shadow-[0_0_60px_-15px_rgba(0,168,255,0.7)] hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 transition-all duration-300">
                  <span className="text-[14px] transform -rotate-45 group-hover:rotate-0 transition-transform duration-300">➤</span>
                </div>
                MULAI JELAJAH
              </a>
            </div>

            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-semibold mb-12 transition-colors ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-[#dff1ff] text-[#0066cc]'}`}>
              <Leaf size={18} /> Bersama kita jaga laut, kehidupan, dan masa depan.
            </div>
          </div>

          {/* RIGHT: Video card */}
          <div className={`rounded-2xl overflow-hidden border w-full max-w-xl lg:ml-auto p-2 backdrop-blur-md transition-colors shadow-2xl ${isDark ? 'bg-[#000814]/60 border-cyan-900/50' : 'bg-[#003366]/10 border-white/40'}`}>
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#00102a]' : 'bg-[#002244]'}`}>
              <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <Clapperboard size={20} className="text-white" />
                <p className="text-sm font-semibold text-white">Trailer DIVEXPLORE</p>
              </div>

              <div className="relative aspect-[16/10] flex items-center justify-center bg-black/40 overflow-hidden">
                <img src="https://img.youtube.com/vi/BaXG2yKrtww/maxresdefault.jpg" alt="Trailer" className="absolute inset-0 w-full h-full object-cover opacity-80" />

                <button
                  onClick={() => setShowTrailer(true)}
                  className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white transition-colors">
                    <span className="text-[#0044aa] text-3xl ml-1">▶</span>
                  </div>
                </button>

                <div className="absolute bottom-0 left-0 right-0 z-10">
                  <div className="h-1 bg-white/20">
                    <div className="h-full w-0 bg-blue-500"></div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-2 bg-black/60 backdrop-blur-md">
                    <span className="text-white text-xs font-medium">00:00 / {videoDuration}</span>
                    <div className="ml-auto flex items-center gap-4">
                      <button className="text-white hover:text-blue-300 transition-colors"><Volume2 size={18} /></button>
                      <button className="text-white hover:text-blue-300 text-lg transition-colors">⛶</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMASI RAJA AMPAT SECTION */}
      <section id="info-raja-ampat" className="relative py-24 min-h-screen flex items-center">
        {/* Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
        >
          <div className={`absolute inset-0 transition-colors duration-1000 ${isDark ? 'bg-[#00040a]/90' : 'bg-sky-900/90 backdrop-blur-sm'}`}></div>
          {/* Top Fade Overlay for smooth transition from hero */}
          <div className={`absolute top-0 left-0 right-0 h-40 transition-colors duration-1000 ${isDark ? 'bg-gradient-to-b from-[#00040a] to-transparent' : 'bg-gradient-to-b from-[#eef8ff] to-transparent'}`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Informasi Tentang Raja Ampat</h2>
            <div className="w-24 h-1 bg-cyan-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className={`p-8 rounded-2xl border backdrop-blur-md transition-transform hover:-translate-y-2 duration-300 ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/10 border-white/20 shadow-xl'}`}>
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]"><Fish size={20} /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Mengapa Raja Ampat Istimewa?</h3>
              <p className="text-cyan-300 text-sm font-semibold mb-4 uppercase tracking-wider">Coral Triangle · Biodiversitas</p>
              <p className="text-gray-200 text-sm leading-relaxed mb-4">
                Raja Ampat adalah epicentrum biodiversitas laut dunia — bagian dari Coral Triangle yang mencakup 6 juta km² perairan tropis. Di sini terdapat:
              </p>
              <ul className="text-gray-200 text-sm leading-relaxed list-disc list-inside space-y-2 mb-4">
                <li>Lebih dari 550–600 spesies karang (~75% spesies karang dunia)</li>
                <li>Lebih dari 1.600 spesies ikan termasuk hiu, manta, dan penyu</li>
                <li>Ekosistem tiga lapis: terumbu karang, padang lamun, dan mangrove</li>
              </ul>
              <p className="text-gray-300 text-sm italic border-l-2 border-cyan-400 pl-3">
                Kawasan ini berfungsi sebagai reservoir genetik — menyebarkan larva ikan ke seluruh Indo-Pasifik bila ekosistem lain terganggu.
              </p>
            </div>

            {/* Card 2 */}
            <div className={`p-8 rounded-2xl border backdrop-blur-md transition-transform hover:-translate-y-2 duration-300 ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/10 border-white/20 shadow-xl'}`}>
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.5)] text-red-400"><AlertTriangle size={24} /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Ancaman Nyata Ekosistem</h3>
              <p className="text-red-300 text-sm font-semibold mb-4 uppercase tracking-wider">Dampak Manusia · Perubahan Iklim</p>
              <p className="text-gray-200 text-sm leading-relaxed mb-4">
                Ekosistem Raja Ampat menghadapi tekanan dari dua arah:
              </p>
              <ul className="text-gray-200 text-sm leading-relaxed list-disc list-inside space-y-2 mb-4">
                <li><strong className="text-white">Overfishing</strong> — berkurangnya ikan herbivora menyebabkan alga tumbuh tak terkendali dan menutupi karang</li>
                <li><strong className="text-white">Coral Bleaching</strong> — kenaikan suhu laut memicu karang kehilangan alga simbion (zooxanthellae) dan perlahan mati</li>
                <li><strong className="text-white">Polusi plastik</strong> — mikroplastik masuk ke rantai makanan laut hingga ke tubuh manusia</li>
                <li><strong className="text-white">Sedimentasi</strong> — menutup polip karang dan menghambat penetrasi cahaya untuk fotosintesis</li>
              </ul>
              <p className="text-gray-300 text-sm italic border-l-2 border-red-400 pl-3">
                Setiap penyelam yang menyentuh karang, sekecil apapun, berkontribusi pada kerusakan yang tidak bisa pulih dalam hitungan tahun.
              </p>
            </div>

            {/* Card 3 */}
            <div className={`p-8 rounded-2xl border backdrop-blur-md transition-transform hover:-translate-y-2 duration-300 ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/10 border-white/20 shadow-xl'}`}>
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,197,94,0.5)] text-green-400"><Shield size={24} /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Strategi Pelestarian</h3>
              <p className="text-green-300 text-sm font-semibold mb-4 uppercase tracking-wider">MPA · Sasi Laut · Ekowisata</p>
              <p className="text-gray-200 text-sm leading-relaxed mb-4">
                Berbagai pendekatan digunakan untuk menjaga laut Raja Ampat tetap sehat:
              </p>
              <ul className="text-gray-200 text-sm leading-relaxed list-disc list-inside space-y-2 mb-4">
                <li><strong className="text-white">Kawasan Konservasi Perairan (MPA)</strong> — zonasi ketat: zona inti bebas aktivitas manusia, zona wisata diawasi</li>
                <li><strong className="text-white">Sasi Laut</strong> — kearifan lokal yang membatasi pengambilan hasil laut secara musiman, terbukti efektif</li>
                <li><strong className="text-white">Transplantasi Karang</strong> — rehabilitasi terumbu rusak menggunakan reef star dan spider frame</li>
                <li><strong className="text-white">Retribusi Konservasi</strong> — setiap wisatawan membayar tag konservasi untuk mendanai patroli dan monitoring</li>
              </ul>
              <p className="text-gray-300 text-sm italic border-l-2 border-green-400 pl-3">
                Sebagai penyelam, kamu adalah bagian dari solusi — jangan sentuh karang, gunakan mooring buoy, dan bawa kembali sampahmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRAILER MODAL */}
      {showTrailer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTrailer(false)}></div>
          <div className="relative z-10 w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white text-sm font-semibold flex items-center gap-2"><Clapperboard size={20} /> Trailer DIVEXPLORE</p>
              <button onClick={() => setShowTrailer(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/BaXG2yKrtww?autoplay=1"
                title="Divexplore 3D Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`py-12 border-t px-6 flex flex-col items-center justify-center gap-6 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <p className={`text-[10px] tracking-[0.4em] font-bold uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          © 2026 TIM DIVEXPLORE-3D • TEKNOLOGI INFORMASI UNY
        </p>
      </footer>
      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="w-full max-w-md p-8 rounded-[28px] bg-[#00040a] border border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="text-center mb-8 mt-2">
              <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Sistem Login
              </h1>
              <p className="text-sm text-gray-400">Silakan login untuk mengakses Sistem</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium text-center animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  placeholder="user@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoginProcessing}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoginProcessing ? 'Memproses...' : 'Masuk ke Sistem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Floating Bantuan Button - hanya untuk user biasa, sembunyikan jika Admin */}
      {!(isLoggedIn && userRole?.toLowerCase().trim() === 'admin') && (
        <button
          onClick={() => setForceTour(true)}
          title="Tampilkan panduan tour"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm shadow-2xl shadow-cyan-500/40 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
        >
          <Lightbulb size={18} />
          <span className="hidden sm:inline">Bantuan</span>
        </button>
      )}
      {/* Temporary element for YT API duration fetching */}
      <div id="temp-player" className="hidden"></div>
    </div>
  );
}
