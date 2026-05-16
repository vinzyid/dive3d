'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Waves, File, FileText, Users, Lightbulb, Lock, CheckCircle2,
  X, Download, Award, Scroll, GraduationCap, Sparkles, PenLine,
  DiveIcon,
} from '../../components/DiveIcons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ViewState =
  | 'login'
  | 'admin_dashboard'
  | 'admin_manage'
  | 'admin_edit_data'
  | 'admin_quiz'
  | 'admin_gallery'
  | 'user_dashboard'
  | 'user_track_select'
  | 'user_modules'
  | 'user_read_module'
  | 'user_quiz'
  | 'user_quiz_result'
  | 'user_certificate';

type TrackData = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  modules: ModuleData[];
};

const FUN_FACTS: Record<string, string[]> = {
  'ekosistem-laut': [
    'Laut menyerap sekitar 25–30% karbon dioksida (CO₂) yang dihasilkan manusia, sehingga berperan penting dalam mengurangi dampak perubahan iklim.',
    'Sekitar 71% permukaan bumi ditutupi oleh lautan, dan lautan menyimpan sekitar 96,5% dari seluruh air di Bumi — menjadikannya ekosistem terbesar di planet ini.',
    'Di kedalaman lebih dari 1.000 meter, cahaya matahari sama sekali tidak bisa menembus air. Hewan-hewan di sini menciptakan cahaya sendiri melalui bioluminesensi untuk menarik mangsa atau pasangan.',
  ],
  'biota-laut': [
    'Ikan badut (clownfish) hidup berdampingan dengan anemon laut dalam hubungan simbiosis mutualisme — ikan badut mendapat perlindungan dari predator, sementara anemon mendapat sisa makanan.',
    'Butterflyfish sering hidup berpasangan dan sangat bergantung pada terumbu karang sebagai sumber makanan, sehingga keberadaannya sering digunakan sebagai indikator kesehatan ekosistem laut.',
    'Paus biru adalah hewan terbesar yang pernah ada. Jantungnya seukuran mobil kecil, dan detak jantungnya bisa terdengar dari jarak 3 kilometer!',
  ],
  'terumbu-karang': [
    'Terumbu karang sering disebut sebagai "hutan hujan laut" karena menjadi habitat bagi sekitar 25% spesies laut, meskipun hanya menutupi sebagian kecil dasar laut.',
    'Terumbu karang mendapatkan warna cerahnya dari organisme kecil bernama zooxanthellae yang hidup di dalam jaringan karang dan membantu menghasilkan energi melalui fotosintesis.',
    'Terumbu karang tumbuh sangat lambat — rata-rata hanya 1–3 cm per tahun — sehingga membutuhkan waktu puluhan hingga ratusan tahun untuk membentuk struktur yang besar.',
  ],
  'sampah-laut': [
    'Di Samudra Pasifik terdapat kumpulan sampah besar yang dikenal sebagai Great Pacific Garbage Patch — area dengan konsentrasi sampah plastik yang sangat tinggi akibat arus laut.',
    'Mikroplastik tidak hanya ditemukan di laut, tetapi juga telah terdeteksi dalam garam laut dan air minum yang dikonsumsi manusia sehari-hari.',
    'Indonesia merupakan penyumbang sampah plastik ke lautan terbesar kedua di dunia setelah Tiongkok — diperkirakan 0,48–1,29 juta metrik ton masuk ke laut setiap tahunnya.',
  ],
  'fotografi-bawah-laut': [
    'Cahaya merah terserap pada kedalaman sekitar 5 meter, sehingga foto bawah laut sering tampak kebiruan. Filter atau lampu khusus digunakan untuk mengembalikan warna aslinya.',
    'Kamera underwater pertama dibuat pada tahun 1856 oleh William Thompson, yang menenggelamkan kamera kayu dalam boks kedap air ke dasar laut Inggris.',
    'Mata manusia dapat beradaptasi melihat dengan jelas di bawah air, namun butuh waktu sekitar 20 menit bagi pupil untuk fully adjust di kedalaman tertentu.',
  ],
  'teknik-videografi': [
    'Video bawah laut pertama kali direkam oleh Jacques Cousteau pada 1956 untuk dokumenter "The Silent World" yang memenangkan Oscar.',
    'Suara merambat 4x lebih cepat di air dibanding di udara — itulah mengapa perekaman suara bawah air memerlukan mikrofon khusus hidrofonik.',
    'Plankton bioluminesensi dapat membuat footage underwater tampak magis di malam hari — banyak videografer sengaja menyelam malam untuk menangkap fenomena ini.',
  ],
  'storytelling-digital': [
    'Konten bertema lingkungan yang menggunakan storytelling emosional terbukti meningkatkan engagement hingga 70% dibandingkan konten informatif biasa.',
    'Otak manusia memproses cerita visual 60.000 kali lebih cepat daripada teks — itulah mengapa visual storytelling sangat efektif untuk pesan konservasi laut.',
    'Kampanye #TrashTag Challenge menjadi viral karena menggunakan before-after storytelling yang simpel namun powerful, menginspirasi jutaan orang untuk membersihkan pantai.',
  ],
  'editing-publishing': [
    'Color grading footage bawah laut memerlukan teknik khusus "white balance adjustment" untuk mengkompensasi dominasi warna biru di lingkungan bawah air.',
    'Algoritma YouTube memprioritaskan video yang ditonton minimal 70% durasinya — itulah mengapa hook yang kuat di 3 detik pertama sangat krusial.',
    'Konten bertema ocean conservation dengan waktu posting antara pukul 11.00–13.00 atau 19.00–21.00 cenderung mendapat jangkauan organik lebih tinggi.',
  ],
  'etika-konten': [
    'Menyentuh atau menginjak terumbu karang untuk mengambil foto dapat merusak organisme yang butuh ratusan tahun untuk tumbuh — setiap sentuhan bisa membunuh koloni karang.',
    'Memberi makan ikan liar untuk konten viral sebenarnya berbahaya — ini mengubah perilaku alami ikan dan dapat menyebabkan ketergantungan pada manusia.',
    'Drone di atas area konservasi laut dapat mengganggu mamalia laut yang sangat sensitif terhadap gelombang suara — selalu cek regulasi setempat sebelum terbang.',
  ],
};

const TRACKS: TrackData[] = [
  {
    id: 'konservasi-laut',
    title: 'Konservasi Laut',
    desc: '4 modul tentang ekosistem dan pelestarian laut Raja Ampat.',
    icon: 'coral',
    color: 'from-blue-500 to-cyan-400',
    modules: [
      { id: 'm1', slug: 'ekosistem-laut', title: 'Ekosistem Laut', desc: 'Mempelajari struktur dan fungsi ekosistem laut secara komprehensif.', icon: 'waves' },
      { id: 'm2', slug: 'biota-laut', title: 'Biota Laut', desc: 'Eksplorasi ragam spesies ikan, moluska, dan invertebrata yang menghuni perairan Raja Ampat.', icon: 'fish' },
      { id: 'm3', slug: 'terumbu-karang', title: 'Terumbu Karang', desc: 'Mempelajari pentingnya ekosistem terumbu karang dan ancaman yang dihadapinya.', icon: 'coral' },
      { id: 'm4', slug: 'sampah-laut', title: 'Sampah Laut', desc: 'Pahami dampak polusi sampah plastik dan cara nyata untuk berkontribusi pada pelestarian laut.', icon: 'recycle' },
    ],
  },
  {
    id: 'konten-digital',
    title: 'Konten Digital Bahari',
    desc: '5 modul tentang pembuatan dan distribusi konten digital bertema bahari.',
    icon: 'clapperboard',
    color: 'from-purple-500 to-pink-400',
    modules: [
      { id: 'kd1', slug: 'fotografi-bawah-laut', title: 'Fotografi Bawah Laut', desc: 'Teknik mengabadikan keindahan bawah laut dengan peralatan dan komposisi yang tepat.', icon: 'camera' },
      { id: 'kd2', slug: 'teknik-videografi', title: 'Teknik-Teknik Videografi', desc: 'Dasar-dasar dan teknik lanjutan produksi video bawah laut mulai dari peralatan hingga pengambilan gambar.', icon: 'clapperboard' },
      { id: 'kd3', slug: 'storytelling-digital', title: 'Storytelling Digital', desc: 'Cara membangun narasi yang kuat dan emosional melalui konten digital bahari.', icon: 'penline' },
      { id: 'kd4', slug: 'editing-publishing', title: 'Editing dan Publishing Guide', desc: 'Panduan lengkap editing konten bahari dan strategi publishing ke berbagai platform digital.', icon: 'film' },
      { id: 'kd5', slug: 'etika-konten', title: 'Etika dalam Membuat Konten', desc: 'Memahami tanggung jawab etis dalam pembuatan dan penyebaran konten bertema lingkungan laut.', icon: 'scale' },
    ],
  },
];

type QuizQuestion = {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

type ModuleData = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  icon: string;
};

export default function LMSPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewState | null>(null);
  const [backOrigin, setBackOrigin] = useState<{ href: string; label: string }>({ href: '/', label: 'Beranda' });

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setUserName(localStorage.getItem('user_name'));

    // Deteksi halaman asal untuk tombol Kembali
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');
    if (fromParam === 'akademi') {
      setBackOrigin({ href: '/akademi', label: 'Halaman Akademi' });
    } else if (fromParam === 'dashboard') {
      setBackOrigin({ href: '/dashboard', label: 'Dashboard' });
    } else {
      // Cek referrer browser sebagai fallback
      const ref = document.referrer;
      if (ref.includes('/akademi')) {
        setBackOrigin({ href: '/akademi', label: 'Halaman Akademi' });
      } else if (ref.includes('/dashboard')) {
        setBackOrigin({ href: '/dashboard', label: 'Dashboard' });
      } else {
        setBackOrigin({ href: '/', label: 'Beranda' });
      }
    }

    if (role === 'admin') {
      // Admin tidak diizinkan masuk ke ruang kelas LMS, arahkan ke Pusat Kendali di Dashboard
      window.location.href = '/dashboard';
    } else if (role === 'user') {
      // Check query params for direct module access
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get('track');
      const moduleSlug = params.get('module');
      const action = params.get('action');

      if (trackId && moduleSlug) {
        const track = TRACKS.find(t => t.id === trackId);
        if (track) {
           setSelectedTrack(track);
           setModules(track.modules);
           
           const userEmail = (localStorage.getItem('user_email') || '').toLowerCase();
           let loadedQuizzes: string[] = [];
           if (userEmail === 'vinzcan11@gmail.com') {
             loadedQuizzes = track.modules.map(m => `Kuis: ${m.title}`);
           } else {
             const saved = localStorage.getItem(`completed_quizzes_${userEmail}_${track.id}`);
             if (saved) loadedQuizzes = JSON.parse(saved);
           }
           setCompletedQuizzes(loadedQuizzes);

           if (moduleSlug === 'all') {
              if (action === 'certificate') {
                setHasCertificate(true);
                setFromDashboard(true);
                setView('user_certificate');
              } else {
                setView('user_modules');
              }
              return;
           }

           const mod = track.modules.find(m => m.slug === moduleSlug);
           if (mod) {
              setSelectedModule(mod);
              if (action === 'quiz') {
                setQuizUserLoading(true);
                const token = localStorage.getItem('auth_token');
                fetch(`${API_URL}/api/quiz/questions/${mod.slug}`, {
                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                })
                .then(res => res.json())
                .then(data => {
                  setQuizQuestions(data.data ?? []);
                  setQuizUserLoading(false);
                  setQuizAnswers({});
                  setView('user_quiz');
                })
                .catch(() => {
                  setQuizQuestions([]);
                  setQuizUserLoading(false);
                  setQuizAnswers({});
                  setView('user_quiz');
                });
              } else {
                setReadProgress(0);
                setView('user_read_module');
              }
              return;
           }
        }
      }
      setView('user_track_select');
    } else {
      window.location.href = '/';
    }
  }, []);

  // ==========================================
  // DATABASE SIMULATION (Bisa diakses Admin & User)
  // ==========================================
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrackData | null>(null);

  // ==========================================
  // STATE ADMIN
  // ==========================================
  const [manageCategory, setManageCategory] = useState<string>('Modul');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('package');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);

  // STATE ADMIN QUIZ
  const [quizModuleSlug, setQuizModuleSlug] = useState('ekosistem-laut');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptionA, setQuizOptionA] = useState('');
  const [quizOptionB, setQuizOptionB] = useState('');
  const [quizOptionC, setQuizOptionC] = useState('');
  const [quizOptionD, setQuizOptionD] = useState('');
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [existingQuestions, setExistingQuestions] = useState<QuizQuestion[]>([]);
  const [quizAdminLoading, setQuizAdminLoading] = useState(false);

  // STATE ADMIN GALLERY
  const [pendingGallery, setPendingGallery] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const loadPendingGallery = async () => {
    setGalleryLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/api/admin/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingGallery(data || []);
    } catch(e) {
      console.error(e);
    }
    setGalleryLoading(false);
  };

  const handleApproveGallery = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    await fetch(`${API_URL}/api/admin/approve/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadPendingGallery();
  };

  const handleRejectGallery = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    await fetch(`${API_URL}/api/admin/reject/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadPendingGallery();
  };

  // ==========================================
  // STATE USER
  // ==========================================
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizUserLoading, setQuizUserLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [hasBadge, setHasBadge] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [certificateName, setCertificateName] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [fromDashboard, setFromDashboard] = useState(false);
  // Simpan progress ke localStorage setiap kali berubah
  useEffect(() => {
    const userEmail = (localStorage.getItem('user_email') || '').toLowerCase();
    if (userEmail && completedQuizzes.length > 0 && selectedTrack) {
      localStorage.setItem(`completed_quizzes_${userEmail}_${selectedTrack.id}`, JSON.stringify(completedQuizzes));
    }
  }, [completedQuizzes, selectedTrack]);


  // Cek apakah semua modul sudah selesai
  useEffect(() => {
    if (modules.length > 0 && completedQuizzes.length >= modules.length) {
      setHasCertificate(true);
    }
  }, [completedQuizzes, modules]);

  // Reset semua state sementara saat logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    window.location.href = '/';
  };

  // --- PILIH TRACK ---
  const handleSelectTrack = (track: TrackData) => {
    const userEmail = (localStorage.getItem('user_email') || '').toLowerCase();
    setSelectedTrack(track);
    setModules(track.modules);
    setCompletedQuizzes([]);

    // TEST: vinzcan11 langsung semua selesai
    if (userEmail === 'vinzcan11@gmail.com') {
      setCompletedQuizzes(track.modules.map(m => `Kuis: ${m.title}`));
    } else {
      const savedKey = `completed_quizzes_${userEmail}_${track.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) setCompletedQuizzes(JSON.parse(saved));
    }

    setView('user_modules');
  };

  // --- LOGIKA ADMIN ---
  const handleSaveAdminData = () => {
    setIsAdminProcessing(true);
    // Simulasi "Sistem update database"
    setTimeout(() => {
      // Jika yang diubah adalah Modul, kita masukkan ke state Modules agar terlihat oleh User
      if (manageCategory === 'Modul') {
        const newMod: ModuleData = {
          id: `m${Date.now()}`,
          slug: `modul-${Date.now()}`,
          title: newTitle || 'Modul Baru',
          desc: newDesc || 'Deskripsi modul baru.',
          icon: newIcon || 'package'
        };
        setModules([...modules, newMod]);
      }

      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewIcon('package');

      setIsAdminProcessing(false);
      // Sesuai flowchart: kembali ke "Ingin mengelola data?" (Dashboard)
      setView('admin_dashboard');
    }, 2000);
  };

  const openManageForm = (category: string) => {
    setManageCategory(category);
    setNewTitle('');
    setNewDesc('');
    setNewIcon('package');
    if (category === 'Quiz') {
      loadQuizQuestions('ekosistem-laut');
      setView('admin_quiz');
    } else if (category === 'Galeri') {
      loadPendingGallery();
      setView('admin_gallery');
    } else {
      setView('admin_edit_data');
    }
  };

  const loadQuizQuestions = async (slug: string) => {
    setQuizAdminLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/api/quiz/questions/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      setExistingQuestions(data.data ?? []);
    } catch { setExistingQuestions([]); }
    setQuizAdminLoading(false);
  };

  const handleAddQuestion = async () => {
    if (!quizQuestion || !quizOptionA || !quizOptionB || !quizOptionC || !quizOptionD) return;
    setQuizAdminLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`${API_URL}/api/quiz/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          module_slug: quizModuleSlug,
          question: quizQuestion,
          option_a: quizOptionA,
          option_b: quizOptionB,
          option_c: quizOptionC,
          option_d: quizOptionD,
          correct_answer: quizCorrectAnswer,
        }),
      });
      setQuizQuestion(''); setQuizOptionA(''); setQuizOptionB(''); setQuizOptionC(''); setQuizOptionD('');
      setQuizCorrectAnswer('A');
      await loadQuizQuestions(quizModuleSlug);
    } catch { setQuizAdminLoading(false); }
  };

  const handleDeleteQuestion = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`${API_URL}/api/quiz/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      await loadQuizQuestions(quizModuleSlug);
    } catch { }
  };

  // --- LOGIKA USER ---
  const handleDownloadPDF = async () => {
    const element = document.getElementById('certificate-preview');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('l', 'px', [800, 565]);
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 565);
      pdf.save(`Sertifikat_${certificateName.replace(/\s+/g, '_') || 'Peserta'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setIsGeneratingPDF(false);
  };

  const handleSimulateScroll = () => {
    if (readProgress < 100) setReadProgress((prev) => Math.min(prev + 25, 100));
  };

  const loadUserQuiz = async (slug: string) => {
    setQuizUserLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/api/quiz/questions/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      setQuizQuestions(data.data ?? []);
    } catch { setQuizQuestions([]); }
    setQuizUserLoading(false);
  };

  const handleSubmitQuiz = async () => {
    // Hitung skor dari soal yang diambil API
    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct_answer) correct++;
    });
    const total = quizQuestions.length || 1;
    const calculatedScore = Math.round((correct / total) * 100);

    setScore(calculatedScore);
    setIsProcessing(true);
    setView('user_quiz_result');

    if (calculatedScore >= 50 && selectedModule) {
      // Simpan skor ke localStorage agar Dashboard bisa membaca topScore dan membuka lencana 3D
      localStorage.setItem(`quiz_score_${selectedModule.slug}_${Date.now()}`, calculatedScore.toString());
    }

    if (calculatedScore === 100 && selectedModule) {
      setCompletedQuizzes(prev => [...prev, `Kuis: ${selectedModule.title}`]);
    }

    // Simpan hasil quiz & update progress ke backend
    const token = localStorage.getItem('auth_token');
    if (token && selectedModule) {
      try {
        // 1. Simpan skor quiz
        await fetch(`${API_URL}/api/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            quiz_title: `Kuis: ${selectedModule.title}`,
            score: calculatedScore,
            max_score: 100,
          }),
        });

        // 2. Tandai modul sebagai selesai jika lulus (score >= 50)
        if (calculatedScore >= 50) {
          await fetch(`${API_URL}/api/progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              moduleId: selectedModule.slug,
              visitedPois: [],
              completed: true,
            }),
          });
        }
      } catch {
        // Gagal simpan tidak crash tampilan
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
      setHasBadge(calculatedScore >= 50);

      const isComplete = new Set([...completedQuizzes, ...(calculatedScore === 100 ? [`Kuis: ${selectedModule?.title}`] : [])]).size >= modules.length;
      setHasCertificate(isComplete);
    }, 2000);
  };

  if (!view) return null;

  return (
    <div className="min-h-screen bg-[#00040a] text-white font-sans flex flex-col">
      {/* NAVBAR */}
      <nav className="w-full px-8 py-5 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/5 border border-white/10 overflow-hidden cursor-pointer">
            <img src="/images/logo.png" alt="Dive3D Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-widest">DIVEXPLORE LMS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-white pr-2">
            Halo, {userName || (typeof window !== 'undefined' && localStorage.getItem('user_role') === 'admin' ? 'Admin' : 'Pengguna')}!
          </span>
          {view !== 'login' && (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-6 relative">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />



        {/* ========================================= */}
        {/* VIEW: ADMIN DASHBOARD */}
        {/* ========================================= */}
        {view === 'admin_dashboard' && (
          <div className="w-full max-w-4xl p-8 rounded-[32px] bg-[#000814] border border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Users size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Selamat datang, Administrator.</p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Ingin mengelola data?</h2>
                <p className="text-purple-200/70 max-w-lg">
                  Anda dapat menambah atau mengubah Modul, Materi, Quiz, dan User di sistem ini.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={handleLogout} className="px-6 py-4 rounded-xl font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all">
                  Tidak (Logout)
                </button>
                <button onClick={() => setView('admin_manage')} className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:scale-105 transition-all shadow-xl shadow-purple-500/25">
                  Ya, Kelola Data →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-sm text-gray-500 mb-1">Total Modul</div>
                <div className="text-2xl font-black text-white">{modules.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-sm text-gray-500 mb-1">Total Pengguna</div>
                <div className="text-2xl font-black text-white">124</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-sm text-gray-500 mb-1">Sistem Status</div>
                <div className="text-2xl font-black text-emerald-400">Online</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: ADMIN MANAGE */}
        {/* ========================================= */}
        {view === 'admin_manage' && (
          <div className="w-full max-w-4xl p-8 rounded-[32px] bg-[#000814] border border-white/10 shadow-2xl relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-white mb-2">Pilih Menu Kelola Data</h1>
                <p className="text-gray-400">Pilih entitas data yang ingin Anda kelola.</p>
              </div>
              <button onClick={() => setView('admin_dashboard')} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                ← Kembali
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Modul', icon: 'book', color: 'from-blue-500 to-cyan-400', desc: 'Tambah atau ubah modul pembelajaran.' },
                { title: 'Materi', icon: 'file', color: 'from-emerald-500 to-teal-400', desc: 'Kelola isi konten teks dan media.' },
                { title: 'Quiz', icon: 'filetext', color: 'from-purple-500 to-pink-500', desc: 'Atur pertanyaan dan jawaban evaluasi.' },
                { title: 'User', icon: 'users', color: 'from-orange-500 to-amber-400', desc: 'Manajemen akses dan profil mahasiswa.' },
                { title: 'Galeri', icon: 'image', color: 'from-indigo-500 to-blue-500', desc: 'Setujui atau tolak karya unggahan pengguna.' }
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => openManageForm(item.title)}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-start gap-4"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${item.color} shrink-0`}>
                    <DiveIcon icon={item.icon} size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Kelola {item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: ADMIN EDIT DATA (Simpan Perubahan) */}
        {/* ========================================= */}
        {view === 'admin_edit_data' && (
          <div className="w-full max-w-2xl p-8 rounded-[32px] bg-[#000814] border border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] relative z-10 animate-in slide-in-from-bottom-8 duration-500">
            {isAdminProcessing ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-cyan-400 animate-pulse">Sistem update database...</h2>
                <p className="text-gray-500 mt-2">Menyimpan perubahan {manageCategory} ke server. Mohon tunggu.</p>
              </div>
            ) : (
              <>
                <div className="mb-8 border-b border-white/10 pb-6">
                  <div className="inline-block px-3 py-1 mb-3 rounded-full border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 text-[10px] font-black uppercase tracking-widest">
                    Formulir Admin ({manageCategory})
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">Tambah/Edit {manageCategory}</h1>
                  <p className="text-gray-400">Masukkan informasi detail untuk {manageCategory.toLowerCase()} yang akan dikelola.</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Judul / Nama {manageCategory}</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      placeholder={`Contoh Judul ${manageCategory}...`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deskripsi / Detail</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all h-28 resize-none"
                      placeholder="Tuliskan detail selengkapnya di sini..."
                    />
                  </div>

                  {manageCategory === 'Modul' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Ikon (Khusus Modul)</label>
                      <div className="flex gap-4">
                        {['package', 'fish', 'leaf', 'turtle', 'crab', 'waves'].map((iconKey) => (
                          <button
                            key={iconKey}
                            onClick={() => setNewIcon(iconKey)}
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border ${newIcon === iconKey ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-black/50 border-white/10 hover:border-white/30 text-white'}`}
                          >
                            <DiveIcon icon={iconKey} size={24} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* FLOW: Simpan Perubahan */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <button onClick={() => setView('admin_manage')} className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAdminData}
                    disabled={!newTitle || !newDesc}
                    className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: ADMIN GALLERY */}
        {/* ========================================= */}
        {view === 'admin_gallery' && (
          <div className="w-full max-w-5xl p-8 rounded-[32px] bg-[#000814] border border-indigo-500/30 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] relative z-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div>
                <div className="inline-block px-3 py-1 mb-3 rounded-full border border-indigo-400/30 bg-indigo-500/15 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                  Pengawasan Konten
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Persetujuan Karya Galeri</h1>
                <p className="text-gray-400">Karya-karya di bawah ini menunggu persetujuan Anda sebelum tampil ke publik.</p>
              </div>
              <button onClick={() => setView('admin_manage')} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                ← Kembali
              </button>
            </div>

            {galleryLoading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-indigo-400 font-bold">Memuat daftar karya...</p>
              </div>
            ) : pendingGallery.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <div className="flex justify-center mb-4 text-white/60"><Sparkles size={56} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Bersih Sepenuhnya!</h3>
                <p className="text-gray-500">Tidak ada karya baru yang mengantre untuk disetujui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingGallery.map((item: any) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300">
                    <img src={item.file_path} alt={item.title} className="w-full h-48 object-cover bg-[#000814]" />
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">{item.category || 'Lainnya'}</span>
                        <span className="text-xs text-gray-400">Oleh: {item.author || 'Diver'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-6">{new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <div className="flex gap-3 mt-auto">
                        <button onClick={() => handleApproveGallery(item.id)} className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:scale-105 transition-all text-sm border border-emerald-500/20 flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={16} className="inline" /> Setujui
                        </button>
                        <button onClick={() => handleRejectGallery(item.id)} className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 hover:scale-105 transition-all text-sm border border-red-500/20 flex items-center justify-center gap-1.5">
                          <X size={16} className="inline" /> Tolak
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: USER TRACK SELECT */}
        {/* ========================================= */}
        {view === 'user_track_select' && (
          <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6">
              <button onClick={() => router.back()} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 flex items-center gap-2">
                ← Kembali
              </button>
            </div>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-white mb-3">Pilih Jalur Pembelajaran</h1>
              <p className="text-gray-400">Pilih salah satu jalur untuk memulai dan mendapatkan sertifikat.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TRACKS.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className="group p-8 rounded-[28px] bg-[#000814] border border-white/10 hover:border-cyan-400/40 hover:bg-white/5 transition-all cursor-pointer flex flex-col gap-5"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${track.color} shadow-lg`}>
                    <DiveIcon icon={track.icon} size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">{track.title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{track.desc}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{track.modules.length} Modul</span>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r ${track.color}`}>
                      Mulai →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: USER DASHBOARD */}
        {/* ========================================= */}
        {view === 'user_dashboard' && (
          <div className="w-full max-w-4xl p-8 rounded-[32px] bg-[#000814] border border-white/10 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tombol Kembali */}
            <div className="mb-6">
              <button
                onClick={() => router.push(backOrigin.href)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 text-sm group"
              >
                <span className="text-lg leading-none group-hover:-translate-x-0.5 transition-transform">←</span>
                <span>Kembali ke {backOrigin.label}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <GraduationCap size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">User Dashboard</h1>
                <p className="text-gray-400">Selamat datang kembali di sistem LMS.</p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Lanjutkan Pembelajaran Anda</h2>
                <p className="text-blue-200/70 max-w-lg">
                  Terdapat <strong className="text-white">{modules.length} Modul</strong> yang tersedia untuk Anda pelajari saat ini.
                </p>
              </div>
              <button
                onClick={() => setView('user_modules')}
                className="shrink-0 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2"
              >
                <span>Pilih Learning Modules</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: USER MODULES */}
        {/* ========================================= */}
        {view === 'user_modules' && (
          <div className="w-full max-w-5xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-white">Pilih Modul</h1>
                <p className="text-gray-400">Pilih modul yang ingin Anda pelajari hari ini.</p>
              </div>
              <div className="flex gap-4">
                {hasCertificate && (
                  <button onClick={() => setView('user_certificate')} className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-105 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2">
                    <Scroll size={18} /><span>Cetak Sertifikat</span>
                  </button>
                )}
                <button onClick={() => setView('user_dashboard')} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                  ← Kembali
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {modules.map((mod) => (
                <div key={mod.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all group flex flex-col">
                  <div className="h-40 rounded-xl bg-gradient-to-br from-blue-900/30 to-black mb-6 flex items-center justify-center group-hover:scale-[1.02] transition-transform border border-white/5">
                    <span className="drop-shadow-2xl text-white"><DiveIcon icon={mod.icon} size={48} /></span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                    <p className="text-sm text-gray-400 mb-6">{mod.desc}</p>
                  </div>
                  {completedQuizzes.includes(`Kuis: ${mod.title}`) ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} className="inline" /><span>Selesai</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedModule(mod);
                        setReadProgress(0);
                        setView('user_read_module');
                      }}
                      className="w-full py-3 rounded-xl font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500 hover:text-white transition-all border border-cyan-500/30 hover:border-cyan-400"
                    >
                      Pilih Modul Ini
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: BACA MATERI */}
        {/* ========================================= */}
        {view === 'user_read_module' && (
          <div className="w-full max-w-5xl relative z-10 animate-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-3 gap-6 items-start">

              {/* KOLOM KIRI: Materi (2/3) */}
              <div className="col-span-2 p-8 rounded-[32px] bg-[#000814] border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="text-white">{selectedModule && <DiveIcon icon={selectedModule.icon} size={36} />}</span>
                  Materi: {selectedModule?.title}
                </h1>

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
                    <span>Progres Membaca</span>
                    <span>{readProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${readProgress}%` }}
                    />
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-4 mb-8 min-h-[200px]">
                  <p>Ini adalah konten pengantar untuk modul <strong>{selectedModule?.title}</strong>. Pelajari dengan saksama karena evaluasi quiz akan berdasarkan materi ini.</p>
                  {readProgress >= 25 && (
                    <p className="animate-in fade-in duration-500">Materi Bagian 1: {selectedModule?.desc}</p>
                  )}
                  {readProgress >= 50 && (
                    <p className="animate-in fade-in duration-500">Materi Bagian 2: Memahami topik ini secara mendalam adalah kunci untuk menjaga keseimbangan ekosistem demi masa depan bumi kita.</p>
                  )}
                  {readProgress >= 75 && (
                    <p className="animate-in fade-in duration-500">Kesimpulan: Ekosistem laut dan pesisir sangat rentan terhadap perubahan iklim dan campur tangan manusia. Pengetahuan yang Anda miliki adalah langkah pertama menuju aksi nyata.</p>
                  )}
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
                  {readProgress >= 100 && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} className="inline" /> Materi Selesai Dibaca!
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowBackConfirm(true)}
                      className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 flex items-center gap-2"
                    >
                      <span>← Kembali ke Akademi</span>
                    </button>

                    {readProgress < 100 ? (
                      <button
                        onClick={handleSimulateScroll}
                        className="px-6 py-4 rounded-xl font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all flex items-center gap-2"
                      >
                        <span>Lanjut Membaca (Scroll ↓)</span>
                      </button>
                    ) : selectedTrack?.id === 'konten-digital' ? (
                      // Track Konten Digital: tidak ada kuis, langsung selesaikan modul
                      completedQuizzes.includes(`Kuis: ${selectedModule?.title}`) ? (
                        <div className="px-6 py-4 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-inner flex items-center gap-3">
                          <CheckCircle2 size={20} />
                          <div>
                            <p className="text-sm">Modul Selesai</p>
                            <p className="text-xs text-emerald-400/80 font-medium">Anda telah menyelesaikan modul ini.</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (selectedModule) {
                              setCompletedQuizzes(prev => [...prev, `Kuis: ${selectedModule.title}`]);
                            }
                            setView('user_modules');
                          }}
                          className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2"
                        >
                          <CheckCircle2 size={20} />
                          <span>Selesai &amp; Lanjut</span>
                        </button>
                      )
                    ) : completedQuizzes.includes(`Kuis: ${selectedModule?.title}`) ? (
                      <div className="px-6 py-4 rounded-xl font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-inner flex items-center gap-3">
                        <FileText size={24} />
                        <div>
                          <p className="text-sm">Kuis Selesai</p>
                          <p className="text-xs text-blue-400/80 font-medium">Anda sudah mengerjakan kuis ini sebelumnya.</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          if (selectedModule) loadUserQuiz(selectedModule.slug);
                          setView('user_quiz');
                        }}
                        className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/25"
                      >
                        Mulai Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Fun Facts (1/3) */}
              <div className="col-span-1 p-6 rounded-[32px] bg-[#000814] border border-white/10 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={18} className="text-cyan-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">Fun Facts</h3>
                </div>
                <p className="text-xs text-gray-500 -mt-2 mb-1">Fakta menarik terbuka seiring Anda membaca.</p>

                {(() => {
                  const facts = selectedModule ? FUN_FACTS[selectedModule.slug] : undefined;
                  const factConfig = [
                    { threshold: 25, icon: 'lightbulb', border: 'border-cyan-500/40', bg: 'from-cyan-950/60 to-blue-950/60', label: 'text-cyan-400', num: 'bg-cyan-500/20 text-cyan-300' },
                    { threshold: 50, icon: 'waves', border: 'border-teal-500/40', bg: 'from-teal-950/60 to-cyan-950/60', label: 'text-teal-400', num: 'bg-teal-500/20 text-teal-300' },
                    { threshold: 75, icon: 'fish', border: 'border-blue-500/40', bg: 'from-blue-950/60 to-indigo-950/60', label: 'text-blue-400', num: 'bg-blue-500/20 text-blue-300' },
                  ];
                  return factConfig.map((cfg, i) => {
                    const unlocked = readProgress >= cfg.threshold;
                    const fact = facts?.[i];
                    return (
                      <div
                        key={i}
                        className={`rounded-2xl border p-4 transition-all duration-500 ${
                          unlocked
                            ? `bg-gradient-to-br ${cfg.bg} ${cfg.border}`
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${unlocked ? cfg.num : 'bg-white/5 text-gray-600'}`}>
                            #{i + 1}
                          </span>
                          <span className={`${unlocked ? cfg.label : 'text-gray-600 opacity-30'}`}><DiveIcon icon={cfg.icon} size={18} /></span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${unlocked ? cfg.label : 'text-gray-600'}`}>
                            Fun Fact
                          </span>
                        </div>
                        {unlocked && fact ? (
                          <p className="text-xs text-white/80 leading-relaxed animate-in fade-in duration-700">{fact}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Lock size={18} className="text-gray-600" />
                            <p className="text-xs text-gray-600">Baca hingga {cfg.threshold}% untuk membuka.</p>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: ADMIN QUIZ MANAGER */}
        {/* ========================================= */}
        {view === 'admin_quiz' && (
          <div className="w-full max-w-4xl p-8 rounded-[32px] bg-[#000814] border border-purple-500/30 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              <div>
                <div className="inline-block px-3 py-1 mb-3 rounded-full border border-purple-400/30 bg-purple-500/15 text-purple-300 text-[10px] font-black uppercase tracking-widest">Kelola Quiz</div>
                <h1 className="text-3xl font-black text-white">Upload Soal Quiz</h1>
              </div>
              <button onClick={() => setView('admin_manage')} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">← Kembali</button>
            </div>

            {/* Pilih Modul */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Modul</label>
              <select
                value={quizModuleSlug}
                onChange={(e) => { setQuizModuleSlug(e.target.value); loadQuizQuestions(e.target.value); }}
                className="w-full px-5 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-400 transition-all"
              >
                {modules.map(m => <option key={m.slug} value={m.slug}>{m.title}</option>)}
              </select>
            </div>

            {/* Form tambah soal */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6 space-y-4">
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><PenLine size={18} /> Tambah Soal Baru</h3>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pertanyaan</label>
                <textarea value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 resize-none h-20 transition-all"
                  placeholder="Tulis pertanyaan di sini..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Opsi A', val: quizOptionA, set: setQuizOptionA },
                  { label: 'Opsi B', val: quizOptionB, set: setQuizOptionB },
                  { label: 'Opsi C', val: quizOptionC, set: setQuizOptionC },
                  { label: 'Opsi D', val: quizOptionD, set: setQuizOptionD },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition-all"
                      placeholder={`Isi ${label}...`} />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Jawaban Benar</label>
                <div className="flex gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <button key={opt} onClick={() => setQuizCorrectAnswer(opt)}
                      className={`w-12 h-12 rounded-xl font-black text-lg transition-all border ${quizCorrectAnswer === opt ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddQuestion} disabled={quizAdminLoading || !quizQuestion || !quizOptionA || !quizOptionB || !quizOptionC || !quizOptionD}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {quizAdminLoading ? 'Menyimpan...' : '+ Tambah Soal'}
              </button>
            </div>

            {/* Daftar soal yang sudah ada */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FileText size={18} /> Daftar Soal ({existingQuestions.length} soal)</h3>
              {existingQuestions.length === 0
                ? <p className="text-gray-500 text-sm text-center py-6">Belum ada soal untuk modul ini.</p>
                : <div className="space-y-3">
                  {existingQuestions.map((q, i) => (
                    <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium mb-2">{i + 1}. {q.question}</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                          {(['a', 'b', 'c', 'd'] as const).map(k => (
                            <span key={k} className={q.correct_answer === k.toUpperCase() ? 'text-emerald-400 font-bold' : ''}>
                              {k.toUpperCase()}. {q[`option_${k}` as keyof QuizQuestion]}
                              {q.correct_answer === k.toUpperCase() && ' ✓'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.id)}
                        className="shrink-0 px-3 py-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold transition-all">
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: QUIZ USER (dari API) */}
        {/* ========================================= */}
        {view === 'user_quiz' && (
          <div className="w-full max-w-3xl p-8 rounded-[32px] bg-[#000814] border border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] relative z-10 animate-in slide-in-from-bottom-8 duration-500">
            <h1 className="text-3xl font-black text-white mb-2">Quiz: {selectedModule?.title}</h1>
            <p className="text-gray-400 mb-8">Pilih jawaban yang paling tepat berdasarkan materi yang telah dipelajari.</p>

            {quizUserLoading ? (
              <div className="py-16 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
                <p className="text-cyan-400 text-sm">Memuat soal...</p>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex justify-center mb-4 text-gray-500"><File size={40} /></div>
                <p className="text-gray-400">Soal quiz belum tersedia untuk modul ini.</p>
                <p className="text-gray-500 text-sm mt-1">Hubungi admin untuk menambahkan soal.</p>
              </div>
            ) : (
              <div className="space-y-8 mb-10">
                {quizQuestions.map((q, i) => (
                  <div key={q.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-lg font-medium text-white mb-4">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map(key => {
                        const optKey = `option_${key.toLowerCase()}` as keyof QuizQuestion;
                        const optText = q[optKey] as string;
                        return (
                          <label key={key} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${quizAnswers[i] === key ? 'bg-cyan-500/20 border-cyan-400' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                            <input type="radio" name={`q${i}`} className="hidden"
                              checked={quizAnswers[i] === key}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [i]: key }))} />
                            <span className={`text-sm ${quizAnswers[i] === key ? 'text-cyan-300 font-bold' : 'text-gray-300'}`}>{key}. {optText}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button onClick={() => setView('user_read_module')}
                className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                ← Kembali ke Materi
              </button>
              <button onClick={handleSubmitQuiz}
                disabled={quizQuestions.length === 0 || quizQuestions.some((_, i) => !quizAnswers[i])}
                className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-105 transition-all shadow-xl shadow-emerald-500/25 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                Submit Jawaban
              </button>
            </div>
          </div>
        )}

        {view === 'user_quiz_result' && (
          <div className="w-full max-w-2xl p-8 rounded-[32px] bg-[#000814] border border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 text-center">
            {isProcessing ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-cyan-400 animate-pulse">Menyimpan Nilai & Update Progress...</h2>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-8">
                  <div className="inline-block p-6 rounded-full bg-gradient-to-b from-white/10 to-transparent border border-white/10 mb-6">
                    <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{score}</span>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">Nilai Akhir Anda</h1>
                  <p className="text-gray-400 text-lg">Evaluasi selesai.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className={`p-6 rounded-2xl border ${hasBadge ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/50 border-white/5 opacity-50'}`}>
                    <div className="mb-3 flex justify-center">{hasBadge ? <Award size={32} className="text-amber-400" /> : <Lock size={32} className="text-gray-500" />}</div>
                    <h3 className={`font-bold ${hasBadge ? 'text-amber-400' : 'text-gray-500'}`}>Badge</h3>
                  </div>
                  <div
                    onClick={() => hasCertificate && setView('user_certificate')}
                    className={`p-6 rounded-2xl border transition-all ${hasCertificate ? 'bg-cyan-500/10 border-cyan-500/30 cursor-pointer hover:bg-cyan-500/20 hover:scale-[1.02]' : 'bg-black/50 border-white/5 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="mb-3 flex justify-center">{hasCertificate ? <Scroll size={32} className="text-cyan-400" /> : <Lock size={32} className="text-gray-500" />}</div>
                    <h3 className={`font-bold ${hasCertificate ? 'text-cyan-400' : 'text-gray-500'}`}>Sertifikat</h3>
                    {hasCertificate && <p className="text-xs text-cyan-400/70 mt-1">Klik untuk cetak</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  {(() => {
                    const currentIndex = modules.findIndex(m => m.id === selectedModule?.id);
                    const nextModule = modules[currentIndex + 1];
                    return nextModule && score === 100 ? (
                      <button
                        onClick={() => {
                          setSelectedModule(nextModule);
                          setReadProgress(0);
                          setQuizAnswers({});
                          setView('user_read_module');
                        }}
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/25"
                      >
                        Lanjut ke Modul Berikutnya: <DiveIcon icon={nextModule.icon} size={16} className="inline" /> {nextModule.title}
                      </button>
                    ) : null;
                  })()}
                  <button onClick={() => setView('user_modules')} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all shadow-lg shadow-blue-500/25">
                    Kembali ke Pemilihan Modul
                  </button>
                  <Link href="/akademi" className="w-full py-4 rounded-xl font-bold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all block">
                    Kembali ke Akademi
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW: USER CERTIFICATE */}
        {/* ========================================= */}
        {view === 'user_certificate' && (
          <div className="w-full max-w-5xl p-8 rounded-[32px] bg-[#000814] border border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-3xl font-black text-white">Sertifikat Penghargaan</h1>
                <p className="text-gray-400">Selamat! Anda telah menyelesaikan seluruh modul <span className="text-cyan-400 font-semibold">{selectedTrack?.title}</span>.</p>
              </div>
              <button
                onClick={() => fromDashboard ? window.location.href = '/dashboard' : setView('user_modules')}
                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
              >
                ← {fromDashboard ? 'Kembali ke Dashboard' : 'Kembali'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Input */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Detail Sertifikat</h3>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nama di Sertifikat</label>
                    <input
                      type="text"
                      value={certificateName}
                      onChange={(e) => setCertificateName(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      placeholder="Masukkan nama lengkap..."
                    />
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={!certificateName || isGeneratingPDF}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    Pastikan nama yang dimasukkan sudah benar. Sertifikat dapat diunduh berkali-kali.
                  </p>
                </div>
              </div>

              {/* Preview Sertifikat */}
              <div className="lg:col-span-2 overflow-x-auto bg-black/50 rounded-2xl p-4 flex items-center justify-center border border-white/5">
                <div className="relative w-[800px] h-[565px] shrink-0 bg-white shadow-2xl overflow-hidden" id="certificate-preview">
                  {/* Background Certificate sesuai track */}
                  <img
                    src={selectedTrack?.id === 'konten-digital' ? '/images/sertifikat-konten-digital.jpeg' : '/images/sertifikat-konservasi-laut.jpeg'}
                    alt="Background Sertifikat"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />

                  {/* Text Overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center pt-[215px]">
                    <h2 className="text-4xl font-serif text-[#0b1c3d] tracking-wide italic font-bold" style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}>
                      {certificateName || 'Nama Peserta'}
                    </h2>

                    {/* Posisi tanggal: top dari atas sertifikat (565px tinggi), left dari kiri (800px lebar) */}
                    <div style={{ position: 'absolute', top: '440px', left: '375px', width: '310px', textAlign: 'center' }}>
                      <p className="text-base font-serif text-[#0b1c3d] font-bold" style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}>
                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL KONFIRMASI KEMBALI */}
      {showBackConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBackConfirm(false)} />
          <div className="bg-[#001020] border border-white/10 rounded-[32px] p-8 max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Waves size={48} />
            </div>
            <h3 className="text-2xl font-black text-white text-center mb-2">Konfirmasi Keluar</h3>
            <p className="text-gray-400 text-center mb-8 text-sm leading-relaxed">Apakah Anda yakin ingin keluar dari sistem LMS dan kembali ke Halaman Akademi?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowBackConfirm(false)}
                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                Batal
              </button>
              <button
                onClick={() => window.location.href = '/akademi'}
                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Ya, Kembali
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
