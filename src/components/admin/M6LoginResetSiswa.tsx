/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  FileWarning,
} from 'lucide-react';
import { DataSiswa, JadwalUjian, SesiUjian } from '../../types';

interface M6LoginResetSiswaProps {
  siswa: DataSiswa[];
  jadwal: JadwalUjian[];
  sesiUjian: SesiUjian[];
  onUpdateSiswa: (newSiswa: DataSiswa[]) => void;
  onUpdateSesiUjian: (newSesi: SesiUjian[]) => void;
}

export function M6LoginResetSiswa({
  siswa,
  jadwal,
  sesiUjian,
  onUpdateSiswa,
  onUpdateSesiUjian,
}: M6LoginResetSiswaProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');

  // Selected student IDs for bulk reset login
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal Reset Ujian Siswa (F4)
  const [resetExamModalOpen, setResetExamModalOpen] = useState(false);
  const [targetStudentForExamReset, setTargetStudentForExamReset] = useState<DataSiswa | null>(null);
  const [selectedExamToReset, setSelectedExamToReset] = useState<string>('');

  // Unique classes
  const classList = useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      if (s.Kelas) set.add(s.Kelas);
    });
    return Array.from(set).sort();
  }, [siswa]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    let result = [...siswa];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.NamaSiswa.toLowerCase().includes(q) || s.NIS.includes(q)
      );
    }

    if (selectedClass !== 'SEMUA') {
      result = result.filter((s) => s.Kelas === selectedClass);
    }

    if (selectedStatus !== 'SEMUA') {
      result = result.filter((s) => s.StatusLogin === selectedStatus);
    }

    return result;
  }, [siswa, searchQuery, selectedClass, selectedStatus]);

  // Handlers for Reset Login (F2 & F3)
  const handleResetSingleLogin = (studentId: string) => {
    const student = siswa.find((s) => s.ID === studentId);
    const updated = siswa.map((s) =>
      s.ID === studentId ? { ...s, StatusLogin: 'Belum Login' as const } : s
    );
    onUpdateSiswa(updated);
    setActionNotice(
      `Status login siswa ${student?.NamaSiswa || ''} (${student?.NIS}) berhasil direset menjadi 'Belum Login'.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleBulkResetLogin = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const updated = siswa.map((s) =>
      selectedIds.includes(s.ID)
        ? { ...s, StatusLogin: 'Belum Login' as const }
        : s
    );
    onUpdateSiswa(updated);
    setSelectedIds([]);
    setActionNotice(`${count} akun siswa berhasil direset ke status 'Belum Login'.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleLock = (studentId: string) => {
    const student = siswa.find((s) => s.ID === studentId);
    if (!student) return;

    const newStatus = student.StatusLogin === 'Terkunci' ? 'Belum Login' : 'Terkunci';
    const updated = siswa.map((s) =>
      s.ID === studentId ? { ...s, StatusLogin: newStatus as any } : s
    );
    onUpdateSiswa(updated);
    setActionNotice(
      `Akun siswa ${student.NamaSiswa} kini berstatus '${newStatus}'.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.ID));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open Reset Exam Modal (F4)
  const handleOpenResetExamModal = (student: DataSiswa) => {
    setTargetStudentForExamReset(student);
    // Find exams that this student has sessions for or all exams
    const studentSessions = sesiUjian.filter((se) => se.NIS === student.NIS);
    const defaultExamId = studentSessions[0]?.IDJadwal || jadwal[0]?.ID || '';
    setSelectedExamToReset(defaultExamId);
    setResetExamModalOpen(true);
  };

  const handleConfirmResetExam = () => {
    if (!targetStudentForExamReset || !selectedExamToReset) return;

    // Delete session and answers for this student on this exam
    const updatedSessions = sesiUjian.filter(
      (se) => !(se.NIS === targetStudentForExamReset.NIS && se.IDJadwal === selectedExamToReset)
    );
    onUpdateSesiUjian(updatedSessions);

    // Also reset their login status so they can enter immediately
    const updatedStudents = siswa.map((s) =>
      s.ID === targetStudentForExamReset.ID
        ? { ...s, StatusLogin: 'Belum Login' as const }
        : s
    );
    onUpdateSiswa(updatedStudents);

    const exam = jadwal.find((j) => j.ID === selectedExamToReset);
    setResetExamModalOpen(false);
    setActionNotice(
      `Sesi & jawaban ujian "${exam?.NamaUjian || 'Ujian'}" untuk siswa ${
        targetStudentForExamReset.NamaSiswa
      } berhasil dihapus. Siswa dapat mengulang ujian dari awal.`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Login & Reset Siswa</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau status login perangkat, atasi kendala sesi ganda, dan reset pengerjaan ujian
          </p>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkResetLogin}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Login Terpilih ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-teal-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NIS siswa..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Filter Kelas */}
        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="SEMUA">Semua Kelas</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status Login */}
        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="SEMUA">Semua Status Login</option>
            <option value="Belum Login">Belum Login</option>
            <option value="Sedang Login">Sedang Login (Aktif)</option>
            <option value="Terkunci">Terkunci</option>
          </select>
        </div>
      </div>

      {/* Table Siswa Login Status (F1, F2, F3, F4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredStudents.length &&
                      filteredStudents.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
                  />
                </th>
                <th className="py-3.5 px-4 w-28">NIS</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4 w-24">Kelas</th>
                <th className="py-3.5 px-4 w-32">Status Login</th>
                <th className="py-3.5 px-4 w-40">Login Terakhir</th>
                <th className="py-3.5 px-4 w-60 text-right">Aksi Reset & Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada siswa yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedIds.includes(s.ID);
                  const isLocked = s.StatusLogin === 'Terkunci';
                  const isOnline = s.StatusLogin === 'Sedang Login';

                  return (
                    <tr
                      key={s.ID}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(s.ID)}
                          className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-teal-400">
                        {s.NIS}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {s.NamaSiswa}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {s.Kelas}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isOnline
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isLocked
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.StatusLogin}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span>{s.LoginTerakhir || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* F2: Tombol Reset Login */}
                          <button
                            onClick={() => handleResetSingleLogin(s.ID)}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                            title="Reset status ke 'Belum Login' jika siswa keluar/pindah perangkat"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Reset Login</span>
                          </button>

                          {/* F4: Tombol Reset Ujian Siswa */}
                          <button
                            onClick={() => handleOpenResetExamModal(s)}
                            className="px-2.5 py-1 text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/60 flex items-center gap-1 transition-colors"
                            title="Hapus sesi & jawaban ujian siswa agar dapat mengulang dari awal"
                          >
                            <FileWarning className="w-3 h-3 text-rose-400" />
                            <span>Reset Ujian</span>
                          </button>

                          {/* Kunci / Buka Akun */}
                          <button
                            onClick={() => handleToggleLock(s.ID)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isLocked
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
                            }`}
                            title={isLocked ? 'Buka Kunci Akun' : 'Kunci Akun Siswa'}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Menampilkan <strong className="text-white font-mono">{filteredStudents.length}</strong> siswa
          </span>
          <span className="text-[11px] text-slate-500">
            *Reset Login mengizinkan siswa masuk kembali jika terjadi gangguan browser/jaringan.
          </span>
        </div>
      </div>

      {/* Modal Reset Ujian Siswa (F4) */}
      {resetExamModalOpen && targetStudentForExamReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setResetExamModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Reset Pengerjaan Ujian Siswa
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Tindakan ini akan <strong>menghapus seluruh rekaman sesi dan jawaban</strong> yang telah diinput
              oleh siswa pada ujian terpilih. Siswa dapat login kembali dan memulai ujian dari nomor 1.
            </p>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="text-slate-400 mb-0.5">Siswa Terpilih:</div>
                <div className="font-bold text-white text-sm">
                  {targetStudentForExamReset.NamaSiswa}
                </div>
                <div className="text-teal-400 font-mono mt-0.5">
                  NIS: {targetStudentForExamReset.NIS} · Kelas {targetStudentForExamReset.Kelas}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Ujian yang Ingin Direset *
                </label>
                <select
                  value={selectedExamToReset}
                  onChange={(e) => setSelectedExamToReset(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {jadwal.map((j) => (
                    <option key={j.ID} value={j.ID}>
                      {j.NamaUjian} ({j.MataPelajaran})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResetExamModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetExam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Konfirmasi Reset Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
