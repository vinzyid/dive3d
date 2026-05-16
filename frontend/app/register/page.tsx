'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from '../../components/DiveIcons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : 1;
  const labels  = ['', 'Lemah', 'Cukup', 'Kuat'];
  const colors  = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const textCol = ['', 'text-red-400', 'text-yellow-400', 'text-green-400'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${textCol[strength]}`}>{labels[strength]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [fieldErrors, setFieldErrors]     = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validasi client-side
    const errors: Record<string, string> = {};
    if (name.trim().length < 2)       errors.name    = 'Nama minimal 2 karakter.';
    if (!email.includes('@'))         errors.email   = 'Format email tidak valid.';
    if (password.length < 8)         errors.password = 'Kata sandi minimal 8 karakter.';
    if (password !== confirmPassword) errors.confirm  = 'Konfirmasi kata sandi tidak cocok.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation: confirmPassword }),
      });

      const data = await response.json();

      if (response.status === 429) {
        toast.error('Terlalu banyak percobaan pendaftaran. Tunggu beberapa menit.');
        return;
      }

      // Error validasi dari Laravel (422) — tampilkan per field
      if (response.status === 422 && data.errors) {
        const serverErrors: Record<string, string> = {};
        if (data.errors.email)    serverErrors.email    = data.errors.email[0];
        if (data.errors.password) serverErrors.password = data.errors.password[0];
        if (data.errors.name)     serverErrors.name     = data.errors.name[0];
        setFieldErrors(serverErrors);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal, coba lagi.');
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_role',  data.role ?? 'user');
      localStorage.setItem('user_name',  data.user.name);
      localStorage.setItem('user_email', data.user.email);

      toast.success('Akun berhasil dibuat!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
      fieldErrors[field] ? 'border-red-500/70 bg-red-500/5' : 'border-white/10'
    }`;

  const clearError = (field: string) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00040a] p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Tombol kembali */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-10"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-blue-500/20 overflow-hidden">
              <img src="/images/logo.png" alt="Dive3D" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-widest text-white">DIVEXPLORE</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Buat Akun Baru</h2>
          <p className="text-gray-400 text-sm">Bergabunglah dan mulai jelajahi dunia bawah laut</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="name">Nama Lengkap</label>
              <input
                id="name" type="text" value={name} required
                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                className={inputClass('name')}
                placeholder="John Doe"
              />
              {fieldErrors.name && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span>⚠</span> {fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">Alamat Email</label>
              <input
                id="email" type="email" value={email} required
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                className={inputClass('email')}
                placeholder="nama@email.com"
              />
              {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span>⚠</span> {fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">Kata Sandi</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={password} required
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  className={inputClass('password') + ' pr-12'}
                  placeholder="Minimal 8 karakter"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span>⚠</span> {fieldErrors.password}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <input
                  id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword} required
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirm'); }}
                  className={inputClass('confirm') + ' pr-12'}
                  placeholder="Ulangi kata sandi"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1"><span>✓</span> Kata sandi cocok</p>
              )}
              {fieldErrors.confirm && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span>⚠</span> {fieldErrors.confirm}</p>}
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit" disabled={isLoading}
              className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Memproses...
                </span>
              ) : 'Buat Akun'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Tombol Google */}
          <a
            href={`${API_URL}/api/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Daftar dengan Google
          </a>

          {/* Link ke Login */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
