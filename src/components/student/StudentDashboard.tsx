/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  School,
  ArrowRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  BankSoal,
  DataSiswa,
  JadwalUjian,
  PesertaUjian,
  ProfilSekolah,
  SesiUjian,
  StatusTest,
} from '../../types';

interface StudentDashboardProps {
  siswa: DataSiswa;
  profil: ProfilSekolah;
  jadwal: JadwalUjian[];
  statusTest: StatusTest[];
  pesertaUjian: PesertaUjian[];
  sesiUjian: SesiUjian[];
  bankSoal: BankSoal[];
  onOpenExam: (jadwal: JadwalUjian) => void;
  onLogout: () => void;
}

export function StudentDashboard({
  siswa,
  profil,
  jadwal,
  statusTest,
  pesertaUjian,
  sesiUjian,
  onOpenExam,
  onLogout,
}: StudentDashboardProps) {
  // S1 F2: Filter ONLY exams enrolled by this student in PesertaUjian
  const enrolledExams = useMemo(() => {
    const studentRelations = pesertaUjian.filter((p) => p.NIS === siswa.NIS);
    const enrolledScheduleIds = new Set(studentRelations.map((r) => r.IDJadwal));

    return jadwal.filter((j) => enrolledScheduleIds.has(j.ID));
  }, [jadwal, pesertaUjian, siswa.NIS]);

  // Determine each exam's readiness status
  const examStatusDetails = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMins = now.getHours() * 60 + now.getMinutes();

    return enrolledExams.map((exam) => {
      const testRecord = statusTest.find((st) => st.IDJadwal === exam.ID);
      const studentSession = sesiUjian.find(
        (se) => se.IDJadwal === exam.ID && se.NIS === siswa.NIS
      );

      const [startH, startM] = (exam.JamMulai || '00:00').split(':').map(Number);
      const [endH, endM] = (exam.JamSelesai || '23:59').split(':').map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;

      let isTimeActive = false;
      let timeLabel = 'Akan Datang';

      if (exam.Tanggal < todayStr) {
        timeLabel = 'Sudah Lewat';
      } else if (exam.Tanggal > todayStr) {
        timeLabel = 'Akan Datang';
      } else {
        if (currentMins < startMins) {
          timeLabel = 'Belum Dimulai';
        } else if (currentMins > endMins) {
          timeLabel = 'Waktu Habis';
        } else {
          timeLabel = 'Berlangsung';
          isTimeActive = true;
        }
      }

      const isTestStatusActive = testRecord?.Status === 'Aktif';
      const isAlreadyFinished = studentSession?.Status === 'Selesai';
      const isCanStart = isTestStatusActive && !isAlreadyFinished;

      return {
        exam,
        testRecord,
        studentSession,
        isTimeActive,
        timeLabel,
        isTestStatusActive,
        isAlreadyFinished,
        isCanStart,
      };
    });
  }, [enrolledExams, statusTest, sesiUjian, siswa.NIS]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
              {profil.NamaSekolah}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Portal Ujian Siswa · CBT SMAN 1 Majalaya
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Main Student Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* S1 F1: Identitas Siswa Card */}
        <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-slate-950 border border-teal-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center shrink-0 shadow-lg">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                    Siswa Terdaftar
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">
                    TA {profil.TahunPelajaran}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {siswa.NamaSiswa}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 pt-0.5">
                  <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    NIS: <strong className="text-teal-400">{siswa.NIS}</strong>
                  </span>
                  <span>·</span>
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 font-medium">
                    Kelas: <strong className="text-white">{siswa.Kelas}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3 text-right shrink-0">
              <span className="block text-[11px] text-slate-400">Status Akun Siswa</span>
              <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {siswa.StatusLogin}
              </span>
            </div>
          </div>
        </div>

        {/* S1 F2: Jadwal Ujian yang Diikuti */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Jadwal Ujian yang Anda Ikuti</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daftar ujian resmi sesuai rombongan belajar kelas Anda ({siswa.Kelas})
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {enrolledExams.length} Ujian Terdaftar
            </span>
          </div>

          {examStatusDetails.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">
                Tidak ada jadwal ujian untuk Anda saat ini.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Silakan hubungi proktor atau pengawas ujian jika nama Anda belum didaftarkan di peserta ujian.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examStatusDetails.map(
                ({
                  exam,
                  testRecord,
                  studentSession,
                  isCanStart,
                  isAlreadyFinished,
                  isTestStatusActive,
                }) => {
                  return (
                    <div
                      key={exam.ID}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
                            {exam.MataPelajaran}
                          </span>

                          {isAlreadyFinished ? (
                            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ujian Selesai</span>
                            </span>
                          ) : isTestStatusActive ? (
                            <span className="text-[11px] font-semibold text-teal-300 bg-teal-950/40 border border-teal-800/60 px-2 py-0.5 rounded animate-pulse">
                              Ujian Siap
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              Menunggu Token Proktor
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white leading-snug">
                          {exam.NamaUjian}
                        </h4>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 pt-1">
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {exam.JamMulai} - {exam.JamSelesai} ({exam.DurasiMenit} Menit)
                            </span>
                          </div>
                          <span>·</span>
                          <span>{exam.JumlahSoal} Butir Soal</span>
                          <span>·</span>
                          <span className="font-mono text-slate-500">{exam.Tanggal}</span>
                        </div>
                      </div>

                      {/* Action footer */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        {isAlreadyFinished ? (
                          <div className="text-xs text-slate-400">
                            Lembar jawaban telah dikumpulkan.
                            {studentSession?.Skor !== undefined && (
                              <span className="block font-mono text-emerald-400 font-semibold mt-0.5">
                                Nilai Anda: {studentSession.Skor}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400">
                            {isTestStatusActive
                              ? 'Siapkan token dari pengawas ruang.'
                              : 'Status ujian saat ini nonaktif.'}
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={!isCanStart}
                          onClick={() => onOpenExam(exam)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                            isCanStart
                              ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/25 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                          }`}
                        >
                          <span>{isAlreadyFinished ? 'Lihat Bukti' : 'Mulai Ujian'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
