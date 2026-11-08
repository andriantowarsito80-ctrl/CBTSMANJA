/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Sparkles,
  School,
  Clock,
  ArrowRight,
  UserCheck,
  Award,
} from 'lucide-react';
import {
  AdminMenuKey,
  BankSoal,
  DataGuru,
  DataSiswa,
  JadwalUjian,
  ProfilSekolah,
  StatusTest,
} from '../../types';

interface M1DashboardProps {
  profil: ProfilSekolah;
  siswa: DataSiswa[];
  guru: DataGuru[];
  bankSoal: BankSoal[];
  jadwal: JadwalUjian[];
  statusTest: StatusTest[];
  onNavigate: (menu: AdminMenuKey) => void;
}

export function M1Dashboard({
  profil,
  siswa,
  guru,
  bankSoal,
  jadwal,
  statusTest,
  onNavigate,
}: M1DashboardProps) {
  // Compute student count per class
  const classDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    siswa.forEach((s) => {
      const cls = s.Kelas || 'Tanpa Kelas';
      counts[cls] = (counts[cls] || 0) + 1;
    });

    const sortedClasses = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    const maxVal = Math.max(...Object.values(counts), 1);

    return { counts, sortedClasses, maxVal };
  }, [siswa]);

  // Compute exam schedule statuses
  const examStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    jadwal.forEach((j) => {
      // Check StatusTest first if set to Selesai
      const testStatus = statusTest.find((st) => st.IDJadwal === j.ID);
      if (testStatus && testStatus.Status === 'Selesai') {
        map[j.ID] = 'Selesai';
        return;
      }

      if (j.Tanggal < todayStr) {
        map[j.ID] = 'Selesai';
      } else if (j.Tanggal > todayStr) {
        map[j.ID] = 'Akan Datang';
      } else {
        // Today: check hours
        const [startH, startM] = (j.JamMulai || '00:00').split(':').map(Number);
        const [endH, endM] = (j.JamSelesai || '23:59').split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        if (currentTimeMinutes < startTotal) {
          map[j.ID] = 'Akan Datang';
        } else if (currentTimeMinutes > endTotal) {
          map[j.ID] = 'Selesai';
        } else {
          map[j.ID] = 'Berlangsung';
        }
      }
    });

    return map;
  }, [jadwal, statusTest]);

  // Filter exams that are active or upcoming
  const ongoingAndUpcomingExams = useMemo(() => {
    return jadwal.filter((j) => {
      const st = examStatusMap[j.ID];
      return st === 'Berlangsung' || st === 'Akan Datang';
    });
  }, [jadwal, examStatusMap]);

  return (
    <div className="space-y-6">
      {/* Top Banner: F1 Profil Sekolah */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-slate-950 border border-teal-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <School className="w-4 h-4" />
              <span>Profil Resmi Sekolah</span>
              <span>·</span>
              <span className="font-mono">Tahun Pelajaran {profil.TahunPelajaran}</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profil.NamaSekolah}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Sistem Ujian Berbasis Komputer (CBT) terpusat untuk pelaksanaan Asesmen Sumatif,
                Penilaian Harian, dan Penilaian Akhir Jenjang.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Akreditasi: <strong className="text-white font-semibold">{profil.StatusAkreditasi}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">NPSN:</span>
                <strong className="text-white font-mono font-semibold">{profil.NPSN}</strong>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Kepala Sekolah: <strong className="text-white font-semibold">{profil.NamaKepalaSekolah}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('M9')}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
            >
              Ubah Profil Sekolah
            </button>
            <button
              onClick={() => onNavigate('M7')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Token Ujian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('M2')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Siswa</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {siswa.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">siswa terdata</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('M3')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tenaga Pengajar</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {guru.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">guru pengampu</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('M4')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Bank Soal</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {bankSoal.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">butir soal</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('M5')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Jadwal Ujian</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {jadwal.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">sesi terdaftar</span>
          </div>
        </div>
      </div>

      {/* Grid: F2 Jumlah Siswa per Kelas & F3 Informasi Ujian */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* F2: Jumlah Siswa per Kelas (Kartu Angka & Grafik Batang) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Distribusi Siswa per Kelas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rekapitulasi jumlah siswa aktif per rombongan belajar
                </p>
              </div>
              <button
                onClick={() => onNavigate('M2')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Cards per class */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
              {classDistribution.sortedClasses.map((cls) => (
                <div
                  key={cls}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 text-center"
                >
                  <span className="block text-[11px] font-medium text-slate-400 truncate">
                    {cls}
                  </span>
                  <span className="block text-lg font-bold font-mono tabular-nums text-teal-400 mt-0.5">
                    {classDistribution.counts[cls]}
                  </span>
                </div>
              ))}
              {classDistribution.sortedClasses.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  Belum ada data siswa terdaftar.
                </div>
              )}
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300 block">
                Visualisasi Grafik Batang
              </span>
              <div className="space-y-2.5">
                {classDistribution.sortedClasses.map((cls) => {
                  const count = classDistribution.counts[cls];
                  const percentage = Math.round((count / classDistribution.maxVal) * 100);
                  return (
                    <div key={'bar-' + cls} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cls}</span>
                        <span className="text-slate-400 font-mono tabular-nums">
                          {count} siswa
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* F3: Informasi Ujian Sedang Berlangsung & Akan Datang */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Status Pelaksanaan Ujian
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ujian yang sedang berlangsung dan akan datang
                </p>
              </div>
              <button
                onClick={() => onNavigate('M5')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {ongoingAndUpcomingExams.length === 0 ? (
                <div className="text-center py-10 bg-slate-950 rounded-2xl border border-dashed border-slate-800 p-6">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-400">
                    Tidak ada ujian yang sedang berlangsung atau akan datang hari ini.
                  </p>
                  <button
                    onClick={() => onNavigate('M5')}
                    className="mt-3 text-xs text-teal-400 hover:underline"
                  >
                    Tambah Jadwal Ujian Baru
                  </button>
                </div>
              ) : (
                ongoingAndUpcomingExams.map((exam) => {
                  const status = examStatusMap[exam.ID];
                  const testStatus = statusTest.find((st) => st.IDJadwal === exam.ID);

                  return (
                    <div
                      key={exam.ID}
                      className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-teal-400">
                              {exam.MataPelajaran}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">Kelas: {exam.KelasPeserta}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {exam.NamaUjian}
                          </h4>
                        </div>

                        {/* Status Label */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                              status === 'Berlangsung'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {exam.JamMulai} - {exam.JamSelesai} ({exam.DurasiMenit} menit)
                            </span>
                          </div>
                          <span className="text-slate-600">·</span>
                          <span>{exam.JumlahSoal} Butir Soal</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {testStatus && (
                            <span className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              Token: <strong className="text-teal-400">{testStatus.Token}</strong>
                            </span>
                          )}
                          <button
                            onClick={() => onNavigate('M7')}
                            className="text-xs text-teal-400 hover:underline"
                          >
                            Kelola Token
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
