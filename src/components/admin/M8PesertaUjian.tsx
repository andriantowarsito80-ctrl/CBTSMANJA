/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Check,
  Award,
  Layers,
} from 'lucide-react';
import {
  DataSiswa,
  JadwalUjian,
  PesertaUjian,
  SesiUjian,
  StatusTest,
} from '../../types';

interface M8PesertaUjianProps {
  jadwal: JadwalUjian[];
  statusTest: StatusTest[];
  siswa: DataSiswa[];
  pesertaUjian: PesertaUjian[];
  sesiUjian: SesiUjian[];
  onUpdatePesertaUjian: (newPeserta: PesertaUjian[]) => void;
}

export function M8PesertaUjian({
  jadwal,
  statusTest,
  siswa,
  pesertaUjian,
  sesiUjian,
  onUpdatePesertaUjian,
}: M8PesertaUjianProps) {
  // F1: Only allow exams that ALREADY have a record configured in StatusTest
  const configuredExamIds = useMemo(() => {
    return new Set(statusTest.map((st) => st.IDJadwal));
  }, [statusTest]);

  const eligibleExams = useMemo(() => {
    return jadwal.filter((j) => configuredExamIds.has(j.ID));
  }, [jadwal, configuredExamIds]);

  // Selected Exam
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>(
    eligibleExams[0]?.ID || ''
  );

  // Participant search and filters
  const [searchParticipant, setSearchParticipant] = useState('');
  const [filterParticipantClass, setFilterParticipantClass] = useState('SEMUA');

  // Add Participant Drawer / Section State
  const [isAddMode, setIsAddMode] = useState(false);
  const [candidateClass, setCandidateClass] = useState<string>('SEMUA');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateNIS, setSelectedCandidateNIS] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Available classes in system
  const classList = useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      if (s.Kelas) set.add(s.Kelas);
    });
    return Array.from(set).sort();
  }, [siswa]);

  // Currently selected schedule object
  const currentExam = useMemo(() => {
    return jadwal.find((j) => j.ID === selectedJadwalId);
  }, [jadwal, selectedJadwalId]);

  // Registered participants for selected exam
  const currentParticipants = useMemo(() => {
    if (!selectedJadwalId) return [];
    const relations = pesertaUjian.filter((p) => p.IDJadwal === selectedJadwalId);
    const nisSet = new Set(relations.map((r) => r.NIS));

    return siswa
      .filter((s) => nisSet.has(s.NIS))
      .map((s) => {
        // Find session
        const session = sesiUjian.find(
          (se) => se.IDJadwal === selectedJadwalId && se.NIS === s.NIS
        );
        let progressStatus: 'Belum Mulai' | 'Mengerjakan' | 'Selesai' = 'Belum Mulai';
        let score: number | undefined = undefined;

        if (session) {
          progressStatus = session.Status === 'Selesai' ? 'Selesai' : 'Mengerjakan';
          score = session.Skor;
        }

        return {
          ...s,
          progressStatus,
          score,
          relationId: relations.find((r) => r.NIS === s.NIS)?.ID,
        };
      });
  }, [selectedJadwalId, pesertaUjian, siswa, sesiUjian]);

  // Filtered participants list
  const filteredParticipants = useMemo(() => {
    let list = [...currentParticipants];
    if (searchParticipant.trim()) {
      const q = searchParticipant.toLowerCase();
      list = list.filter(
        (p) => p.NamaSiswa.toLowerCase().includes(q) || p.NIS.includes(q)
      );
    }
    if (filterParticipantClass !== 'SEMUA') {
      list = list.filter((p) => p.Kelas === filterParticipantClass);
    }
    return list;
  }, [currentParticipants, searchParticipant, filterParticipantClass]);

  // Candidate students not yet enrolled in this exam
  const candidateStudents = useMemo(() => {
    if (!selectedJadwalId) return [];
    const registeredNIS = new Set(
      pesertaUjian.filter((p) => p.IDJadwal === selectedJadwalId).map((p) => p.NIS)
    );

    let list = siswa.filter((s) => !registeredNIS.has(s.NIS));

    if (candidateClass !== 'SEMUA') {
      list = list.filter((s) => s.Kelas === candidateClass);
    }
    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase();
      list = list.filter(
        (s) => s.NamaSiswa.toLowerCase().includes(q) || s.NIS.includes(q)
      );
    }
    return list;
  }, [siswa, pesertaUjian, selectedJadwalId, candidateClass, candidateSearch]);

  // Handler: Add entire class (F2)
  const handleAddEntireClass = (cls: string) => {
    if (!selectedJadwalId) return;

    const registeredNIS = new Set(
      pesertaUjian.filter((p) => p.IDJadwal === selectedJadwalId).map((p) => p.NIS)
    );

    const classStudents = siswa.filter(
      (s) => s.Kelas === cls && !registeredNIS.has(s.NIS)
    );

    if (classStudents.length === 0) {
      alert(`Semua siswa kelas ${cls} sudah terdaftar sebagai peserta ujian ini.`);
      return;
    }

    const newEntries: PesertaUjian[] = classStudents.map((s) => ({
      ID: 'PES_' + Math.random().toString(36).substring(2, 9),
      Dibuat: new Date().toISOString(),
      IDJadwal: selectedJadwalId,
      NIS: s.NIS,
    }));

    onUpdatePesertaUjian([...pesertaUjian, ...newEntries]);
    setActionNotice(`Berhasil menambahkan ${newEntries.length} siswa dari kelas ${cls}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handler: Add selected candidates (F2)
  const handleAddSelectedCandidates = () => {
    if (!selectedJadwalId || selectedCandidateNIS.length === 0) return;

    const newEntries: PesertaUjian[] = selectedCandidateNIS.map((nis) => ({
      ID: 'PES_' + Math.random().toString(36).substring(2, 9),
      Dibuat: new Date().toISOString(),
      IDJadwal: selectedJadwalId,
      NIS: nis,
    }));

    onUpdatePesertaUjian([...pesertaUjian, ...newEntries]);
    setSelectedCandidateNIS([]);
    setIsAddMode(false);
    setActionNotice(`Berhasil mendaftarkan ${newEntries.length} siswa ke ujian.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handler: Remove participant (F3)
  const handleRemoveParticipant = (relationId?: string) => {
    if (!relationId) return;
    onUpdatePesertaUjian(pesertaUjian.filter((p) => p.ID !== relationId));
    setActionNotice('Peserta berhasil dihapus dari daftar ujian.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Summary counts for monitoring (F4)
  const stats = useMemo(() => {
    const total = currentParticipants.length;
    const selesai = currentParticipants.filter((p) => p.progressStatus === 'Selesai').length;
    const mengerjakan = currentParticipants.filter((p) => p.progressStatus === 'Mengerjakan').length;
    const belum = currentParticipants.filter((p) => p.progressStatus === 'Belum Mulai').length;
    return { total, selesai, mengerjakan, belum };
  }, [currentParticipants]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Peserta Ujian & Pemantauan</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftarkan peserta per rombel/individu dan pantau status pengerjaan secara langsung
          </p>
        </div>

        {selectedJadwalId && (
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAddMode ? 'Tutup Pendaftaran' : 'Tambah Peserta Ujian'}</span>
          </button>
        )}
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-teal-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* F1: Select Exam Schedule that has StatusTest configured */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Pilih Ujian (Hanya Ujian yang Sudah Diatur di Status Test)
        </label>

        {eligibleExams.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Belum Ada Ujian yang Diaktifkan di Status Test (M7)</p>
              <p className="text-amber-200/80 text-[11px] mt-1">
                Sesuai aturan spesifikasi CBT, menu Peserta Ujian hanya dapat mengelola ujian yang statusnya
                sudah diatur pada menu <strong>M7 Status Test</strong>. Silakan buka menu M7 terlebih dahulu.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligibleExams.map((exam) => {
              const isSelected = exam.ID === selectedJadwalId;
              const participantCount = pesertaUjian.filter((p) => p.IDJadwal === exam.ID).length;
              const statusRecord = statusTest.find((st) => st.IDJadwal === exam.ID);

              return (
                <button
                  key={exam.ID}
                  type="button"
                  onClick={() => {
                    setSelectedJadwalId(exam.ID);
                    setIsAddMode(false);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-teal-950/50 border-teal-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-teal-400">{exam.MataPelajaran}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        statusRecord?.Status === 'Aktif'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {statusRecord?.Status || 'Nonaktif'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-tight line-clamp-1">
                    {exam.NamaUjian}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Kelas: {exam.KelasPeserta}</span>
                    <span>{participantCount} Peserta</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedJadwalId && currentExam && (
        <>
          {/* F4: Participant Progress Monitoring Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Total Peserta Terdaftar</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  {stats.total}
                </span>
                <span className="text-xs text-slate-500">siswa</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Belum Mulai</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-300">
                  {stats.belum}
                </span>
                <span className="text-xs text-slate-500">siswa</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Sedang Mengerjakan</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                  {stats.mengerjakan}
                </span>
                <span className="text-xs text-slate-500">siswa</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-medium">Selesai Mengerjakan</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  {stats.selesai}
                </span>
                <span className="text-xs text-slate-500">siswa</span>
              </div>
            </div>
          </div>

          {/* F2: Add Participant Panel (Whole Class or Individual Selection) */}
          {isAddMode && (
            <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Pendaftaran Peserta Ujian ({currentExam.NamaUjian})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daftarkan peserta secara massal per kelas atau pilih siswa satu per satu
                  </p>
                </div>
                <button
                  onClick={() => setIsAddMode(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Tutup
                </button>
              </div>

              {/* Quick Whole-Class Add Buttons (F2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Daftarkan Seluruh Siswa Berdasarkan Kelas:
                </label>
                <div className="flex flex-wrap gap-2">
                  {classList.map((cls) => {
                    const totalInClass = siswa.filter((s) => s.Kelas === cls).length;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleAddEntireClass(cls)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-teal-950/60 text-slate-200 hover:text-teal-300 rounded-xl text-xs font-semibold border border-slate-800 hover:border-teal-500/50 transition-colors flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5 text-teal-400" />
                        <span>
                          Daftarkan Semua {cls} ({totalInClass} siswa)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Individual Student Checkbox Selection (F2) */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-300">
                    Atau Pilih Siswa Secara Individu ({candidateStudents.length} calon siswa)
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      value={candidateClass}
                      onChange={(e) => setCandidateClass(e.target.value)}
                      className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="SEMUA">Semua Kelas</option>
                      {classList.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      placeholder="Cari nama..."
                      className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/60">
                  {candidateStudents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Semua siswa sudah terdaftar pada ujian ini.
                    </div>
                  ) : (
                    candidateStudents.map((s) => {
                      const isChecked = selectedCandidateNIS.includes(s.NIS);
                      return (
                        <label
                          key={s.ID}
                          className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-900/60 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setSelectedCandidateNIS((prev) =>
                                  prev.includes(s.NIS)
                                    ? prev.filter((n) => n !== s.NIS)
                                    : [...prev, s.NIS]
                                )
                              }
                              className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-900"
                            />
                            <span className="font-mono text-teal-400">{s.NIS}</span>
                            <span className="font-medium text-white">{s.NamaSiswa}</span>
                          </div>
                          <span className="text-slate-400 font-mono">{s.Kelas}</span>
                        </label>
                      );
                    })
                  )}
                </div>

                {selectedCandidateNIS.length > 0 && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <span className="text-xs text-slate-400">
                      {selectedCandidateNIS.length} siswa dipilih
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSelectedCandidates}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-semibold shadow-md"
                    >
                      Daftarkan Terpilih
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filter Bar for Registered Participants */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchParticipant}
                onChange={(e) => setSearchParticipant(e.target.value)}
                placeholder="Cari peserta terdaftar..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterParticipantClass}
                onChange={(e) => setFilterParticipantClass(e.target.value)}
                className="py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="SEMUA">Semua Kelas Peserta</option>
                {classList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* F3 & F4: Participants Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-14 text-center">No</th>
                    <th className="py-3.5 px-4 w-28">NIS</th>
                    <th className="py-3.5 px-4">Nama Siswa</th>
                    <th className="py-3.5 px-4 w-28">Kelas</th>
                    <th className="py-3.5 px-4 w-40">Status Pengerjaan (F4)</th>
                    <th className="py-3.5 px-4 w-24 text-center">Nilai / Skor</th>
                    <th className="py-3.5 px-4 w-24 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Belum ada peserta yang terdaftar pada ujian ini. Klik &quot;Tambah Peserta Ujian&quot; di atas.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p, idx) => (
                      <tr key={p.ID} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-teal-400">
                          {p.NIS}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {p.NamaSiswa}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {p.Kelas}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              p.progressStatus === 'Selesai'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : p.progressStatus === 'Mengerjakan'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.progressStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {p.score !== undefined ? (
                            <span className="text-teal-400 text-sm">{p.score}</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveParticipant(p.relationId)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus peserta dari ujian"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Total: <strong className="text-white font-mono">{filteredParticipants.length}</strong> peserta
                terdaftar
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
