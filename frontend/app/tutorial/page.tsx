'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../lib/useTheme';
import toast from 'react-hot-toast';
import OnboardingTour from '../../components/OnboardingTour';
import NavbarLinks from '../../components/Navbar';
import { Step } from 'react-joyride';
import { Moon, Sun, Lightbulb, Clapperboard, Eye, Clock, Fish, BubbleIcon } from '../../components/DiveIcons';

export default function TutorialPage() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Semua');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [forceTour, setForceTour] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());

  const markWatched = (id: number) => {
    const userEmail = (localStorage.getItem('user_email') || '').toLowerCase();
    setWatchedVideos(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(`tutorial_watched_${userEmail}`, JSON.stringify([...next]));
      return next;
    });
  };

  React.useEffect(() => {
    if (forceTour) {
      setActiveTab('Semua');
    }
  }, [forceTour]);

  React.useEffect(() => {
    const role = (localStorage.getItem('user_role') || '').toLowerCase();
    const email = (localStorage.getItem('user_email') || '').toLowerCase();
    setIsAdmin(role === 'admin');
    setIsLoggedIn(!!localStorage.getItem('auth_token'));
    setUserName(localStorage.getItem('user_name'));

    // Load watched videos spesifik per user
    const saved = localStorage.getItem(`tutorial_watched_${email}`);
    if (saved) {
      setWatchedVideos(new Set(JSON.parse(saved)));
    }
  }, []);

  const categories = ['Semua', 'Fotografi', 'Videografi', 'Storytelling', 'Editing', 'Etika'];

  const tutorials = [
    {
      id: 1,
      title: 'Fotografi Bawah Laut',
      description: 'Belajar teknik foto bawah laut untuk hasil yang tajam dan memukau.',
      category: 'Fotografi',
      duration: '06:32',
      icon: 'camera',
      color: 'from-blue-500 to-cyan-400',
      progress: 0,
      youtubeUrl: 'https://www.youtube.com/embed/OMmoUzmPprE?autoplay=1',
    },
    {
      id: 2,
      title: 'Teknik-Teknik Videografi',
      description: 'Kuasai teknik pengambilan gambar video yang stabil dan sinematik.',
      category: 'Videografi',
      duration: '08:15',
      icon: 'video',
      color: 'from-purple-500 to-pink-500',
      progress: 0,
      youtubeUrl: 'https://www.youtube.com/embed/V2QpKo1LLJI?autoplay=1',
    },
    {
      id: 3,
      title: 'Storytelling Digital',
      description: 'Bangun cerita yang kuat untuk konten wisata bahari yang menarik.',
      category: 'Storytelling',
      duration: '07:40',
      icon: 'reading',
      color: 'from-emerald-400 to-teal-500',
      progress: 0,
      youtubeUrl: 'https://www.youtube.com/embed/KdNHDwYYD2Y?autoplay=1',
    },
    {
      id: 4,
      title: 'Editing dan Publishing Guide',
      description: 'Panduan editing dan publikasi konten ke berbagai platform secara efektif.',
      category: 'Editing',
      duration: '09:10',
      icon: 'monitor',
      color: 'from-amber-400 to-orange-500',
      progress: 0,
      youtubeUrl: 'https://www.youtube.com/embed/DJ5Wrlb3bxQ?autoplay=1',
    },
    {
      id: 5,
      title: 'Etika dalam Membuat Konten',
      description: 'Pahami etika dan tanggung jawab saat membuat konten wisata bahari.',
      category: 'Etika',
      duration: '05:45',
      icon: 'handshake',
      color: 'from-red-400 to-rose-500',
      progress: 0,
      youtubeUrl: 'https://www.youtube.com/embed/dz_kxLtYFT0?autoplay=1',
    },
  ];

  const filteredTutorials = activeTab === 'Semua' 
    ? tutorials 
    : tutorials.filter(t => t.category === activeTab);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/akademi', label: 'Akademi' },
    { href: '/tutorial', label: 'Tutorial' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const tutorialTourSteps: Step[] = [
    {
      target: '.tour-tutorial-progress',
      content: 'Di sini kamu bisa pantau seberapa banyak video yang udah kamu tonton. Tonton semua biar progresnya 100%! 🎬',
      placement: 'bottom',
    },
    {
      target: '.tour-tutorial-filter',
      content: 'Mau nyari video berdasarkan topik? Filter di sini buat langsung lompat ke kategori yang kamu mau.',
    },
    {
      target: '.tour-tutorial-card',
      content: 'Semua video tutorialnya ada di sini. Tonton, lalu klik tombol "Tandai Sudah Ditonton" buat update progresmu!',
    }
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500/30 transition-colors duration-300 ${isDark ? 'bg-[#00040a] text-white' : 'bg-sky-50 text-gray-900'}`}>
      {!isAdmin && (
        <OnboardingTour 
          steps={tutorialTourSteps} 
          tourKey="tutorialPage" 
          forceRun={forceTour} 
          onFinish={() => setForceTour(false)} 
        />
      )}
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 px-6 py-5 grid grid-cols-3 items-center">
        {/* Logo - left */}
        <div className="flex justify-start">
          <div className={`flex items-center gap-3 backdrop-blur-xl py-2 px-5 rounded-full border shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer w-fit ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/80 border-blue-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/5 border border-blue-500/20 overflow-hidden">
              <img src="/images/logo.png" alt="Dive3D Logo" className="w-full h-full object-cover" />
            </div>
            <span className={`text-lg font-black tracking-widest pr-1 ${isDark ? 'text-white' : 'text-blue-900'}`}>
              DIVEXPLORE
            </span>
          </div>
        </div>

        {/* Nav links - center column */}
        <div className="flex justify-center">
          <NavbarLinks isDark={isDark} className="tour-nav" />
        </div>

        {/* Auth + Theme toggle - right column */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
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
                    setUserName(null);
                    setIsAdmin(false);
                    toast.success('Logout Berhasil!');
                    window.location.href = '/';
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all backdrop-blur-xl ${isDark ? 'text-white border border-white/20 hover:border-white/40 bg-black/40 hover:bg-black/60 shadow-lg shadow-black/20' : 'text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 bg-white'}`}
              >
                Masuk
              </Link>
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
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background glow elements */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 blur-[150px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className={`transition-colors hover:text-cyan-400 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Beranda
            </Link>
            <span className={isDark ? 'text-gray-700' : 'text-gray-400'}>›</span>
            <span className="text-cyan-400 font-bold">Pusat Tutorial</span>
          </div>

          <div className="max-w-3xl">
            <div className={`inline-block px-4 py-1.5 mb-6 rounded-full border text-[11px] font-black tracking-[0.2em] uppercase backdrop-blur-md ${isDark ? 'bg-blue-500/10 border-blue-400/20 text-blue-300' : 'bg-blue-500/10 border-blue-400/20 text-blue-600'}`}>
              <Lightbulb size={18} className="inline-block mr-1" /> Pusat Bantuan & Panduan
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              Pusat{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Tutorial.
              </span>
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Tonton video pembelajaran interaktif untuk menguasai keterampilan pembuatan konten wisata bahari.
            </p>
          </div>
        </div>
      </section>

      {/* TUTORIAL CONTENT SECTION */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">

          {/* Progress Tutorial Card */}
          <div className={`tour-tutorial-progress relative overflow-hidden rounded-[28px] border mb-10 p-6 ${isDark ? 'bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200'}`}>
            {/* Glow background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-cyan-500/15 border border-cyan-500/20' : 'bg-cyan-100 border border-cyan-200'}`}>
                  <Clapperboard size={20} />
                </div>
                <div>
                  <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Progress Tutorial</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Tandai video setelah selesai ditonton</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-cyan-400">{Math.round((watchedVideos.size / 5) * 100)}%</span>
                <p className="text-xs text-gray-500 mt-0.5">{watchedVideos.size} / 5 video</p>
              </div>
            </div>

            {/* Segmen per video */}
            <div className="flex gap-2 relative z-10">
              {[1, 2, 3, 4, 5].map((id) => (
                <div key={id} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full h-2.5 rounded-full transition-all duration-500 ${watchedVideos.has(id) ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <span className={`text-[10px] font-bold ${watchedVideos.has(id) ? 'text-cyan-400' : 'text-gray-600'}`}>V{id}</span>
                </div>
              ))}
            </div>

            {watchedVideos.size === 5 && (
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                  Semua video selesai ditonton!
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="tour-tutorial-filter flex flex-wrap items-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === cat
                    ? isDark
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : isDark
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                      : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tutorial Timeline */}
          <div className="tour-tutorial-list relative flex flex-col gap-12 md:gap-24 py-10">
            {/* Timeline vertical line */}
            <div className={`absolute left-[40px] md:left-1/2 md:-translate-x-1/2 top-10 bottom-10 w-1 border-l-2 border-dashed ${isDark ? 'border-cyan-900/50' : 'border-blue-200'} z-0 hidden sm:block`} />

            {filteredTutorials.map((tutorial, index) => {
              const isEven = index % 2 === 0;
              return (
              <div
                key={tutorial.id}
                className={`relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 ${!isEven ? 'md:flex-row-reverse' : ''} ${index === 0 ? 'tour-tutorial-card' : ''}`}
              >
                {/* Number Badge on Timeline */}
                <div className={`absolute left-[40px] md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 border-4 ${isDark ? 'border-[#00040a]' : 'border-sky-50'} text-white font-black text-2xl flex items-center justify-center z-20 shadow-[0_0_20px_rgba(6,182,212,0.5)] hidden sm:flex`}>
                  {index + 1}
                </div>

                {/* Left/Right Side: Video Thumbnail */}
                <div className={`w-full md:w-1/2 flex ${!isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                  <div className={`relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'} shadow-2xl transition-all hover:shadow-cyan-500/20`}>
                    <iframe 
                      src={tutorial.youtubeUrl.replace('?autoplay=1', '')} 
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                    
                    {/* Number on mobile */}
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center sm:hidden shadow-lg border-2 border-white/20 pointer-events-none z-10">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Right/Left Side: Content */}
                <div className={`w-full md:w-1/2 flex flex-col ${!isEven ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center md:text-left`}>
                  
                  {/* Category & Status */}
                  <div className={`flex flex-wrap items-center gap-3 mb-5 ${!isEven ? 'md:flex-row-reverse' : ''} justify-center md:justify-start`}>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
                      {tutorial.category}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full border ${watchedVideos.has(tutorial.id) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                      {watchedVideos.has(tutorial.id) ? (
                        <>Selesai</>
                      ) : (
                        <><Clock size={16} /> Belum Ditonton</>
                      )}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-3xl md:text-4xl font-black mb-4 transition-colors duration-300 ${isDark ? 'text-white hover:text-cyan-400' : 'text-gray-900 hover:text-blue-600'}`}>
                    {tutorial.title}
                  </h3>
                  <p className={`text-base md:text-lg leading-relaxed mb-6 ${!isEven ? 'md:ml-auto' : ''} max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tutorial.description}
                  </p>

                  {/* Tombol Tandai Selesai */}
                  {!watchedVideos.has(tutorial.id) ? (
                    <button
                      onClick={() => markWatched(tutorial.id)}
                      className={`mt-2 px-5 py-2.5 rounded-full text-sm font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 self-center ${!isEven ? 'md:self-end' : 'md:self-start'}`}
                    >
                      <Eye size={18} /> Tandai Sudah Ditonton
                    </button>
                  ) : (
                    <div className={`mt-2 px-5 py-2.5 rounded-full text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 self-center ${!isEven ? 'md:self-end' : 'md:self-start'}`}>
                      <Clapperboard size={20} /> Video Selesai Ditonton
                    </div>
                  )}

                  {/* Decorative Elements */}
                  <div className={`hidden md:flex items-center gap-4 opacity-40 animate-pulse mt-2 ${!isEven ? 'flex-row-reverse' : ''}`}>
                    <span className="animate-[bounce_3s_infinite]"><BubbleIcon size={20} /></span>
                    <span className="animate-[bounce_4s_infinite_0.5s]"><BubbleIcon size={20} /></span>
                    <span className="animate-[bounce_5s_infinite_1s]"><Fish size={20} /></span>
                  </div>

                </div>
              </div>
            )})}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-10 border-t text-center px-6 relative z-10 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <p className={`text-[10px] tracking-[0.4em] font-bold uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          © 2026 TIM DIVEXPLORE-3D • TEKNOLOGI INFORMASI UNY
        </p>
      </footer>

      {/* Floating Bantuan Button - hanya untuk user biasa */}
      {!isAdmin && (
        <button
          onClick={() => setForceTour(true)}
          title="Tampilkan panduan tour"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm shadow-2xl shadow-cyan-500/40 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
        >
          <Lightbulb size={18} />
          <span className="hidden sm:inline">Bantuan</span>
        </button>
      )}
    </div>
  );
}
