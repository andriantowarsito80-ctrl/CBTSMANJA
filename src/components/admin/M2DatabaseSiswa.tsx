/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from 'react';
import {
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  UploadCloud,
  AlertCircle,
  X,
  Check,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { DataSiswa } from '../../types';
import {
  downloadStudentTemplate,
  exportStudentsToExcel,
  generateRandomPassword,
  parseStudentsFromExcel,
} from '../../utils/excel';

interface M2DatabaseSiswaProps {
  siswa: DataSiswa[];
  onUpdateSiswa: (newSiswa: DataSiswa[]) => void;
}

export function M2DatabaseSiswa({ siswa, onUpdateSiswa }: M2DatabaseSiswaProps) {
  // Filters & Sorting
  const [searchName, setSearchName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [sortAsc, setSortAsc] = useState(true);

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password visibility map
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modals
  const [modalMode, setModalMode] = useState<'none' | 'add' | 'edit' | 'upload'>('none');
  const [editingStudent, setEditingStudent] = useState<DataSiswa | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    NIS: '',
    NamaSiswa: '',
    Kelas: '',
    Username: '',
    Password: '',
  });
  const [formError, setFormError] = useState('');

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    addedCount: number;
    duplicateNIS: string[];
    invalidCount: number;
  } | null>(null);

  // Unique list of classes
  const classList = useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      if (s.Kelas) set.add(s.Kelas);
    });
    return Array.from(set).sort();
  }, [siswa]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    let result = [...siswa];

    // Filter by name or NIS
    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      result = result.filter(
        (s) => s.NamaSiswa.toLowerCase().includes(q) || s.NIS.includes(q)
      );
    }

    // Filter by class
    if (selectedClass !== 'SEMUA') {
      result = result.filter((s) => s.Kelas === selectedClass);
    }

    // Sort by name A-Z or Z-A
    result.sort((a, b) => {
      const comp = a.NamaSiswa.localeCompare(b.NamaSiswa, 'id');
      return sortAsc ? comp : -comp;
    });

    return result;
  }, [siswa, searchName, selectedClass, sortAsc]);

  // Handlers
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

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteSelected = () => {
    const updated = siswa.filter((s) => !selectedIds.includes(s.ID));
    onUpdateSiswa(updated);
    setSelectedIds([]);
    setShowDeleteConfirm(false);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      NIS: '',
      NamaSiswa: '',
      Kelas: classList[0] || 'X-1',
      Username: '',
      Password: generateRandomPassword(6),
    });
    setFormError('');
    setModalMode('add');
  };

  const handleOpenEdit = (student: DataSiswa) => {
    setEditingStudent(student);
    setFormData({
      NIS: student.NIS,
      NamaSiswa: student.NamaSiswa,
      Kelas: student.Kelas,
      Username: student.Username,
      Password: student.Password,
    });
    setFormError('');
    setModalMode('edit');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const nis = formData.NIS.trim();
    const nama = formData.NamaSiswa.trim();
    const kelas = formData.Kelas.trim();
    const username = formData.Username.trim() || nis;
    const password = formData.Password.trim() || generateRandomPassword(6);

    if (!nis || !nama || !kelas) {
      setFormError('Semua kolom wajib diisi.');
      return;
    }

    // Check duplicate NIS
    const duplicate = siswa.find(
      (s) => s.NIS === nis && (!editingStudent || s.ID !== editingStudent.ID)
    );
    if (duplicate) {
      setFormError(`NIS ${nis} sudah terdaftar pada siswa ${duplicate.NamaSiswa}.`);
      return;
    }

    if (modalMode === 'add') {
      const newStudent: DataSiswa = {
        ID: 'SIS_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        NIS: nis,
        NamaSiswa: nama,
        Kelas: kelas,
        Username: username,
        Password: password,
        StatusLogin: 'Belum Login',
      };
      onUpdateSiswa([...siswa, newStudent]);
    } else if (editingStudent) {
      const updated = siswa.map((s) =>
        s.ID === editingStudent.ID
          ? {
              ...s,
              NIS: nis,
              NamaSiswa: nama,
              Kelas: kelas,
              Username: username,
              Password: password,
            }
          : s
      );
      onUpdateSiswa(updated);
    }

    setModalMode('none');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadResult(null);

    try {
      const existingNIS = siswa.map((s) => s.NIS);
      const res = await parseStudentsFromExcel(file, existingNIS);

      if (res.added.length > 0) {
        onUpdateSiswa([...siswa, ...(res.added as DataSiswa[])]);
      }

      setUploadResult({
        addedCount: res.added.length,
        duplicateNIS: res.duplicates,
        invalidCount: res.invalidCount,
      });
    } catch (err) {
      console.error(err);
      alert('Gagal membaca file Excel. Pastikan format file sesuai template.');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Database Siswa</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data siswa, kredensial login, dan rombongan belajar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportStudentsToExcel(siswa)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
            title="Download database siswa ke format Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={downloadStudentTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
            title="Unduh template format upload Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Unduh Template</span>
          </button>

          <button
            onClick={() => {
              setUploadResult(null);
              setModalMode('upload');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 transition-colors flex items-center gap-2"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Massal</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Nama or NIS */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Cari berdasarkan nama atau NIS siswa..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Filter Kelas */}
        <div className="sm:col-span-4 relative">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="SEMUA">Semua Kelas ({siswa.length} siswa)</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort A-Z button */}
        <div className="sm:col-span-3 flex justify-end">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
            <span>Urutkan: {sortAsc ? 'Nama A-Z' : 'Nama Z-A'}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Strip */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>
              <strong>{selectedIds.length}</strong> siswa terpilih untuk dihapus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Students Data Table */}
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
                <th className="py-3.5 px-4 w-28">Kelas</th>
                <th className="py-3.5 px-4 w-32">Username</th>
                <th className="py-3.5 px-4 w-36">Password</th>
                <th className="py-3.5 px-4 w-32">Status Login</th>
                <th className="py-3.5 px-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedIds.includes(s.ID);
                  const isPassVisible = showPasswordMap[s.ID];

                  return (
                    <tr
                      key={s.ID}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-teal-950/20' : ''
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
                      <td className="py-3 px-4 font-medium text-slate-300">
                        {s.Kelas}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {s.Username}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-white">
                            {isPassVisible ? s.Password : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(s.ID)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                            title={isPassVisible ? 'Sembunyikan' : 'Tampilkan password'}
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            s.StatusLogin === 'Sedang Login'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : s.StatusLogin === 'Terkunci'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.StatusLogin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIds([s.ID]);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hapus Siswa"
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

        {/* Table Footer info */}
        <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Menampilkan <strong className="text-white font-mono">{filteredStudents.length}</strong> dari{' '}
            <strong className="text-white font-mono">{siswa.length}</strong> siswa
          </span>
          {selectedClass !== 'SEMUA' && (
            <button
              onClick={() => setSelectedClass('SEMUA')}
              className="text-teal-400 hover:underline"
            >
              Reset Filter Kelas
            </button>
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit Siswa (F7) */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setModalMode('none')}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {modalMode === 'add' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Kredensial username dan password akan otomatis diatur untuk login CBT siswa.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Induk Siswa (NIS) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.NIS}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      NIS: val,
                      Username: formData.Username === formData.NIS ? val : formData.Username || val,
                    });
                  }}
                  placeholder="Contoh: 2425099"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.NamaSiswa}
                  onChange={(e) => setFormData({ ...formData, NamaSiswa: e.target.value })}
                  placeholder="Contoh: Muhammad Rizki"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelas / Rombel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Kelas}
                  onChange={(e) => setFormData({ ...formData, Kelas: e.target.value })}
                  placeholder="Contoh: X-1, XI IPA 1, XII IPS 2"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    value={formData.Username}
                    onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                    placeholder="Default: NIS"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, Password: generateRandomPassword(6) })
                      }
                      className="text-[10px] text-teal-400 hover:underline"
                    >
                      Acak Ulang
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    placeholder="6 karakter"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
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
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Excel Massal (F2 & F3) */}
      {modalMode === 'upload' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setModalMode('none')}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Upload Siswa Massal dari Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Setiap siswa yang diunggah akan otomatis dibuatkan akun Username (NIS) dan password acak 6 digit.
            </p>

            <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Belum punya template Excel?</span>
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Format</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                disabled={uploadLoading}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-1">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {uploadLoading ? 'Memproses File...' : 'Klik untuk Memilih File Excel'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Mendukung format .xlsx atau .csv sesuai kolom NIS, NamaSiswa, Kelas
                </span>
              </label>
            </div>

            {/* Upload Result Report */}
            {uploadResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Berhasil menambahkan {uploadResult.addedCount} siswa baru.</span>
                </div>
                {uploadResult.duplicateNIS.length > 0 && (
                  <p className="text-amber-400 text-[11px]">
                    {uploadResult.duplicateNIS.length} NIS dilewati karena sudah ada di database ({uploadResult.duplicateNIS.slice(0, 5).join(', ')}{uploadResult.duplicateNIS.length > 5 ? '...' : ''}).
                  </p>
                )}
                {uploadResult.invalidCount > 0 && (
                  <p className="text-rose-400 text-[11px]">
                    {uploadResult.invalidCount} baris kosong/tidak valid dilewati.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-5 border-t border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => setModalMode('none')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Hapus Terpilih (F8) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Konfirmasi Hapus Siswa</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{selectedIds.length}</strong> siswa yang
              dipilih? Data yang dihapus tidak dapat dipulihkan kembali.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
