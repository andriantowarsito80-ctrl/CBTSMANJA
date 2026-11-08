/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Trash2,
  Edit2,
  X,
  Shuffle,
  Layers,
  Search,
} from 'lucide-react';
import { BankSoal, DataSiswa, JadwalUjian, StatusTest } from '../../types';

interface M5JadwalUjianProps {
  jadwal: JadwalUjian[];
  bankSoal: BankSoal[];
  siswa: DataSiswa[];
  statusTest: StatusTest[];
  onUpdateJadwal: (newJadwal: JadwalUjian[]) => void;
  onNavigateToStatusTest?: (jadwalId: string) => void;
}

export function M5JadwalUjian({
  jadwal,
  bankSoal,
  siswa,
  statusTest,
  onUpdateJadwal,
  onNavigateToStatusTest,
}: M5JadwalUjianProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingJadwal, setEditingJadwal] = useState<JadwalUjian | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JadwalUjian | null>(null);

  // Available classes in system
  const classList = useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      if (s.Kelas) set.add(s.Kelas);
    });
    return Array.from(set).sort();
  }, [siswa]);

  // Unique list of subjects in Bank Soal
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    bankSoal.forEach((q) => {
      if (q.MataPelajaran) set.add(q.MataPelajaran);
    });
    return Array.from(set).sort();
  }, [bankSoal]);

  // Form State
  const [formData, setFormData] = useState({
    NamaUjian: '',
    MataPelajaran: '',
    SelectedClasses: [] as string[],
    Tanggal: new Date().toISOString().slice(0, 10),
    JamMulai: '07:30',
    JamSelesai: '09:00',
    DurasiMenit: 60,
    JumlahSoal: 5,
    AcakSoal: 'Ya' as 'Ya' | 'Tidak',
  });
  const [formError, setFormError] = useState('');

  // Count available questions in Bank Soal for chosen subject
  const availableQuestionCount = useMemo(() => {
    if (!formData.MataPelajaran) return 0;
    return bankSoal.filter((q) => q.MataPelajaran === formData.MataPelajaran).length;
  }, [bankSoal, formData.MataPelajaran]);

  // Breakdown of available materials for chosen subject
  const availableMaterialsForSubject = useMemo(() => {
    if (!formData.MataPelajaran) return [];
    const map = new Map<string, number>();
    bankSoal
      .filter((q) => q.MataPelajaran === formData.MataPelajaran)
      .forEach((q) => {
        const m = q.MateriUjian?.trim() || 'Umum';
        map.set(m, (map.get(m) || 0) + 1);
      });
    return Array.from(map.entries()).map(([materi, count]) => ({ materi, count }));
  }, [bankSoal, formData.MataPelajaran]);

  // Compute status for each schedule (F3: Akan Datang, Berlangsung, Selesai)
  const getScheduleStatus = (j: JadwalUjian) => {
    // Check if StatusTest has forced Selesai
    const st = statusTest.find((s) => s.IDJadwal === j.ID);
    if (st && st.Status === 'Selesai') return 'Selesai';

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMins = now.getHours() * 60 + now.getMinutes();

    if (j.Tanggal < todayStr) return 'Selesai';
    if (j.Tanggal > todayStr) return 'Akan Datang';

    const [startH, startM] = (j.JamMulai || '00:00').split(':').map(Number);
    const [endH, endM] = (j.JamSelesai || '23:59').split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (currentMins < startMins) return 'Akan Datang';
    if (currentMins > endMins) return 'Selesai';
    return 'Berlangsung';
  };

  const filteredJadwal = useMemo(() => {
    if (!searchQuery.trim()) return jadwal;
    const q = searchQuery.toLowerCase();
    return jadwal.filter(
      (j) =>
        j.NamaUjian.toLowerCase().includes(q) ||
        j.MataPelajaran.toLowerCase().includes(q) ||
        j.KelasPeserta.toLowerCase().includes(q)
    );
  }, [jadwal, searchQuery]);

  const handleOpenAdd = () => {
    setEditingJadwal(null);
    const defaultSubject = availableSubjects[0] || 'Matematika Wajib';
    const count = bankSoal.filter((q) => q.MataPelajaran === defaultSubject).length;

    setFormData({
      NamaUjian: '',
      MataPelajaran: defaultSubject,
      SelectedClasses: classList.length > 0 ? [classList[0]] : ['X-1'],
      Tanggal: new Date().toISOString().slice(0, 10),
      JamMulai: '08:00',
      JamSelesai: '09:30',
      DurasiMenit: 60,
      JumlahSoal: Math.max(1, Math.min(count, 5)),
      AcakSoal: 'Ya',
    });
    setFormError('');
    setModalMode('add');
  };

  const handleOpenEdit = (j: JadwalUjian) => {
    setEditingJadwal(j);
    const classes = j.KelasPeserta ? j.KelasPeserta.split(',').map((c) => c.trim()) : [];
    setFormData({
      NamaUjian: j.NamaUjian,
      MataPelajaran: j.MataPelajaran,
      SelectedClasses: classes,
      Tanggal: j.Tanggal,
      JamMulai: j.JamMulai,
      JamSelesai: j.JamSelesai,
      DurasiMenit: j.DurasiMenit,
      JumlahSoal: j.JumlahSoal,
      AcakSoal: j.AcakSoal,
    });
    setFormError('');
    setModalMode('edit');
  };

  const toggleClassSelection = (cls: string) => {
    setFormData((prev) => {
      const exists = prev.SelectedClasses.includes(cls);
      return {
        ...prev,
        SelectedClasses: exists
          ? prev.SelectedClasses.filter((c) => c !== cls)
          : [...prev.SelectedClasses, cls],
      };
    });
  };

  const handleSelectAllClasses = () => {
    setFormData((prev) => ({
      ...prev,
      SelectedClasses: prev.SelectedClasses.length === classList.length ? [] : [...classList],
    }));
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.NamaUjian.trim()) {
      setFormError('Nama Ujian wajib diisi.');
      return;
    }
    if (!formData.MataPelajaran) {
      setFormError('Pilih Mata Pelajaran.');
      return;
    }
    if (formData.SelectedClasses.length === 0) {
      setFormError('Pilih minimal satu kelas peserta.');
      return;
    }

    const availableCount = bankSoal.filter((q) => q.MataPelajaran === formData.MataPelajaran).length;
    if (availableCount === 0) {
      setFormError(
        `Belum ada butir soal di Bank Soal untuk mata pelajaran ${formData.MataPelajaran}. Tambahkan soal di Bank Soal terlebih dahulu.`
      );
      return;
    }

    const requestedCount = Number(formData.JumlahSoal) || 1;
    if (requestedCount > availableCount) {
      setFormError(
        `Jumlah soal yang diminta (${requestedCount}) melebihi jumlah soal tersedia di Bank Soal (${availableCount}).`
      );
      return;
    }

    const kelasPesertaStr = formData.SelectedClasses.join(', ');

    if (modalMode === 'add') {
      const newJ: JadwalUjian = {
        ID: 'JADWAL_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        NamaUjian: formData.NamaUjian.trim(),
        MataPelajaran: formData.MataPelajaran,
        KelasPeserta: kelasPesertaStr,
        Tanggal: formData.Tanggal,
        JamMulai: formData.JamMulai,
        JamSelesai: formData.JamSelesai,
        DurasiMenit: Number(formData.DurasiMenit) || 60,
        JumlahSoal: requestedCount,
        AcakSoal: formData.AcakSoal,
      };
      onUpdateJadwal([newJ, ...jadwal]);
    } else if (editingJadwal) {
      const updated = jadwal.map((j) =>
        j.ID === editingJadwal.ID
          ? {
              ...j,
              NamaUjian: formData.NamaUjian.trim(),
              MataPelajaran: formData.MataPelajaran,
              KelasPeserta: kelasPesertaStr,
              Tanggal: formData.Tanggal,
              JamMulai: formData.JamMulai,
              JamSelesai: formData.JamSelesai,
              DurasiMenit: Number(formData.DurasiMenit) || 60,
              JumlahSoal: requestedCount,
              AcakSoal: formData.AcakSoal,
            }
          : j
      );
      onUpdateJadwal(updated);
    }

    setModalMode('none');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onUpdateJadwal(jadwal.filter((j) => j.ID !== deleteTarget.ID));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Jadwal Ujian Sekolah</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur kalender tes, durasi pengerjaan, kuota soal, dan kelas peserta
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Ujian</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama ujian, mapel, atau kelas..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* Jadwal Table (F1, F3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-44">Nama Ujian</th>
                <th className="py-3.5 px-4 w-32">Mata Pelajaran</th>
                <th className="py-3.5 px-4 w-32">Kelas Peserta</th>
                <th className="py-3.5 px-4 w-28">Tanggal</th>
                <th className="py-3.5 px-4 w-28">Waktu (Jam)</th>
                <th className="py-3.5 px-4 w-20 text-center">Durasi</th>
                <th className="py-3.5 px-4 w-20 text-center">Soal</th>
                <th className="py-3.5 px-4 w-20 text-center">Acak</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredJadwal.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Belum ada jadwal ujian yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredJadwal.map((j) => {
                  const status = getScheduleStatus(j);

                  return (
                    <tr key={j.ID} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {j.NamaUjian}
                      </td>
                      <td className="py-3.5 px-4 text-teal-400 font-medium">
                        {j.MataPelajaran}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {j.KelasPeserta}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {j.Tanggal}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {j.JamMulai} - {j.JamSelesai}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {j.DurasiMenit}m
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-400">
                        {j.JumlahSoal}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            j.AcakSoal === 'Ya'
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {j.AcakSoal}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            status === 'Berlangsung'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : status === 'Akan Datang'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(j)}
                            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(j)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          Total: <strong className="text-white font-mono">{filteredJadwal.length}</strong> jadwal
          tercatat
        </div>
      </div>

      {/* Modal Tambah / Edit Jadwal (F2) */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setModalMode('none')}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {modalMode === 'add' ? 'Buat Jadwal Ujian Baru' : 'Edit Jadwal Ujian'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Soal akan otomatis dialokasikan dari Bank Soal sesuai mata pelajaran yang dipilih.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveJadwal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Ujian / Asesmen *
                </label>
                <input
                  type="text"
                  required
                  value={formData.NamaUjian}
                  onChange={(e) => setFormData({ ...formData, NamaUjian: e.target.value })}
                  placeholder="Contoh: Penilaian Sumatif Akhir Semester (PSAS) Ganjil"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mata Pelajaran *
                  </label>
                  <select
                    value={formData.MataPelajaran}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      const count = bankSoal.filter((q) => q.MataPelajaran === newSub).length;
                      setFormData({
                        ...formData,
                        MataPelajaran: newSub,
                        JumlahSoal: Math.max(1, Math.min(count, 5)),
                      });
                    }}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-teal-400 mt-1 block">
                    {availableQuestionCount} butir soal tersedia di Bank Soal
                  </span>
                  {availableMaterialsForSubject.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {availableMaterialsForSubject.map(({ materi, count }) => (
                        <span
                          key={materi}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                        >
                          {materi} ({count})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jumlah Soal yang Diujikan *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={availableQuestionCount || 100}
                    value={formData.JumlahSoal}
                    onChange={(e) =>
                      setFormData({ ...formData, JumlahSoal: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Kelas Peserta (Multi-Pilih) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Kelas Peserta Ujian *
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllClasses}
                    className="text-[11px] text-teal-400 hover:underline"
                  >
                    {formData.SelectedClasses.length === classList.length
                      ? 'Batalkan Semua'
                      : 'Pilih Semua Kelas'}
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl max-h-36 overflow-y-auto">
                  {classList.map((cls) => {
                    const isSelected = formData.SelectedClasses.includes(cls);
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => toggleClassSelection(cls)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                          isSelected
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Tanggal}
                    onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.JamMulai}
                    onChange={(e) => setFormData({ ...formData, JamMulai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.JamSelesai}
                    onChange={(e) => setFormData({ ...formData, JamSelesai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Durasi & Acak Soal */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Durasi Pengerjaan (Menit) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={formData.DurasiMenit}
                    onChange={(e) =>
                      setFormData({ ...formData, DurasiMenit: Number(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Acak Urutan Soal?
                  </label>
                  <select
                    value={formData.AcakSoal}
                    onChange={(e) =>
                      setFormData({ ...formData, AcakSoal: e.target.value as 'Ya' | 'Tidak' })
                    }
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Ya">Ya (Acak urutan untuk tiap siswa)</option>
                    <option value="Tidak">Tidak (Urutan sama sesuai bank soal)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                >
                  Simpan Jadwal Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Konfirmasi Hapus Jadwal</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal ujian <strong>{deleteTarget.NamaUjian}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Ya, Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
