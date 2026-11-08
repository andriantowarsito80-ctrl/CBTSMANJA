/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  School,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Pengguna, ProfilSekolah } from '../../types';

interface M9PengaturanProps {
  profil: ProfilSekolah;
  admin: Pengguna;
  onUpdateProfil: (newProfil: ProfilSekolah) => void;
  onUpdateAdmin: (newAdmin: Pengguna) => void;
}

export function M9Pengaturan({
  profil,
  admin,
  onUpdateProfil,
  onUpdateAdmin,
}: M9PengaturanProps) {
  // F1: School profile form
  const [schoolForm, setSchoolForm] = useState({
    NamaSekolah: profil.NamaSekolah,
    StatusAkreditasi: profil.StatusAkreditasi,
    NPSN: profil.NPSN,
    NamaKepalaSekolah: profil.NamaKepalaSekolah,
    TahunPelajaran: profil.TahunPelajaran,
  });
  const [schoolSuccess, setSchoolSuccess] = useState(false);

  // F2: Admin Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProfilSekolah = {
      ...profil,
      NamaSekolah: schoolForm.NamaSekolah.trim(),
      StatusAkreditasi: schoolForm.StatusAkreditasi.trim(),
      NPSN: schoolForm.NPSN.trim(),
      NamaKepalaSekolah: schoolForm.NamaKepalaSekolah.trim(),
      TahunPelajaran: schoolForm.TahunPelajaran.trim(),
    };
    onUpdateProfil(updated);
    setSchoolSuccess(true);
    setTimeout(() => setSchoolSuccess(false), 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (oldPassword !== admin.Password) {
      setPasswordError('Password saat ini salah.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const updated: Pengguna = {
      ...admin,
      Password: newPassword,
    };
    onUpdateAdmin(updated);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Pengaturan Sistem</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola profil identitas sekolah resmi dan kata sandi akun administrator
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* F1: Form Profil Sekolah */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Profil Sekolah (F1)</h3>
              <p className="text-xs text-slate-400">
                Informasi resmi yang tertera pada lembar ujian dan dashboard
              </p>
            </div>
          </div>

          {schoolSuccess && (
            <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Profil sekolah berhasil diperbarui.</span>
            </div>
          )}

          <form onSubmit={handleSaveSchool} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Sekolah *
              </label>
              <input
                type="text"
                required
                value={schoolForm.NamaSekolah}
                onChange={(e) => setSchoolForm({ ...schoolForm, NamaSekolah: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Akreditasi *
                </label>
                <input
                  type="text"
                  required
                  value={schoolForm.StatusAkreditasi}
                  onChange={(e) => setSchoolForm({ ...schoolForm, StatusAkreditasi: e.target.value })}
                  placeholder="Contoh: Terakreditasi B"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NPSN *
                </label>
                <input
                  type="text"
                  required
                  value={schoolForm.NPSN}
                  onChange={(e) => setSchoolForm({ ...schoolForm, NPSN: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={schoolForm.NamaKepalaSekolah}
                onChange={(e) =>
                  setSchoolForm({ ...schoolForm, NamaKepalaSekolah: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tahun Pelajaran *
              </label>
              <input
                type="text"
                required
                value={schoolForm.TahunPelajaran}
                onChange={(e) =>
                  setSchoolForm({ ...schoolForm, TahunPelajaran: e.target.value })
                }
                placeholder="Contoh: 2026 - 2027"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>

        {/* F2: Form Ubah Password Admin */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Keamanan & Password (F2)</h3>
              <p className="text-xs text-slate-400">
                Ubah kata sandi akun administrator ({admin.Username})
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Password Admin berhasil diubah.</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password Admin Saat Ini *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama..."
                  className="w-full px-3.5 py-2 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password Baru *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ulangi Password Baru *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Perbarui Password Admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
