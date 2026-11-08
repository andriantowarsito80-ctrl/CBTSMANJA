/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  HelpCircle,
  School,
  Sparkles,
  ArrowLeft,
  X,
  FileCheck,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import {
  BankSoal,
  DataSiswa,
  JadwalUjian,
  ProfilSekolah,
  SesiUjian,
  StatusTest,
} from '../../types';

interface StudentExamRoomProps {
  siswa: DataSiswa;
  profil: ProfilSekolah;
  jadwal: JadwalUjian;
  statusTestRecord?: StatusTest;
  bankSoal: BankSoal[];
  existingSession?: SesiUjian;
  onSaveSession: (session: SesiUjian) => void;
  onExit: () => void;
}

export function StudentExamRoom({
  siswa,
  profil,
  jadwal,
  statusTestRecord,
  bankSoal,
  existingSession,
  onSaveSession,
  onExit,
}: StudentExamRoomProps) {
  // Stable session identity refs (preserves same session ID throughout test lifecycle)
  const sessionIdRef = useRef<string>(
    existingSession?.ID || 'SESI_' + Math.random().toString(36).substring(2, 9)
  );
  const sessionCreatedRef = useRef<string>(
    existingSession?.Dibuat || new Date().toISOString()
  );
  const sessionStartRef = useRef<string>(
    existingSession?.WaktuMulai || new Date().toISOString()
  );

  // Phase of exam: 'token_input' | 'in_progress' | 'submitted'
  const isAlreadyFinished = existingSession?.Status === 'Selesai';
  const [phase, setPhase] = useState<'token_input' | 'in_progress' | 'submitted'>(
    isAlreadyFinished ? 'submitted' : existingSession ? 'in_progress' : 'token_input'
  );

  // Token input state (F2)
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Active Question index (0-based)
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers state
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>(
    () => existingSession?.Jawaban || {}
  );
  // Doubt state (Ragu-ragu)
  const [doubtMap, setDoubtMap] = useState<Record<string, boolean>>(
    () => existingSession?.RaguRagu || {}
  );

  // Questions allocated for this student - initialized stably once on mount
  const [examQuestions] = useState<BankSoal[]>(() => {
    const matchingSubjectQuestions = bankSoal.filter(
      (q) => q.MataPelajaran === jadwal.MataPelajaran
    );

    if (existingSession && existingSession.DaftarSoal?.length > 0) {
      const questionMap = new Map(bankSoal.map((q) => [q.ID, q]));
      const restored = existingSession.DaftarSoal
        .map((id) => questionMap.get(id)!)
        .filter(Boolean);
      if (restored.length > 0) return restored;
    }

    let pool = matchingSubjectQuestions.length > 0 ? matchingSubjectQuestions : bankSoal;
    const poolCopy = [...pool];

    if (jadwal.AcakSoal === 'Ya') {
      for (let i = poolCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
      }
    }

    return poolCopy.slice(0, Math.min(jadwal.JumlahSoal, poolCopy.length));
  });

  // Timer: remaining seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    return (jadwal.DurasiMenit || 60) * 60;
  });

  // Finish confirmation modal
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Image zoom lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Drawer mobile toggle for questions grid
  const [showDrawer, setShowDrawer] = useState(false);

  // Submission results
  const [finalScore, setFinalScore] = useState<number | undefined>(existingSession?.Skor);
  const [submitTime, setSubmitTime] = useState<string>(
    existingSession?.WaktuSelesai || ''
  );

  // Helper to persist current session to storage
  const saveSessionRef = useRef(onSaveSession);
  saveSessionRef.current = onSaveSession;

  const persistSession = (
    currentAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>,
    currentDoubt: Record<string, boolean>,
    currentStatus: 'Mengerjakan' | 'Selesai' = 'Mengerjakan',
    score?: number,
    completedAt?: string
  ) => {
    if (examQuestions.length === 0) return;
    const sessionData: SesiUjian = {
      ID: sessionIdRef.current,
      Dibuat: sessionCreatedRef.current,
      IDJadwal: jadwal.ID,
      NIS: siswa.NIS,
      DaftarSoal: examQuestions.map((q) => q.ID),
      Jawaban: currentAnswers,
      RaguRagu: currentDoubt,
      WaktuMulai: sessionStartRef.current,
      WaktuSelesai: completedAt,
      Status: currentStatus,
      Skor: score,
    };
    saveSessionRef.current(sessionData);
  };

  // Submit Exam handler (F5)
  const handleSubmitExam = () => {
    const now = new Date().toISOString();
    setSubmitTime(now);

    let totalScore = 0;
    let totalWeight = 0;

    examQuestions.forEach((q) => {
      const weight = q.Bobot || 1;
      totalWeight += weight;
      if (answers[q.ID] === q.KunciJawaban) {
        totalScore += weight;
      }
    });

    const calculatedScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    setFinalScore(calculatedScore);

    persistSession(answers, doubtMap, 'Selesai', calculatedScore, now);
    setShowFinishModal(false);
    setPhase('submitted');
  };

  const handleSubmitRef = useRef(handleSubmitExam);
  handleSubmitRef.current = handleSubmitExam;

  // Real-time Countdown Timer (F3, F4)
  useEffect(() => {
    if (phase !== 'in_progress') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Handler: Validate Token (F2)
  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');

    if (!statusTestRecord || statusTestRecord.Status !== 'Aktif') {
      setTokenError('Ujian ini belum diaktifkan oleh pengawas ruang.');
      return;
    }

    if (tokenInput.trim().toUpperCase() !== statusTestRecord.Token.toUpperCase()) {
      setTokenError('Token ujian salah. Silakan periksa kembali token di layar ruang ujian.');
      return;
    }

    // Token match! Enter exam room and save initial session
    setPhase('in_progress');
    persistSession(answers, doubtMap, 'Mengerjakan');
  };

  // Answer selection handler (F4 auto-save on choice)
  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const newAnswers = {
      ...answers,
      [questionId]: option,
    };
    setAnswers(newAnswers);
    persistSession(newAnswers, doubtMap, 'Mengerjakan');
  };

  // Doubt toggle handler (F4 auto-save on flag)
  const handleToggleDoubt = (questionId: string) => {
    const newDoubt = {
      ...doubtMap,
      [questionId]: !doubtMap[questionId],
    };
    setDoubtMap(newDoubt);
    persistSession(answers, newDoubt, 'Mengerjakan');
  };

  // Current active question
  const currentQ = examQuestions[currentIdx];

  // Stats computation for summary modal
  const summaryStats = useMemo(() => {
    const total = examQuestions.length;
    let answered = 0;
    let doubt = 0;

    examQuestions.forEach((q) => {
      if (answers[q.ID]) answered++;
      if (doubtMap[q.ID]) doubt++;
    });

    const unanswered = total - answered;
    return { total, answered, doubt, unanswered };
  }, [examQuestions, answers, doubtMap]);

  // Format countdown string
  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Render Token Screen (F2)
  if (phase === 'token_input') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
        <header className="max-w-xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>
          <span className="text-xs font-mono text-teal-400 font-semibold">CBT SMAN 1 Majalaya</span>
        </header>

        <div className="max-w-md mx-auto w-full my-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Konfirmasi Token Ujian
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {jadwal.NamaUjian}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Mapel: {jadwal.MataPelajaran} · Durasi: {jadwal.DurasiMenit} Menit · {jadwal.JumlahSoal} Soal
              </p>
            </div>

            {tokenError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{tokenError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Masukkan Token Ujian (6 Karakter) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: MJA26X"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono text-xl tracking-widest text-teal-300 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase placeholder:text-slate-600"
                />
                <span className="text-[11px] text-slate-500 mt-1.5 block text-center">
                  Token diperoleh dari pengawas ruangan ujian Anda.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Kerjakan Ujian Sekarang</span>
              </button>
            </form>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-600 py-4">
          © {new Date().getFullYear()} {profil.NamaSekolah}
        </footer>
      </div>
    );
  }

  // Render Submitted / Success Screen (F5)
  if (phase === 'submitted') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
        <header className="max-w-xl mx-auto w-full py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
            <School className="w-4 h-4" />
            <span>{profil.NamaSekolah}</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Tanda Terima CBT</span>
        </header>

        <div className="max-w-lg mx-auto w-full my-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Ujian Berhasil Dikumpulkan
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                Terima Kasih, {siswa.NamaSiswa}!
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Seluruh lembar jawaban Anda untuk mata pelajaran <strong>{jadwal.MataPelajaran}</strong> telah
                berhasil tersimpan ke server pangkalan data CBT.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Nomor Induk Siswa:</span>
                <span className="text-teal-400 font-bold">{siswa.NIS}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="text-white">{siswa.NamaSiswa}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Kelas:</span>
                <span className="text-white">{siswa.Kelas}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Ujian:</span>
                <span className="text-white">{jadwal.NamaUjian}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Waktu Dikumpulkan:</span>
                <span className="text-slate-300">
                  {new Date(submitTime || Date.now()).toLocaleString('id-ID')}
                </span>
              </div>
              {finalScore !== undefined && (
                <div className="flex justify-between py-1 pt-2 text-sm font-bold text-emerald-400">
                  <span>Skor CBT Anda:</span>
                  <span>{finalScore} / 100</span>
                </div>
              )}
            </div>

            <button
              onClick={onExit}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              Kembali ke Dashboard Siswa
            </button>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-600 py-4">
          Tahun Pelajaran {profil.TahunPelajaran} · Terakreditasi B
        </footer>
      </div>
    );
  }

  // Active Exam Interface (F3, F4, F5)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased select-none">
      {/* Top Exam Header: Sticky */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
            CBT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                {jadwal.NamaUjian}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
                {jadwal.MataPelajaran}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {siswa.NIS} - {siswa.NamaSiswa} ({siswa.Kelas})
            </div>
          </div>
        </div>

        {/* Live Countdown Timer (F3) */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm shadow-inner transition-colors ${
              remainingSeconds < 300
                ? 'bg-rose-950/50 border-rose-600 text-rose-300 animate-pulse'
                : remainingSeconds < 900
                ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-teal-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="tabular-nums">{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="md:hidden px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
          >
            {showDrawer ? 'Tutup Daftar' : 'Daftar Soal'}
          </button>
        </div>
      </header>

      {/* Exam Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Question Viewport (F3) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {currentQ ? (
              <>
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-teal-500 text-slate-950 font-mono font-bold text-xs rounded-lg">
                      SOAL NO. {currentIdx + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      dari {examQuestions.length} butir soal
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Auto-save indicator */}
                    <span className="text-[11px] text-teal-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Tersimpan otomatis</span>
                    </span>
                  </div>
                </div>

                {/* Question Text & Image (F3) */}
                <div className="space-y-4">
                  <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                    {currentQ.TeksSoal}
                  </div>

                  {currentQ.GambarSoal && (
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-2xl inline-block max-w-full">
                      <img
                        src={currentQ.GambarSoal}
                        alt="Gambar Soal"
                        className="max-h-64 rounded-xl object-contain cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setPreviewImage(currentQ.GambarSoal || null)}
                      />
                      <span className="block text-[10px] text-slate-500 mt-1 text-center">
                        Klik gambar untuk memperbesar tampilan
                      </span>
                    </div>
                  )}
                </div>

                {/* Option Choices A s.d E (F3) */}
                <div className="space-y-2.5 pt-2">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                    const text = currentQ[`Opsi${opt}`];
                    const img = currentQ[`GambarOpsi${opt}`];
                    const isSelected = answers[currentQ.ID] === opt;

                    return (
                      <div
                        key={opt}
                        onClick={() => handleSelectOption(currentQ.ID, opt)}
                        className={`p-3 sm:p-3.5 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500 text-white shadow-md shadow-teal-500/10'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-teal-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt}
                        </div>

                        <div className="space-y-2 flex-1 pt-0.5">
                          <p className="leading-relaxed">{text || '-'}</p>
                          {img && (
                            <img
                              src={img}
                              alt={`Pilihan ${opt}`}
                              className="max-h-28 object-contain rounded-lg border border-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(img);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Memuat butir soal...
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar: Sebelumnya, Ragu-ragu, Selanjutnya (F3) */}
          <div className="max-w-3xl mx-auto w-full pt-6 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentIdx === 0
                  ? 'bg-slate-900 text-slate-600 border border-slate-800/60 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Soal Sebelumnya</span>
            </button>

            {/* Ragu-ragu Checkbox / Button (F3) */}
            {currentQ && (
              <button
                type="button"
                onClick={() => handleToggleDoubt(currentQ.ID)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  doubtMap[currentQ.ID]
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!doubtMap[currentQ.ID]}
                  readOnly
                  className="rounded border-amber-400 text-amber-500 pointer-events-none"
                />
                <span>Ragu-ragu</span>
              </button>
            )}

            {currentIdx < examQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all"
              >
                <span>Soal Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinishModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Selesaikan Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Number Grid Palette (F3) */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-72 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-200 md:relative md:translate-x-0 pt-16 md:pt-5 ${
            showDrawer ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Navigasi Nomor Soal
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="md:hidden text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></span>
                <span>Kosong</span>
              </div>
            </div>

            {/* Grid 1 to N */}
            <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = !!answers[q.ID];
                const isDoubt = !!doubtMap[q.ID];

                let btnBg = 'bg-slate-950 text-slate-400 border-slate-800';
                if (isDoubt) {
                  btnBg = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                } else if (isAnswered) {
                  btnBg = 'bg-emerald-600 text-white font-bold border-emerald-500';
                }

                return (
                  <button
                    key={q.ID}
                    type="button"
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowDrawer(false);
                    }}
                    className={`h-10 rounded-xl font-mono text-xs font-semibold flex flex-col items-center justify-center transition-all border ${btnBg} ${
                      isCurrent ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {answers[q.ID] && (
                      <span className="text-[9px] -mt-1 font-bold">
                        {answers[q.ID]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Finish Button in Sidebar */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowFinishModal(true)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Selesai & Kumpulkan</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal Selesai Ujian (F5) */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowFinishModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Konfirmasi Pengumpulan Ujian
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Periksa ringkasan lembar pengerjaan Anda sebelum mengumpulkan.
            </p>

            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">Terjawab</span>
                <span className="block text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {summaryStats.answered}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">Ragu-ragu</span>
                <span className="block text-xl font-bold font-mono text-amber-400 mt-0.5">
                  {summaryStats.doubt}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">Belum Dijawab</span>
                <span className="block text-xl font-bold font-mono text-rose-400 mt-0.5">
                  {summaryStats.unanswered}
                </span>
              </div>
            </div>

            {summaryStats.unanswered > 0 && (
              <div className="p-3 mb-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Masih terdapat <strong>{summaryStats.unanswered}</strong> butir soal yang belum Anda jawab.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                onClick={() => handleSubmitExam()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2">
            <img
              src={previewImage}
              alt="Perbesar Soal"
              className="max-h-[80vh] w-auto mx-auto rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
            <p className="text-center text-xs text-slate-400 mt-3">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}
    </div>
  );
}
