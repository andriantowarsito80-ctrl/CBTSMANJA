/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  RefreshCw,
  ShieldAlert,
  GraduationCap,
  Lock,
  User,
  School,
  CheckCircle2,
} from 'lucide-react';
import { DataSiswa, Pengguna, ProfilSekolah } from '../types';
import { StorageManager } from '../utils/storage';

interface LoginViewProps {
  profil: ProfilSekolah;
  onLoginAdmin: (admin: Pengguna) => void;
  onLoginSiswa: (siswa: DataSiswa) => void;
}

export function LoginView({ profil, onLoginAdmin, onLoginSiswa }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'siswa' | 'admin'>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  // Generate random captcha (alphanumeric uppercase/numbers)
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
    setErrorMessage('');
    setErrorDetails('');
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetails('');

    // Captcha validation
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Kode Captcha tidak sesuai. Silakan coba lagi.');
      generateCaptcha();
      return;
    }

    if (activeTab === 'admin') {
      const admin = StorageManager.getAdmin();
      if (
        username.trim() === admin.Username &&
        password === admin.Password
      ) {
        onLoginAdmin(admin);
      } else {
        setErrorMessage('Username atau Password Admin salah.');
      }
    } else {
      // Siswa login
      const students = StorageManager.getSiswa();
      const student = students.find(
        (s) =>
          (s.Username.toLowerCase() === username.trim().toLowerCase() ||
            s.NIS === username.trim()) &&
          s.Password === password.trim()
      );

      if (!student) {
        setErrorMessage('Username/NIS atau Password Siswa salah.');
        return;
      }

      // Check if student is already logged in or locked
      if (student.StatusLogin === 'Sedang Login') {
        setErrorMessage('Gagal Masuk: Akun Anda Sedang Login di Perangkat Lain.');
        setErrorDetails(
          'Demi keamanan ujian, satu akun siswa hanya boleh login pada satu perangkat. Silakan hubungi Pengawas Ruang / Administrator untuk melakukan Reset Login (M6) agar Anda dapat masuk kembali.'
        );
        return;
      }

      if (student.StatusLogin === 'Terkunci') {
        setErrorMessage('Gagal Masuk: Akun Siswa Terkunci.');
        setErrorDetails(
          'Akun Anda telah dinonaktifkan atau terkunci oleh Pengawas. Silakan melapor ke panitia/pengawas ujian untuk membuka kunci akun Anda.'
        );
        return;
      }

      // Successful student login: mark status as Sedang Login
      const updatedStudents = students.map((s) => {
        if (s.ID === student.ID) {
          const nowStr = new Date().toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          return {
            ...s,
            StatusLogin: 'Sedang Login' as const,
            LoginTerakhir: nowStr,
          };
        }
        return s;
      });

      StorageManager.saveSiswa(updatedStudents);
      onLoginSiswa({
        ...student,
        StatusLogin: 'Sedang Login',
        LoginTerakhir: new Date().toISOString(),
      });
    }
  };

  // Quick helper to fill demo credentials
  const fillDemoStudent = () => {
    const students = StorageManager.getSiswa();
    if (students.length > 0) {
      const demo = students[0];
      setUsername(demo.Username);
      setPassword(demo.Password);
      setCaptchaInput(captchaCode);
    }
  };

  const fillDemoAdmin = () => {
    const admin = StorageManager.getAdmin();
    setUsername(admin.Username);
    setPassword(admin.Password);
    setCaptchaInput(captchaCode);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                {profil.NamaSekolah}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Computer Based Test (CBT) System · TA {profil.TahunPelajaran}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>NPSN: {profil.NPSN}</span>
            <span>·</span>
            <span>{profil.StatusAkreditasi}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          {/* Role Tab Selector */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-xl flex items-center mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('siswa');
                setUsername('');
                setPassword('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'siswa'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Portal Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setUsername('');
                setPassword('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Portal Admin</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeTab === 'siswa' ? 'Masuk ke Ruang Ujian' : 'Autentikasi Administrator'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'siswa'
                  ? 'Gunakan NIS / Username dan Password yang telah dibagikan.'
                  : 'Akses penuh pengelolaan data master, bank soal, dan jadwal ujian.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-300">{errorMessage}</p>
                    {errorDetails && (
                      <p className="text-rose-200/80 mt-1 leading-relaxed text-[11px]">
                        {errorDetails}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {activeTab === 'siswa' ? 'NIS atau Username' : 'Username Admin'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeTab === 'siswa' ? 'Contoh: 2425001' : 'Contoh: admin'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Input with eye toggle (F1) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Captcha Input & Box (F2) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kode Verifikasi (Captcha)
                  </label>
                  <span className="text-[11px] text-slate-500">Ketik kode di samping</span>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Captcha Visual Box */}
                  <div className="relative flex items-center justify-between bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl select-none">
                    <span className="font-mono text-base font-extrabold tracking-widest text-teal-300 line-through decoration-slate-600 italic">
                      {captchaCode}
                    </span>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-slate-400 hover:text-teal-400 transition-colors p-1"
                      title="Muat Ulang Captcha"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Captcha Input */}
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Kode captcha"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  activeTab === 'siswa'
                    ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/25'
                    : 'bg-slate-800 hover:bg-slate-700 shadow-slate-900/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeTab === 'siswa' ? 'Masuk Ujian' : 'Masuk Dashboard'}</span>
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Bantuan Uji Coba:</span>
                {activeTab === 'siswa' ? (
                  <button
                    type="button"
                    onClick={fillDemoStudent}
                    className="text-[11px] font-medium text-teal-400 hover:text-teal-300 underline"
                  >
                    Isi Otomatis Akun Siswa (Aditya Pratama)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="text-[11px] font-medium text-teal-400 hover:text-teal-300 underline"
                  >
                    Isi Otomatis Akun Admin (admin / admin123)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          © 2026 {profil.NamaSekolah} · Sistem Computer Based Test (CBT) Terakreditasi B
        </p>
      </footer>
    </div>
  );
}
