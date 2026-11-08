/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Calendar,
  Layers,
  Clock,
  ShieldCheck,
  School,
  X,
} from 'lucide-react';
import { JadwalUjian, ProfilSekolah, StatusTest } from '../../types';
import { generateRandomToken } from '../../utils/excel';

interface M7StatusTestProps {
  profil: ProfilSekolah;
  jadwal: JadwalUjian[];
  statusTest: StatusTest[];
  onUpdateStatusTest: (newStatus: StatusTest[]) => void;
}

export function M7StatusTest({
  profil,
  jadwal,
  statusTest,
  onUpdateStatusTest,
}: M7StatusTestProps) {
  // Currently selected schedule to configure
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>(
    jadwal[0]?.ID || ''
  );

  // Presenter fullscreen modal mode (F3)
  const [presenterOpen, setPresenterOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get current status test record for selected schedule
  const currentRecord = useMemo(() => {
    return statusTest.find((st) => st.IDJadwal === selectedJadwalId);
  }, [statusTest, selectedJadwalId]);

  const selectedJadwal = useMemo(() => {
    return jadwal.find((j) => j.ID === selectedJadwalId);
  }, [jadwal, selectedJadwalId]);

  // Handler to set status (Nonaktif / Aktif / Selesai) (F1)
  const handleSetStatus = (newStatus: 'Nonaktif' | 'Aktif' | 'Selesai') => {
    if (!selectedJadwalId) return;

    if (currentRecord) {
      const updated = statusTest.map((st) =>
        st.ID === currentRecord.ID ? { ...st, Status: newStatus } : st
      );
      onUpdateStatusTest(updated);
    } else {
      const newRec: StatusTest = {
        ID: 'STAT_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        IDJadwal: selectedJadwalId,
        Status: newStatus,
        Token: generateRandomToken(6),
        TokenTampil: 'Ya',
      };
      onUpdateStatusTest([...statusTest, newRec]);
    }
  };

  // Handler to toggle show / hide token (F2)
  const handleToggleTokenVisibility = () => {
    if (!currentRecord) return;
    const newTampil = currentRecord.TokenTampil === 'Ya' ? 'Tidak' : 'Ya';
    const updated = statusTest.map((st) =>
      st.ID === currentRecord.ID ? { ...st, TokenTampil: newTampil as any } : st
    );
    onUpdateStatusTest(updated);
  };

  // Handler to re-generate token (F2)
  const handleRegenerateToken = () => {
    const newToken = generateRandomToken(6);
    if (currentRecord) {
      const updated = statusTest.map((st) =>
        st.ID === currentRecord.ID ? { ...st, Token: newToken } : st
      );
      onUpdateStatusTest(updated);
    } else if (selectedJadwalId) {
      const newRec: StatusTest = {
        ID: 'STAT_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        IDJadwal: selectedJadwalId,
        Status: 'Aktif',
        Token: newToken,
        TokenTampil: 'Ya',
      };
      onUpdateStatusTest([...statusTest, newRec]);
    }
  };

  const copyTokenToClipboard = () => {
    if (!currentRecord?.Token) return;
    navigator.clipboard.writeText(currentRecord.Token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Status Test & Rilis Token</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Atur izin mulai tes, generate token acak 6 digit, dan tampilkan ke layar proyektor ruang ujian
        </p>
      </div>

      {jadwal.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-400">
            Belum ada jadwal ujian yang dibuat. Buat jadwal di menu M5 terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Select Exam Schedule */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                1. Pilih Jadwal Ujian
              </h3>
              <div className="space-y-2">
                {jadwal.map((j) => {
                  const isSelected = j.ID === selectedJadwalId;
                  const rec = statusTest.find((st) => st.IDJadwal === j.ID);
                  const statusVal = rec?.Status || 'Nonaktif';

                  return (
                    <button
                      key={j.ID}
                      type="button"
                      onClick={() => setSelectedJadwalId(j.ID)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500/60 shadow-md'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-400 truncate">
                          {j.MataPelajaran}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            statusVal === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : statusVal === 'Selesai'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {statusVal}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-white leading-tight">
                        {j.NamaUjian}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span>{j.Tanggal}</span>
                        <span>·</span>
                        <span>{j.JamMulai} - {j.JamSelesai}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Status Test & Big Token Display (F1, F2, F3) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedJadwal ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400">
                      {selectedJadwal.MataPelajaran}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {selectedJadwal.ID}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {selectedJadwal.NamaUjian}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kelas: {selectedJadwal.KelasPeserta} · Durasi {selectedJadwal.DurasiMenit} menit · {selectedJadwal.JumlahSoal} Butir Soal
                  </p>
                </div>

                {/* Status Switcher Buttons (F1) */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Status Pelaksanaan Ujian (Status Test)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['Nonaktif', 'Aktif', 'Selesai'] as const).map((stat) => {
                      const isActive = (currentRecord?.Status || 'Nonaktif') === stat;

                      return (
                        <button
                          key={stat}
                          type="button"
                          onClick={() => handleSetStatus(stat)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                            isActive
                              ? stat === 'Aktif'
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                                : stat === 'Nonaktif'
                                ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                                : 'bg-slate-700 text-white border-slate-600 shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {stat}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    *Hanya ujian dengan status <strong>Aktif</strong> yang dapat dimulai oleh siswa dengan memasukkan token yang benar.
                  </p>
                </div>

                {/* Token Generator Card & Big Display (F2, F3) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Token Ujian (6 Karakter Acak)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Show / Hide Toggle */}
                      <button
                        type="button"
                        onClick={handleToggleTokenVisibility}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {currentRecord?.TokenTampil === 'Ya' ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tampilkan</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate Token */}
                      <button
                        type="button"
                        onClick={handleRegenerateToken}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-teal-300 rounded-lg border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Acak Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Big Token Display Box (F3) */}
                  <div className="my-4 py-8 px-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-center select-none shadow-inner">
                    {currentRecord?.TokenTampil === 'Ya' ? (
                      <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-widest text-teal-300 drop-shadow-md">
                        {currentRecord?.Token || 'MJA26X'}
                      </span>
                    ) : (
                      <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-widest text-slate-600">
                        ••••••
                      </span>
                    )}
                  </div>

                  {/* Presenter / Fullscreen trigger button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyTokenToClipboard}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin' : 'Salin Token'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPresenterOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Mode Layar Penuh Ruang Ujian</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Presenter Fullscreen Modal (F3: Token tampil besar di layar proyektor admin) */}
      {presenterOpen && selectedJadwal && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-8 sm:p-12 text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {profil.NamaSekolah}
                </h1>
                <p className="text-xs text-slate-400">
                  Papan Rilis Token Ujian · Ruang Ujian CBT Terpusat
                </p>
              </div>
            </div>

            <button
              onClick={() => setPresenterOpen(false)}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-colors"
              title="Keluar dari Layar Penuh"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>

          {/* Huge Token Center Stage */}
          <div className="text-center my-auto py-8 space-y-8 max-w-4xl mx-auto w-full">
            <div className="space-y-2">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {selectedJadwal.MataPelajaran}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {selectedJadwal.NamaUjian}
              </h2>
              <p className="text-sm text-slate-400 font-mono">
                Kelas: {selectedJadwal.KelasPeserta} · Durasi {selectedJadwal.DurasiMenit} Menit
              </p>
            </div>

            {/* Giant Token Container */}
            <div className="bg-slate-900/90 border-2 border-teal-500/50 rounded-3xl p-10 sm:p-14 shadow-2xl relative">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                MASUKKAN TOKEN BERIKUT PADA LAYAR SISWA
              </div>
              <div className="font-mono text-7xl sm:text-9xl font-extrabold tracking-widest text-teal-300 drop-shadow-2xl">
                {currentRecord?.TokenTampil === 'Ya'
                  ? currentRecord?.Token || 'MJA26X'
                  : '••••••'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Waktu Ujian: {selectedJadwal.JamMulai} - {selectedJadwal.JamSelesai} WIB</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Status Ujian: {currentRecord?.Status || 'Aktif'}</span>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="border-t border-slate-800 pt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Tekan tombol di samping atau keluar untuk mengelola jadwal ujian</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRegenerateToken}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 rounded-xl font-semibold border border-slate-800 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Acak Ulang Token</span>
              </button>
              <button
                onClick={() => setPresenterOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold"
              >
                Tutup Tampilan Presenter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
