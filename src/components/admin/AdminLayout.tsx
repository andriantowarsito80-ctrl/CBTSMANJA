/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  RotateCcw,
  Sparkles,
  UserCheck,
  Settings,
  LogOut,
  School,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  AdminMenuKey,
  BankSoal,
  DataGuru,
  DataSiswa,
  JadwalUjian,
  PaketSoal,
  Pengguna,
  PesertaUjian,
  ProfilSekolah,
  SesiUjian,
  StatusTest,
} from '../../types';
import { M1Dashboard } from './M1Dashboard';
import { M2DatabaseSiswa } from './M2DatabaseSiswa';
import { M3DatabaseGuru } from './M3DatabaseGuru';
import { M4BankSoal } from './M4BankSoal';
import { M5JadwalUjian } from './M5JadwalUjian';
import { M6LoginResetSiswa } from './M6LoginResetSiswa';
import { M7StatusTest } from './M7StatusTest';
import { M8PesertaUjian } from './M8PesertaUjian';
import { M9Pengaturan } from './M9Pengaturan';

interface AdminLayoutProps {
  admin: Pengguna;
  profil: ProfilSekolah;
  siswa: DataSiswa[];
  guru: DataGuru[];
  paketSoal?: PaketSoal[];
  bankSoal: BankSoal[];
  jadwal: JadwalUjian[];
  statusTest: StatusTest[];
  pesertaUjian: PesertaUjian[];
  sesiUjian: SesiUjian[];
  onUpdateProfil: (p: ProfilSekolah) => void;
  onUpdateAdmin: (a: Pengguna) => void;
  onUpdateSiswa: (s: DataSiswa[]) => void;
  onUpdateGuru: (g: DataGuru[]) => void;
  onUpdatePaketSoal?: (p: PaketSoal[]) => void;
  onUpdateBankSoal: (b: BankSoal[]) => void;
  onUpdateJadwal: (j: JadwalUjian[]) => void;
  onUpdateStatusTest: (st: StatusTest[]) => void;
  onUpdatePesertaUjian: (pu: PesertaUjian[]) => void;
  onUpdateSesiUjian: (su: SesiUjian[]) => void;
  onLogout: () => void;
}

const MENU_ITEMS: { key: AdminMenuKey; label: string; icon: React.ElementType; badge?: string }[] = [
  { key: 'M1', label: 'M1 Dashboard', icon: LayoutDashboard },
  { key: 'M2', label: 'M2 Database Siswa', icon: Users },
  { key: 'M3', label: 'M3 Database Guru', icon: GraduationCap },
  { key: 'M4', label: 'M4 Bank Soal', icon: BookOpen },
  { key: 'M5', label: 'M5 Jadwal Ujian', icon: Calendar },
  { key: 'M6', label: 'M6 Login & Reset Siswa', icon: RotateCcw },
  { key: 'M7', label: 'M7 Status Test', icon: Sparkles },
  { key: 'M8', label: 'M8 Peserta Ujian', icon: UserCheck },
  { key: 'M9', label: 'M9 Pengaturan', icon: Settings },
];

export function AdminLayout(props: AdminLayoutProps) {
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('M1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentItem = MENU_ITEMS.find((m) => m.key === activeMenu);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight leading-none">
                  {props.profil.NamaSekolah}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  CBT ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tahun Pelajaran {props.profil.TahunPelajaran} · NPSN: {props.profil.NPSN}
              </p>
            </div>
          </div>
        </div>

        {/* Right Zone: Admin profile & logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white leading-tight">
              {props.admin.NamaLengkap}
            </span>
            <span className="text-[10px] text-teal-400 font-mono">@{props.admin.Username}</span>
          </div>

          <button
            onClick={props.onLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 transition-colors flex items-center gap-1.5"
            title="Keluar dari Portal Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform md:relative md:translate-x-0 transition-transform duration-200 flex flex-col justify-between pt-16 md:pt-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Menu Items */}
          <div className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu CBT SMAN 1 Majalaya
            </div>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveMenu(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </div>

          {/* Quick status card in sidebar footer */}
          <div className="p-3 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Status Sistem CBT</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Sistem aktif dan siap melayani asesmen sekolah secara terstruktur.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeMenu === 'M1' && (
              <M1Dashboard
                profil={props.profil}
                siswa={props.siswa}
                guru={props.guru}
                bankSoal={props.bankSoal}
                jadwal={props.jadwal}
                statusTest={props.statusTest}
                onNavigate={(m) => setActiveMenu(m)}
              />
            )}

            {activeMenu === 'M2' && (
              <M2DatabaseSiswa
                siswa={props.siswa}
                onUpdateSiswa={props.onUpdateSiswa}
              />
            )}

            {activeMenu === 'M3' && (
              <M3DatabaseGuru
                guru={props.guru}
                siswa={props.siswa}
                onUpdateGuru={props.onUpdateGuru}
              />
            )}

            {activeMenu === 'M4' && (
              <M4BankSoal
                paketSoal={props.paketSoal}
                bankSoal={props.bankSoal}
                guru={props.guru}
                siswa={props.siswa}
                onUpdatePaketSoal={props.onUpdatePaketSoal}
                onUpdateBankSoal={props.onUpdateBankSoal}
              />
            )}

            {activeMenu === 'M5' && (
              <M5JadwalUjian
                jadwal={props.jadwal}
                bankSoal={props.bankSoal}
                siswa={props.siswa}
                statusTest={props.statusTest}
                onUpdateJadwal={props.onUpdateJadwal}
                onNavigateToStatusTest={() => setActiveMenu('M7')}
              />
            )}

            {activeMenu === 'M6' && (
              <M6LoginResetSiswa
                siswa={props.siswa}
                jadwal={props.jadwal}
                sesiUjian={props.sesiUjian}
                onUpdateSiswa={props.onUpdateSiswa}
                onUpdateSesiUjian={props.onUpdateSesiUjian}
              />
            )}

            {activeMenu === 'M7' && (
              <M7StatusTest
                profil={props.profil}
                jadwal={props.jadwal}
                statusTest={props.statusTest}
                onUpdateStatusTest={props.onUpdateStatusTest}
              />
            )}

            {activeMenu === 'M8' && (
              <M8PesertaUjian
                jadwal={props.jadwal}
                statusTest={props.statusTest}
                siswa={props.siswa}
                pesertaUjian={props.pesertaUjian}
                sesiUjian={props.sesiUjian}
                onUpdatePesertaUjian={props.onUpdatePesertaUjian}
              />
            )}

            {activeMenu === 'M9' && (
              <M9Pengaturan
                profil={props.profil}
                admin={props.admin}
                onUpdateProfil={props.onUpdateProfil}
                onUpdateAdmin={props.onUpdateAdmin}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
