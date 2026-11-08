/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  GraduationCap,
  Check,
  Filter,
  AlertCircle,
  ChevronDown,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react';
import { DataGuru, DataSiswa } from '../../types';

interface M3DatabaseGuruProps {
  guru: DataGuru[];
  siswa?: DataSiswa[];
  onUpdateGuru: (newGuru: DataGuru[]) => void;
}

const DEFAULT_SUBJECTS = [
  'Matematika Wajib',
  'Matematika Peminatan',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Biologi',
  'Fisika',
  'Kimia',
  'Ekonomi',
  'Sosiologi',
  'Geografi',
  'Sejarah',
  'Pendidikan Agama & Budi Pekerti',
  'PPKn',
  'PJOK',
  'Seni Budaya',
  'Informatika',
];

export function M3DatabaseGuru({ guru, siswa = [], onUpdateGuru }: M3DatabaseGuruProps) {
  // Filter states
  const [filterNama, setFilterNama] = useState('');
  const [filterMapel, setFilterMapel] = useState('SEMUA');

  // Modal states
  const [modalMode, setModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingGuru, setEditingGuru] = useState<DataGuru | null>(null);

  // Form states
  const [namaGuru, setNamaGuru] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Multi-select dropdown state for "Mengajar di Kelas"
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [classDropdownSearch, setClassDropdownSearch] = useState('');
  const classDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        classDropdownRef.current &&
        !classDropdownRef.current.contains(event.target as Node)
      ) {
        setIsClassDropdownOpen(false);
      }
    }
    if (isClassDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClassDropdownOpen]);

  const [deleteTarget, setDeleteTarget] = useState<DataGuru | null>(null);

  // Available school classes derived strictly from DataSiswa (student database uploaded)
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      const cls = s.Kelas ? s.Kelas.trim() : '';
      if (cls) set.add(cls);
    });
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [siswa]);

  // Unique list of subjects currently taught by teachers in the database (for filter dropdown)
  const distinctTeacherSubjects = useMemo(() => {
    const set = new Set<string>();
    guru.forEach((g) => {
      if (g.MataPelajaran) {
        g.MataPelajaran.split(',').forEach((sub) => {
          const trimmed = sub.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort();
  }, [guru]);

  // Filtered teachers by Nama and Mata Pelajaran
  const filteredGuru = useMemo(() => {
    return guru.filter((g) => {
      // Filter by Nama
      const matchNama = filterNama.trim()
        ? g.NamaGuru.toLowerCase().includes(filterNama.trim().toLowerCase())
        : true;

      // Filter by Mata Pelajaran
      let matchMapel = true;
      if (filterMapel !== 'SEMUA') {
        const teacherSubjects = g.MataPelajaran
          ? g.MataPelajaran.split(',').map((s) => s.trim().toLowerCase())
          : [];
        matchMapel = teacherSubjects.includes(filterMapel.toLowerCase());
      }

      return matchNama && matchMapel;
    });
  }, [guru, filterNama, filterMapel]);

  // Filtered available classes inside the modal dropdown search
  const filteredAvailableClasses = useMemo(() => {
    if (!classDropdownSearch.trim()) return availableClasses;
    const q = classDropdownSearch.toLowerCase();
    return availableClasses.filter((c) => c.toLowerCase().includes(q));
  }, [availableClasses, classDropdownSearch]);

  const handleOpenAdd = () => {
    setEditingGuru(null);
    setNamaGuru('');
    setSelectedSubjects([]);
    setCustomSubject('');
    setSelectedClasses([]);
    setIsClassDropdownOpen(false);
    setClassDropdownSearch('');
    setFormError('');
    setModalMode('add');
  };

  const handleOpenEdit = (teacher: DataGuru) => {
    setEditingGuru(teacher);
    setNamaGuru(teacher.NamaGuru);

    // Parse comma-separated subjects
    const subjects = teacher.MataPelajaran
      ? teacher.MataPelajaran.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    setSelectedSubjects(subjects);

    // Parse comma-separated classes taught
    const classes = teacher.KelasMengajar
      ? teacher.KelasMengajar.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    setSelectedClasses(classes);

    setCustomSubject('');
    setIsClassDropdownOpen(false);
    setClassDropdownSearch('');
    setFormError('');
    setModalMode('edit');
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects([...selectedSubjects, trimmed]);
    }
    setCustomSubject('');
  };

  // Multi-select class handlers
  const toggleSelectClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSelectAllClasses = () => {
    setSelectedClasses([...availableClasses]);
  };

  const handleClearAllClasses = () => {
    setSelectedClasses([]);
  };

  const handleRemoveClass = (cls: string) => {
    setSelectedClasses(selectedClasses.filter((c) => c !== cls));
  };

  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const nama = namaGuru.trim();
    if (!nama) {
      setFormError('Nama Guru wajib diisi.');
      return;
    }

    if (selectedSubjects.length === 0) {
      setFormError('Pilih minimal satu mata pelajaran yang diampu.');
      return;
    }

    const mapelStr = selectedSubjects.join(', ');
    const kelasStr = selectedClasses.length > 0 ? selectedClasses.join(', ') : undefined;

    if (modalMode === 'add') {
      const newG: DataGuru = {
        ID: 'GURU_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        NamaGuru: nama,
        MataPelajaran: mapelStr,
        KelasMengajar: kelasStr,
      };
      onUpdateGuru([...guru, newG]);
    } else if (editingGuru) {
      const updated = guru.map((g) =>
        g.ID === editingGuru.ID
          ? {
              ...g,
              NamaGuru: nama,
              MataPelajaran: mapelStr,
              KelasMengajar: kelasStr,
            }
          : g
      );
      onUpdateGuru(updated);
    }

    setModalMode('none');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onUpdateGuru(guru.filter((g) => g.ID !== deleteTarget.ID));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Database Guru Pengampu</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar tenaga pendidik, mata pelajaran yang diampu, serta rombel kelas mengajar sesuai Database Siswa
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Guru</span>
        </button>
      </div>

      {/* Filter Bar: Filter Nama & Filter Mata Pelajaran */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Filter Nama */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filterNama}
            onChange={(e) => setFilterNama(e.target.value)}
            placeholder="Cari atau filter nama guru..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          {filterNama && (
            <button
              onClick={() => setFilterNama('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              title="Hapus pencarian nama"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Mata Pelajaran (Dropdown) */}
        <div className="sm:col-span-6 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="SEMUA">Semua Mata Pelajaran ({guru.length} guru)</option>
            {distinctTeacherSubjects.map((sub) => {
              const count = guru.filter((g) =>
                g.MataPelajaran?.toLowerCase().includes(sub.toLowerCase())
              ).length;
              return (
                <option key={sub} value={sub}>
                  {sub} ({count} guru)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Guru Table with Kelas Mengajar Column */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-14 text-center">No</th>
                <th className="py-3.5 px-4 w-60">Nama Guru</th>
                <th className="py-3.5 px-4 w-72">Mata Pelajaran yang Diampu</th>
                <th className="py-3.5 px-4">Mengajar di Kelas</th>
                <th className="py-3.5 px-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredGuru.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data guru yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredGuru.map((g, idx) => {
                  const subjectList = g.MataPelajaran
                    ? g.MataPelajaran.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];
                  const classList = g.KelasMengajar
                    ? g.KelasMengajar.split(',').map((c) => c.trim()).filter(Boolean)
                    : [];

                  return (
                    <tr key={g.ID} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span>{g.NamaGuru}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {subjectList.map((sub, i) => (
                            <span
                              key={i}
                              className="inline-block bg-slate-950 text-teal-300 px-2 py-0.5 rounded text-[11px] border border-slate-800"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {classList.length === 0 ? (
                          <span className="text-slate-500 italic text-[11px]">- Belum diatur -</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {classList.map((cls, i) => (
                              <span
                                key={i}
                                className="inline-block bg-teal-950/40 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono border border-teal-800/60"
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Guru"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(g)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus Guru"
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
        <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Menampilkan <strong className="text-white font-mono">{filteredGuru.length}</strong> dari{' '}
            <strong className="text-white font-mono">{guru.length}</strong> guru terdata
          </span>
          {(filterNama || filterMapel !== 'SEMUA') && (
            <button
              onClick={() => {
                setFilterNama('');
                setFilterMapel('SEMUA');
              }}
              className="text-teal-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit Guru (dengan Dropdown Mengajar di Kelas dari Database Siswa) */}
      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setModalMode('none')}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {modalMode === 'add' ? 'Tambah Data Guru Pengampu' : 'Edit Data Guru Pengampu'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Kelola nama lengkap, mata pelajaran yang diampu, serta kelas mengajar yang diselaraskan dengan Database Siswa.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGuru} className="space-y-4">
              {/* Nama Guru */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Guru Beserta Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  placeholder="Contoh: Drs. H. Asep Hidayat, M.Pd."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Mengajar di Kelas (Multi-Select Dropdown dinamis dari DataSiswa) */}
              <div className="space-y-2 pt-1 border-t border-slate-800" ref={classDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mengajar di Kelas (Multi-Pilih Dropdown)
                  </label>
                  <span className="text-[11px] text-teal-400 font-mono">
                    {availableClasses.length} kelas terdaftar di DataSiswa
                  </span>
                </div>

                {availableClasses.length === 0 ? (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Belum Ada Kelas di Database Siswa</p>
                      <p className="text-amber-200/80 text-[11px] mt-0.5 leading-relaxed">
                        Pilihan kelas otomatis disesuaikan dari data rombel pada <strong>M2 Database Siswa</strong>. Silakan upload file Excel atau tambahkan siswa di M2 terlebih dahulu agar daftar kelas muncul di sini.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Multi-Select Dropdown Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                      className={`w-full py-2.5 px-3.5 bg-slate-950 border rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isClassDropdownOpen
                          ? 'border-teal-500 ring-1 ring-teal-500 text-white shadow-lg shadow-teal-500/10'
                          : 'border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <Layers className="w-4 h-4 text-teal-400 shrink-0" />
                        {selectedClasses.length === 0 ? (
                          <span className="text-slate-500">
                            -- Klik untuk Memilih Kelas Mengajar (Multi-Pilih) --
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-teal-300 font-mono">
                              {selectedClasses.length} Kelas Dipilih:
                            </span>
                            <span className="text-slate-300 truncate font-mono text-[11px]">
                              {selectedClasses.slice(0, 3).join(', ')}
                              {selectedClasses.length > 3 ? ` (+${selectedClasses.length - 3} lainnya)` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {selectedClasses.length > 0 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearAllClasses();
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-900/60 cursor-pointer"
                            title="Hapus semua kelas terpilih"
                          >
                            Reset
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isClassDropdownOpen ? 'rotate-180 text-teal-400' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Multi-Select Dropdown Popover Panel */}
                    {isClassDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-30 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
                        {/* Search and Quick Action Buttons */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              type="text"
                              value={classDropdownSearch}
                              onChange={(e) => setClassDropdownSearch(e.target.value)}
                              placeholder="Cari kelas (misal: X-1, XI IPA)..."
                              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              autoFocus
                            />
                            {classDropdownSearch && (
                              <button
                                type="button"
                                onClick={() => setClassDropdownSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleSelectAllClasses}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 whitespace-nowrap transition-colors"
                          >
                            Pilih Semua
                          </button>

                          <button
                            type="button"
                            onClick={handleClearAllClasses}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 whitespace-nowrap transition-colors"
                          >
                            Hapus
                          </button>
                        </div>

                        {/* Dropdown Options List */}
                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-800/40">
                          {filteredAvailableClasses.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-500">
                              Tidak ada kelas yang cocok dengan &quot;{classDropdownSearch}&quot;
                            </div>
                          ) : (
                            filteredAvailableClasses.map((cls) => {
                              const isChecked = selectedClasses.includes(cls);
                              const studentCount = siswa.filter((s) => s.Kelas === cls).length;

                              return (
                                <div
                                  key={cls}
                                  onClick={() => toggleSelectClass(cls)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                    isChecked
                                      ? 'bg-teal-950/40 text-white font-medium border border-teal-800/60'
                                      : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {isChecked ? (
                                      <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                    )}
                                    <span className="font-mono font-semibold">Kelas {cls}</span>
                                  </div>

                                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                    {studentCount} siswa
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Dropdown Footer */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            <strong className="text-white font-mono">{selectedClasses.length}</strong> dari{' '}
                            <strong className="text-white font-mono">{availableClasses.length}</strong> kelas dipilih
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsClassDropdownOpen(false)}
                            className="text-teal-400 font-semibold hover:underline"
                          >
                            Tutup / Selesai
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Selected Badges / Chips Display */}
                    <div className="mt-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl min-h-[42px] flex flex-wrap items-center gap-1.5">
                      {selectedClasses.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">
                          Belum ada kelas yang dipilih. Silakan klik dropdown di atas untuk memilih rombel kelas mengajar guru ini.
                        </span>
                      ) : (
                        selectedClasses.map((cls) => {
                          const count = siswa.filter((s) => s.Kelas === cls).length;
                          return (
                            <span
                              key={cls}
                              className="inline-flex items-center gap-1.5 bg-teal-950/60 text-teal-300 border border-teal-800/80 px-2.5 py-1 rounded-lg text-xs font-mono"
                            >
                              <span>{cls}</span>
                              {count > 0 && (
                                <span className="text-[10px] text-teal-400/80 font-sans">
                                  ({count} siswa)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveClass(cls)}
                                className="hover:text-rose-400 font-bold ml-0.5"
                                title="Hapus kelas ini"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mata Pelajaran yang Diampu (Multi-Pilih) */}
              <div className="pt-1 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Mata Pelajaran yang Diampu (Multi-Pilih) *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {DEFAULT_SUBJECTS.map((sub) => {
                    const isChecked = selectedSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                          isChecked
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span className="truncate">{sub}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add custom subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Atau Tambah Mata Pelajaran Lainnya
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Contoh: Bahasa Sunda, Muatan Lokal..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Currently Selected Subjects Badges */}
              {selectedSubjects.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1">Mapel Terpilih:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 bg-teal-950/60 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded text-xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => toggleSubject(sub)}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
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
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                >
                  Simpan Data Guru
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
            <h3 className="text-base font-bold text-white mb-1">Konfirmasi Hapus Guru</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pengampu <strong>{deleteTarget.NamaGuru}</strong>?
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
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
