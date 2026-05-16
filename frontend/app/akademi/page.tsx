'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTheme } from '../../lib/useTheme';
import toast from 'react-hot-toast';
import OnboardingTour from '../../components/OnboardingTour';
import NavbarLinks from '../../components/Navbar';
import { Step } from 'react-joyride';
import {
    Moon, Sun, GraduationCap, Waves, Lightbulb, Fish, CoralIcon, TurtleIcon, JellyfishIcon, Trash2, Leaf, Package, DiveIcon,
} from '../../components/DiveIcons';

const ModelViewer = dynamic(() => import('../../components/ModelViewer'), { ssr: false });

const modelInfoData: Record<string, { title: string, sciName: string, desc: string, funFact: string }> = {
    'ikan': {
        title: 'Ikan Badut (Clownfish)',
        sciName: 'Amphiprioninae',
        desc: 'Ikan hias kecil berwarna cerah ini hidup bersimbiosis dengan anemon laut. Anemon melindunginya dari predator, sementara ikan badut membersihkan parasit dari anemon.',
        funFact: 'Tubuh mereka dilapisi lendir khusus yang membuatnya kebal dari sengatan mematikan anemon laut!'
    },
    'butterfly': {
        title: 'Ikan Kepe-kepe',
        sciName: 'Chaetodontidae',
        desc: 'Sering dijumpai di sekitar terumbu karang tropis. Bentuk tubuhnya pipih dan coraknya sangat cerah untuk mengecoh pemangsa di sela-sela karang.',
        funFact: 'Beberapa spesies memiliki "mata palsu" di bagian belakang tubuhnya untuk membingungkan arah predator.'
    },
    'parrot': {
        title: 'Ikan Kakatua',
        sciName: 'Scaridae',
        desc: 'Dinamakan kakatua karena susunan giginya menyatu seperti paruh burung. Mereka sangat berjasa memakan alga yang bisa mematikan pertumbuhan karang.',
        funFact: 'Kotoran ikan kakatua berupa pasir putih bersih. Sebagian besar pasir putih di pantai tropis berasal dari ikan ini!'
    },
    'karang': {
        title: 'Terumbu Karang',
        sciName: 'Anthozoa',
        desc: 'Terumbu karang bukanlah batu, melainkan kumpulan ribuan hewan kecil bersimbiosis dengan alga. Mereka membangun struktur kapur besar yang jadi rumah jutaan biota laut.',
        funFact: 'Meski tampak seperti daratan, karang hidup dan hanya tumbuh beberapa sentimeter saja setiap tahunnya.'
    },
    'karang-acro': {
        title: 'Karang Acropora',
        sciName: 'Acroporidae',
        desc: 'Salah satu jenis karang pembangun terumbu utama yang tumbuh dengan bentuk bercabang seperti tanduk rusa.',
        funFact: 'Acropora adalah tipe karang yang sangat sensitif terhadap perubahan suhu laut dan rentan mengalami pemutihan.'
    },
    'coral1': {
        title: 'Koloni Karang Massif',
        sciName: 'Faviidae',
        desc: 'Struktur karang yang padat dan kokoh. Pola permukaannya sering kali bergelombang menyerupai bentuk otak manusia.',
        funFact: 'Saking kuat dan kerasnya, karang ini sering menjadi tameng alami untuk menahan hantaman ombak badai.'
    },
    'coral2': {
        title: 'Karang Meja (Table Coral)',
        sciName: 'Acropora spp.',
        desc: 'Berbentuk pipih dan melebar bagai sebuah meja. Permukaan luas ini berfungsi untuk menangkap cahaya matahari secara maksimal.',
        funFact: 'Ikan-ikan kecil sering menjadikan bagian bawah karang meja ini sebagai "payung" untuk bersembunyi.'
    },
    'coral3': {
        title: 'Karang Berbatu (Stony Coral)',
        sciName: 'Scleractinia',
        desc: 'Komponen utama pembentuk fondasi terumbu laut dalam. Menghasilkan zat kapur secara terus-menerus.',
        funFact: 'Hanya mencari mangsa berupa plankton mikroskopis di malam hari dengan menjulurkan tentakelnya.'
    },
    'tridacna': {
        title: 'Kerang Kima',
        sciName: 'Tridacna',
        desc: 'Kerang yang menempel mati di terumbu karang. Cangkangnya memiliki bibir bergelombang lebar dan corak mantel yang berwarna-warni cemerlang.',
        funFact: 'Corak warna-warni kima selalu berbeda-beda pada setiap individunya, layaknya sidik jari manusia!'
    },
    'tridacna-gigas': {
        title: 'Kima Raksasa',
        sciName: 'Tridacna gigas',
        desc: 'Spesies kerang terbesar di lautan dunia. Bisa tumbuh hingga panjang lebih dari 1 meter dan berat lebih dari 200 kg.',
        funFact: 'Legenda mengatakan kerang raksasa ini bisa menjepit manusia, padahal sebenarnya ia lambat menutup cangkangnya.'
    },
    'zooplankton': {
        title: 'Zooplankton (Daphnia)',
        sciName: 'Daphnia pulex',
        desc: 'Hewan mikroskopis yang melayang bebas di kedalaman laut. Ini adalah sumber makanan terpenting bagi berbagai makhluk laut hingga paus raksasa.',
        funFact: 'Mereka memiliki kebiasaan migrasi unik: naik ke permukaan laut saat malam, dan kembali tenggelam ke dalam saat siang.'
    },
    'fitoplankton': {
        title: 'Fitoplankton',
        sciName: 'Phytoplankton',
        desc: 'Tumbuhan renik (mikroskopis) yang mengambang di lautan. Mereka menjadi ujung pangkal (produsen) di jaring rantai makanan samudra.',
        funFact: 'Lebih dari 50% oksigen di Bumi—yang kita hirup saat ini—ternyata diproduksi oleh mereka di lautan!'
    },
    'penyu': {
        title: 'Penyu Hijau',
        sciName: 'Chelonia mydas',
        desc: 'Reptil purba penjelajah samudra tropis. Penyu dewasa merupakan hewan herbivora yang menjaga keseimbangan populasi padang lamun.',
        funFact: 'Warna hijau pada namanya tidak berasal dari tempurung, melainkan dari lemak hijau di bawah kulit akibat diet alga/lamun.'
    },
    'lumba-lumba': {
        title: 'Lumba-Lumba Hidung Botol',
        sciName: 'Tursiops truncatus',
        desc: 'Mamalia laut cerdas yang bersahabat. Hidup berkelompok (pod) dan saling berkomunikasi menggunakan gelombang ekolokasi atau sonar alami.',
        funFact: 'Lumba-lumba tidur dengan memejamkan satu matanya bergantian agar setengah otaknya tetap sadar dan tidak tenggelam.'
    },
    'dugong': {
        title: 'Dugong (Sapi Laut)',
        sciName: 'Dugong dugon',
        desc: 'Mamalia laut pemalu yang bergerak lambat. Habitat utamanya adalah perairan dangkal yang kaya akan padang lamun.',
        funFact: 'Siluet dugong dari jauh dianggap sebagai inspirasi legenda putri duyung (mermaid) oleh para pelaut zaman kuno.'
    },
    'rumput': {
        title: 'Rumput Laut',
        sciName: 'Macroalgae',
        desc: 'Berbeda dengan tanaman darat, mereka tidak punya akar dan daun sejati. Hanya menempel di substrat batu dan menyerap nutrisi langsung dari air laut.',
        funFact: 'Rumput laut menghasilkan zat karagenan yang digunakan luas pada es krim, kosmetik, hingga kapsul obat.'
    },
    'rumput2': {
        title: 'Padang Lamun (Seagrass)',
        sciName: 'Zosteraceae',
        desc: 'Satu-satunya tumbuhan berbunga (Angiospermae) yang bisa beradaptasi penuh hidup di dalam air laut yang asin.',
        funFact: 'Kemampuan padang lamun dalam menyerap gas karbon diperkirakan 35 kali lipat lebih tangguh dibanding hutan darat.'
    },
    'rumput3': {
        title: 'Alga Cokelat (Kelp)',
        sciName: 'Phaeophyceae',
        desc: 'Jenis alga besar yang tumbuh merambat vertikal seperti pohon, hingga membentuk "hutan" kelp lebat yang menopang ribuan spesies laut.',
        funFact: 'Dalam kondisi habitat optimal, Giant Kelp mampu memanjang sangat kilat hingga mencapai 60 cm per harinya!'
    },
    'botol2': {
        title: 'Sampah Botol Plastik',
        sciName: 'Polietilena Tereftalat (PET)',
        desc: 'Sampah anorganik buatan manusia. Jutaan ton plastik ini terdampar di lautan setiap tahun, mencekik biota laut dan mengotori terumbu karang.',
        funFact: 'Di lautan, satu botol plastik ini butuh waktu hingga 450 tahun lamanya untuk bisa terurai dan tetap menjadi ancaman mikroplastik.'
    },
    'ekosistem': {
        title: 'Ekosistem Terumbu Karang',
        sciName: 'Coral Reef Ecosystem',
        desc: 'Jejaring kehidupan bawah laut yang sangat kompleks dan indah. Meski hanya menutupi kurang dari 1% dasar samudra, tempat ini menjadi rumah bagi lebih dari 25% dari seluruh spesies laut di Bumi.',
        funFact: 'Satu ekosistem karang sehat mampu melindungi garis pantai dari amukan badai secara alami, fungsinya sama seperti tembok beton penahan ombak!'
    }
};

const getModelUrl = (tab: string) => {
    switch(tab) {
        case 'ekosistem': return 'https://huggingface.co/buckets/alysasalsaa/dive3d-models/resolve/ekosistem3d.glb';
        case 'ikan': return '/models/ClownFish3D/ClownFish3d.glb';
        case 'karang': return '/models/usnm_74016-100k-2048-gltf_std/usnm_74016-100k-2048.gltf';
        case 'tridacna': return '/models/Tridacna/TridacnaAhnaf3D.glb';
        case 'tridacna-gigas': return '/models/Tridacna Gigas/Tridacna Gigas.glb';
        case 'zooplankton': return '/models/Zooplankton Daphnia/Zooplankton daphnia.glb';
        case 'penyu': return '/models/Penyu Hijau/PenyuHijau3D_Textured_00001.glb';
        case 'lumba-lumba': return '/models/Lumba-Lumba/Lumba_Lumba.glb';
        case 'dugong': return '/models/Dugong/Dugong.glb';
        case 'butterfly': return '/models/Butterfly Fish/Butterflyfish3D-compressed.glb';
        case 'parrot': return '/models/Parrot Fish/ParrotFish3D-compressed.glb';
        case 'fitoplankton': return '/models/Fitoplankton/FitoplanktonfromAhnaf3d.glb';
        case 'botol2': return '/models/Botol Plastik/botol plastik banyak.glb';
        case 'coral1': return '/models/Coral/Coral3_3D.glb';
        case 'coral2': return '/models/Coral/CoralfromAhnaf2_3D.glb';
        case 'coral3': return '/models/Coral/CoralsExtraAhn3D.glb';
        case 'karang-acro': return '/models/Karang/Karang Acropora (bercabang)3D.glb';
        case 'rumput': return '/models/Rumput Laut/Seaweed3D.glb';
        case 'rumput2': return '/models/Rumput Laut/SeaweedAgain3D.glb';
        case 'rumput3': return '/models/Rumput Laut/rumputlautLagi3D.glb';
        default: return null;
    }
};

export default function AkademiPage() {
    const pathname = usePathname();
    const { isDark, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('lms');
    const [active3DTab, setActive3DTab] = useState('ikan');
    const [currentLMSIndex, setCurrentLMSIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Drag to scroll logic
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
        scrollLeft.current = scrollRef.current?.scrollLeft || 0;
    };
    const onMouseLeave = () => { isDragging.current = false; };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };
    const [forceTour, setForceTour] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    const nextModule = () => setCurrentLMSIndex((prev) => (prev + 1) % lmsModules.length);
    const prevModule = () => setCurrentLMSIndex((prev) => (prev - 1 + lmsModules.length) % lmsModules.length);

    const lmsModules = [
        { id: 1, slug: 'ekosistem-laut', title: 'Ekosistem Laut', img: '/images/2.png' },
        { id: 2, slug: 'biota-laut', title: 'Biota Laut', img: '/images/1.png' },
        { id: 3, slug: 'terumbu-karang', title: 'Terumbu Karang', img: '/images/3.png' },
        { id: 4, slug: 'sampah-laut', title: 'Sampah Laut', img: '/images/4.png' },
    ];

    const totalModules = lmsModules.length;
    const [completedQuizTitles, setCompletedQuizTitles] = useState<string[]>([]);

    useEffect(() => {
        const userEmail = (localStorage.getItem('user_email') || '').toLowerCase();
        const saved = localStorage.getItem(`completed_quizzes_${userEmail}_konservasi-laut`);
        const done = saved ? JSON.parse(saved) : [];
        setCompletedQuizTitles(Array.isArray(done) ? done : []);
        const role = (localStorage.getItem('user_role') || '').toLowerCase();
        setIsAdmin(role === 'admin');
        setIsLoggedIn(!!localStorage.getItem('auth_token'));
        setUserName(localStorage.getItem('user_name'));
    }, []);

    const completedModules = completedQuizTitles.length;

    const navLinks = [
        { href: '/', label: 'Beranda' },
        { href: '/gallery', label: 'Galeri' },
        { href: '/akademi', label: 'Akademik' },
        { href: '/tutorial', label: 'Tutorial' },
        { href: '/dashboard', label: 'Dashboard' },
    ];

    const lmsTourSteps: Step[] = [
        {
            target: '.tour-akademi-tabs',
            content: 'Di Akademi ini, kamu bisa pilih cara belajarmu! Mau baca Modul lengkap di LMS atau langsung interaksi sama biota pakai 3D Interaktif.',
            placement: 'bottom',
        },
        {
            target: '.tour-lms-module',
            content: 'Ini dia daftar modulnya. Geser panahnya buat lihat modul lain, dan klik tombolnya buat mulai belajar!',
        },
        {
            target: '.tour-lms-progress',
            content: 'Pantau terus progres belajarmu di sini ya, pastikan kamu lulus semua kuis evaluasinya. 💪',
        }
    ];

    const threeDTourSteps: Step[] = [
        {
            target: '.tour-3d-header',
            content: 'Selamat datang di Ruang 3D! Di sini kamu bisa berinteraksi langsung dengan model biota laut.',
            placement: 'bottom',
        },
        {
            target: '.tour-3d-viewer',
            content: 'Ini adalah area utama. Kamu bisa putar objeknya dengan mouse, zoom in/out, dan geser-geser sepuasnya.',
            placement: 'top',
        },
        {
            target: '.tour-3d-tabs',
            content: 'Gunakan filter ini buat milih biota mana yang mau kamu lihat secara 3D. Seru banget kan?',
            placement: 'top',
        }
    ];

    const currentSteps = activeTab === '3d' ? threeDTourSteps : lmsTourSteps;
    const currentTourKey = activeTab === '3d' ? 'akademi3DPage' : 'akademiPage';

    return (
        <div className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300 ${isDark ? 'bg-[#00040a] text-white' : 'bg-[#f4f9ff] text-gray-900'} relative`}>
            {!isAdmin && (
                <OnboardingTour 
                    steps={currentSteps} 
                    tourKey={currentTourKey} 
                    forceRun={forceTour} 
                    onFinish={() => setForceTour(false)} 
                />
            )}
            
            {/* Background elements for light theme */}
            {!isDark && (
                <div className="absolute top-0 right-0 pointer-events-none opacity-50 z-0">
                    <div className="w-[500px] h-[300px] bg-blue-100 rounded-full blur-[100px] absolute -top-20 -right-20"></div>
                </div>
            )}

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 px-6 py-5 grid grid-cols-3 items-center pointer-events-none">
                {/* Logo - left */}
                <div className="flex justify-start">
                  <div className={`pointer-events-auto flex items-center gap-3 backdrop-blur-xl py-2 px-5 rounded-full border shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer w-fit ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/80 border-blue-100 shadow-sm'}`}>
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
                  <NavbarLinks isDark={isDark} className="tour-nav pointer-events-auto" />
                </div>

                {/* Auth + Theme toggle - right */}
                <div className="flex justify-end">
                  <div className="pointer-events-auto flex items-center gap-2">
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
            <section className="relative pt-40 pb-12 px-6">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-2 text-sm mb-8">
                        <Link href="/" className={`transition-colors hover:text-cyan-400 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Beranda
                        </Link>
                        <span className={isDark ? 'text-gray-700' : 'text-gray-400'}>›</span>
                        <span className="text-cyan-400 font-bold">Akademi Konservasi</span>
                    </div>

                    <div className="max-w-3xl">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border text-[11px] font-black tracking-[0.2em] uppercase ${isDark ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300' : 'bg-cyan-500/10 border-cyan-400/20 text-cyan-600'}`}>
                            <GraduationCap size={24} /> Modul Pembelajaran 3D
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
                            Akademi{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                                Konservasi.
                            </span>
                        </h1>
                        <p className={`text-lg md:text-xl max-w-2xl leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Pelajari ekosistem laut Raja Ampat melalui modul interaktif dan jelajahi spesimen dalam lingkungan 3D WebGL.
                        </p>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
                
                {/* Main Box Container */}
                <div className={`rounded-[32px] p-6 md:p-8 border min-h-[70vh] flex flex-col ${isDark ? 'bg-[#000814] border-white/10 shadow-2xl' : 'bg-white border-blue-100 shadow-[0_10px_40px_-15px_rgba(59,130,246,0.15)]'}`}>
                    
                    {/* Tabs Centered */}
                    <div className={`tour-akademi-tabs flex items-center rounded-2xl p-1.5 mb-8 max-w-md mx-auto w-full shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <button
                            onClick={() => setActiveTab('lms')}
                            className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'lms' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-600' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Leaf size={18} /> LMS
                        </button>
                        <button
                            onClick={() => setActiveTab('3d')}
                            className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === '3d' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-600' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Package size={18} /> 3D Interaktif
                        </button>
                    </div>

                    {/* CONTENT VIEWS */}
                    <div className="flex-grow flex flex-col">
                        
                        {/* --- VIEW: LMS --- */}
                        {activeTab === 'lms' && (
                            <div className="flex flex-col flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#0a1e3f]'}`}>Modul Pembelajaran (LMS)</h2>
                                
                                {/* Modul Carousel - FULL WIDTH */}
                                <div className="tour-lms-module relative mb-8 w-full group px-2 md:px-6">
                                    
                                    {/* Left Arrow */}
                                    <button onClick={prevModule} className={`absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100 ${isDark ? 'bg-[#001020] text-white border border-white/10 hover:bg-blue-600' : 'bg-white text-blue-900 border border-blue-100 hover:bg-blue-50'}`}>
                                        <span className="text-xl">←</span>
                                    </button>

                                    {/* Right Arrow */}
                                    <button onClick={nextModule} className={`absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100 ${isDark ? 'bg-[#001020] text-white border border-white/10 hover:bg-blue-600' : 'bg-white text-blue-900 border border-blue-100 hover:bg-blue-50'}`}>
                                        <span className="text-xl">→</span>
                                    </button>

                                    {/* Active Module Card */}
                                    <div className={`rounded-[32px] border p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-all duration-500 overflow-hidden ${isDark ? 'bg-[#001020] border-white/10 shadow-2xl' : 'bg-white border-blue-100 shadow-[0_10px_40px_-15px_rgba(59,130,246,0.2)]'}`}>
                                        
                                        <div className="w-full md:w-1/2 aspect-[16/10] bg-blue-100 rounded-2xl overflow-hidden border border-gray-100 relative shadow-inner">
                                            <div className="w-full h-full flex items-center justify-center text-6xl transition-transform duration-700 hover:scale-105" style={{backgroundImage: `url(${lmsModules[currentLMSIndex].img})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                                {!lmsModules[currentLMSIndex].img && <Waves size={20} />}
                                            </div>
                                            {/* Badge */}
                                            <div className="absolute top-4 left-4 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg">
                                                {lmsModules[currentLMSIndex].id}
                                            </div>
                                        </div>

                                        <div className="w-full md:w-1/2 flex flex-col text-left">
                                            <div className={`inline-block px-4 py-1.5 mb-4 rounded-full border text-[11px] font-black tracking-[0.2em] uppercase w-max ${isDark ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
                                                Modul {currentLMSIndex + 1} dari {lmsModules.length}
                                            </div>
                                            <h3 className={`text-3xl md:text-5xl font-black leading-tight mb-4 ${isDark ? 'text-white' : 'text-[#0a1e3f]'}`}>
                                                {lmsModules[currentLMSIndex].title}
                                            </h3>
                                            <p className={`text-base md:text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Pelajari lebih dalam mengenai {lmsModules[currentLMSIndex].title.toLowerCase()} dan bagaimana peranannya dalam menjaga kelestarian alam di perairan Raja Ampat.
                                            </p>
                                            
                                            <div className="mb-8">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Progres Belajar</span>
                                                    <span className={`text-lg font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{completedQuizTitles.includes(`Kuis: ${lmsModules[currentLMSIndex].title}`) ? 100 : 0}%</span>
                                                </div>
                                                <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out" style={{ width: completedQuizTitles.includes(`Kuis: ${lmsModules[currentLMSIndex].title}`) ? '100%' : '0%' }}></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <Link href={`/lms?track=konservasi-laut&module=${lmsModules[currentLMSIndex].slug}&from=akademi`} className="px-8 py-4 bg-blue-600 text-white text-[15px] font-bold rounded-full shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-1 text-center w-full md:w-auto">
                                                    Mulai Belajar Modul Ini
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                    
                                    {/* Indicators */}
                                    <div className="flex justify-center gap-2 mt-6">
                                        {lmsModules.map((_, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => setCurrentLMSIndex(idx)}
                                                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentLMSIndex ? 'w-10 bg-blue-500' : isDark ? 'w-2.5 bg-white/20 hover:bg-white/40' : 'w-2.5 bg-blue-200 hover:bg-blue-400'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Area: Informasi Kuis & Progres */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
                                    <div className={`p-8 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#f4f9ff] border-blue-100'}`}>
                                        <div>
                                            <h3 className={`font-bold text-xl mb-3 ${isDark ? 'text-white' : 'text-[#0a1e3f]'}`}>Informasi Kuis & Evaluasi</h3>
                                            <p className={`text-sm mb-6 font-medium leading-relaxed max-w-md ${isDark ? 'text-gray-400' : 'text-[#3b5275]'}`}>Kuis evaluasi telah terintegrasi di dalam setiap modul. Silakan klik "Mulai Belajar Modul Ini" di atas, pelajari materinya, dan kerjakan kuis di akhir modul tersebut untuk mendapatkan sertifikat kelulusan.</p>
                                        </div>
                                        <div className={`self-start px-5 py-2.5 rounded-xl flex items-center gap-3 font-bold text-sm border shadow-sm ${isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                            <Lightbulb size={18} /> Kuis tersedia di dalam Modul
                                        </div>
                                    </div>

                                    <div className={`tour-lms-progress p-8 rounded-3xl border flex items-center gap-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
                                                <path className={isDark ? 'text-white/10' : 'text-gray-100'} stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="text-blue-600" strokeDasharray={`${Math.round((completedModules / totalModules) * 100)}, 100`} stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute flex flex-col items-center justify-center">
                                                <span className={`font-black text-3xl ${isDark ? 'text-white' : 'text-[#0a1e3f]'}`}>{Math.round((completedModules / totalModules) * 100)}%</span>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Selesai</span>
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className={`font-bold text-xl mb-3 ${isDark ? 'text-white' : 'text-[#0a1e3f]'}`}>Ringkasan Progres</h3>
                                            <div className={`p-4 rounded-xl border mb-3 ${isDark ? 'bg-[#001020] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Modul Akademik</span>
                                                    <span className={`text-sm font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{completedModules}/{totalModules}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                                    <span>Status Kuis Evaluasi</span>
                                                    <span>{completedModules} dari {totalModules} Lulus</span>
                                                </div>
                                                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${(completedModules / totalModules) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- VIEW: 3D INTERAKTIF --- */}
                        {activeTab === '3d' && (
                            <div className="flex flex-col flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[800px]">
                                <div className="tour-3d-header mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0a1e3f]'}`}>Eksplorasi 3D Interaktif</h2>
                                        <p className={`text-[15px] font-medium ${isDark ? 'text-gray-400' : 'text-[#3b5275]'}`}>Putar, perbesar, dan jelajahi objek laut secara interaktif dalam resolusi tinggi.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                            ● WebGL Ready
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="tour-3d-viewer relative w-full flex-grow bg-[#001020] rounded-[32px] overflow-hidden group border-2 border-[#0a1e3f] shadow-2xl min-h-[700px] md:min-h-[800px]">
                                    
                                    {/* HUD Info Panel (Floating Glassmorphism) */}
                                    {modelInfoData[active3DTab] && (
                                        <div className="absolute top-6 left-6 z-10 w-[300px] md:w-[360px] pointer-events-none">
                                            <div className={`p-6 rounded-[24px] backdrop-blur-2xl border shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-left-8 ${isDark ? 'bg-black/40 border-white/10 shadow-cyan-500/10' : 'bg-white/70 border-white shadow-blue-500/10'}`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`}></span>
                                                    <span className={`text-[10px] uppercase font-black tracking-[0.2em] ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                                                        {modelInfoData[active3DTab].sciName}
                                                    </span>
                                                </div>
                                                <h3 className={`text-2xl font-black mb-3 leading-tight drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {modelInfoData[active3DTab].title}
                                                </h3>
                                                <div className={`w-10 h-1 rounded-full mb-4 ${isDark ? 'bg-white/20' : 'bg-blue-200'}`}></div>
                                                <p className={`text-sm mb-6 leading-relaxed font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {modelInfoData[active3DTab].desc}
                                                </p>
                                                
                                                <div className={`p-4 rounded-xl border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'}`}>
                                                    <div className="absolute -right-4 -top-4 opacity-10"><Lightbulb size={18} /></div>
                                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                                        <Lightbulb size={18} />
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-cyan-300' : 'text-blue-800'}`}>Fakta Unik Konservasi</span>
                                                    </div>
                                                    <p className={`text-[13px] leading-relaxed font-bold relative z-10 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {modelInfoData[active3DTab].funFact}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3D Model Viewer */}
                                    <div className="absolute inset-0 w-full h-full z-0">
                                        {getModelUrl(active3DTab) ? (
                                            <ModelViewer url={getModelUrl(active3DTab)!} className="w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#000814]">
                                                <span className="text-6xl mb-4 opacity-50">🚧</span>
                                                <p className="text-gray-400 font-bold">Model 3D belum tersedia untuk kategori ini</p>
                                            </div>
                                        )}
                                    </div>



                                </div>
                                
                                {/* Bottom Categories (Filter) */}
                                <div
                                    ref={scrollRef}
                                    onMouseDown={onMouseDown}
                                    onMouseLeave={onMouseLeave}
                                    onMouseUp={onMouseUp}
                                    onMouseMove={onMouseMove}
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
                                    className={`tour-3d-tabs mt-6 p-2 rounded-3xl flex items-center justify-start overflow-x-auto gap-3 w-full mx-auto border select-none ${isDark ? 'bg-[#001020] border-white/10 shadow-lg' : 'bg-white border-gray-200 shadow-sm'}`}
                                >
                                    {([
                                        { id: 'ekosistem', label: 'Ekosistem Besar', icon: <Waves size={20} /> },
                                        { id: 'ikan', label: 'Ikan', icon: <Fish size={20} /> },
                                        { id: 'butterfly', label: 'Butterfly Fish', icon: <Fish size={20} /> },
                                        { id: 'parrot', label: 'Parrot Fish', icon: <Fish size={20} /> },
                                        { id: 'karang', label: 'Karang', icon: <CoralIcon size={20} /> },
                                        { id: 'karang-acro', label: 'Karang Acropora', icon: <CoralIcon size={20} /> },
                                        { id: 'coral1', label: 'Coral 1', icon: <CoralIcon size={20} /> },
                                        { id: 'coral2', label: 'Coral 2', icon: <CoralIcon size={20} /> },
                                        { id: 'coral3', label: 'Coral 3', icon: <CoralIcon size={20} /> },
                                        { id: 'tridacna', label: 'Tridacna', icon: <CoralIcon size={20} /> },
                                        { id: 'tridacna-gigas', label: 'Tridacna Gigas', icon: <CoralIcon size={20} /> },
                                        { id: 'zooplankton', label: 'Zooplankton', icon: <JellyfishIcon size={20} /> },
                                        { id: 'fitoplankton', label: 'Fitoplankton', icon: <JellyfishIcon size={20} /> },
                                        { id: 'penyu', label: 'Penyu Hijau', icon: <TurtleIcon size={20} /> },
                                        { id: 'lumba-lumba', label: 'Lumba-Lumba', icon: <Fish size={20} /> },
                                        { id: 'dugong', label: 'Dugong', icon: <Fish size={20} /> },
                                        { id: 'rumput', label: 'Rumput Laut 1', icon: <Leaf size={20} /> },
                                        { id: 'rumput2', label: 'Rumput Laut 2', icon: <Leaf size={20} /> },
                                        { id: 'rumput3', label: 'Rumput Laut 3', icon: <Leaf size={20} /> },
                                        { id: 'botol2', label: 'Botol Plastik Banyak', icon: <Trash2 size={20} /> },
                                    ] as { id: string; label: string; icon: React.ReactNode }[]).map(cat => (
                                        <button 
                                            key={cat.id} 
                                            onClick={() => setActive3DTab(cat.id)}
                                            className={`shrink-0 px-6 py-3 rounded-2xl flex items-center gap-3 text-[14px] font-bold transition-all duration-300 ${
                                                active3DTab === cat.id 
                                                    ? 'bg-blue-600 text-white shadow-md scale-105' 
                                                    : isDark 
                                                        ? 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white' 
                                                        : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className="text-xl drop-shadow-sm">{cat.icon}</span> {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className={`relative z-10 mt-auto py-6 border-t text-center ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
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
