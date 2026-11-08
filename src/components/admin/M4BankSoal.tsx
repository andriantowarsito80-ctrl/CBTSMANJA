/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Layers,
  GraduationCap,
  Users,
  ArrowLeft,
  AlertTriangle,
  FolderOpen,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';
import { BankSoal, DataGuru, DataSiswa, PaketSoal } from '../../types';
import {
  downloadQuestionTemplate,
  parseQuestionsFromExcel,
} from '../../utils/excel';
import {
  downloadWordQuestionTemplate,
  parseQuestionsFromWordText,
} from '../../utils/word';

interface M4BankSoalProps {
  paketSoal?: PaketSoal[];
  bankSoal: BankSoal[];
  guru: DataGuru[];
  siswa?: DataSiswa[];
  onUpdatePaketSoal?: (newPaket: PaketSoal[]) => void;
  onUpdateBankSoal: (newBankSoal: BankSoal[]) => void;
}

export function M4BankSoal({
  paketSoal = [],
  bankSoal,
  guru,
  siswa = [],
  onUpdatePaketSoal,
  onUpdateBankSoal,
}: M4BankSoalProps) {
  // Navigation: null = list of packages, string = ID of active package being inspected
  const [activePaketId, setActivePaketId] = useState<string | null>(null);

  // Filters for Packages view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('SEMUA');
  const [filterClass, setFilterClass] = useState('SEMUA');

  // Multi-selection for bulk package deletion
  const [selectedPaketIds, setSelectedPaketIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [singleDeletePaketTarget, setSingleDeletePaketTarget] = useState<PaketSoal | null>(null);

  // Modal: Buat / Edit Paket Bank Soal (matching user screenshot)
  const [paketModalMode, setPaketModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingPaket, setEditingPaket] = useState<PaketSoal | null>(null);
  const [paketFormData, setPaketFormData] = useState({
    JudulPaket: '',
    MataPelajaran: '',
    TargetKelas: '',
    IDGuru: '',
  });
  const [paketFormError, setPaketFormError] = useState('');

  // Inside-Package Questions management state
  const [questionModalMode, setQuestionModalMode] = useState<'none' | 'add' | 'edit' | 'upload'>('none');
  const [editingSoal, setEditingSoal] = useState<BankSoal | null>(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<BankSoal | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuestionInside, setSearchQuestionInside] = useState('');

  // Single Question Form State
  const [questionFormData, setQuestionFormData] = useState({
    MateriUjian: '',
    TeksSoal: '',
    GambarSoal: '',
    OpsiA: '',
    GambarOpsiA: '',
    OpsiB: '',
    GambarOpsiB: '',
    OpsiC: '',
    GambarOpsiC: '',
    OpsiD: '',
    GambarOpsiD: '',
    OpsiE: '',
    GambarOpsiE: '',
    KunciJawaban: 'A' as 'A' | 'B' | 'C' | 'D' | 'E',
    Bobot: 1,
  });
  const [questionFormError, setQuestionFormError] = useState('');

  // Upload & Import states (Excel & Word)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<'excel' | 'word'>('word');
  const [wordPastedText, setWordPastedText] = useState('');

  // Distinct subjects available in the database (from teachers and existing packages)
  const databaseSubjects = useMemo(() => {
    const set = new Set<string>();
    guru.forEach((g) => {
      if (g.MataPelajaran) {
        g.MataPelajaran.split(',').forEach((sub) => {
          const t = sub.trim();
          if (t) set.add(t);
        });
      }
    });
    // Default national curriculum subjects
    [
      'Matematika Wajib',
      'Matematika Peminatan',
      'Biologi',
      'Fisika',
      'Kimia',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Ekonomi',
      'Sosiologi',
      'Geografi',
      'Sejarah',
      'Informatika',
    ].forEach((s) => set.add(s));
    return Array.from(set).sort();
  }, [guru]);

  // Distinct classes available from DataSiswa
  const databaseClasses = useMemo(() => {
    const set = new Set<string>();
    siswa.forEach((s) => {
      if (s.Kelas && s.Kelas.trim()) set.add(s.Kelas.trim());
    });
    if (set.size === 0) {
      ['X-1', 'X-2', 'XI-A', 'XI IPA 1', 'XI IPA 2', 'XII IPA 1'].forEach((c) => set.add(c));
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [siswa]);

  // Active package object if selected
  const activePaket = useMemo(() => {
    if (!activePaketId) return null;
    return paketSoal.find((p) => p.ID === activePaketId) || null;
  }, [paketSoal, activePaketId]);

  // Questions belonging to the active package
  const activePackageQuestions = useMemo(() => {
    if (!activePaket) return [];
    return bankSoal.filter((q) => {
      // Primary match by IDPaket
      if (q.IDPaket) return q.IDPaket === activePaket.ID;
      // Fallback match by MataPelajaran if legacy question
      return q.MataPelajaran === activePaket.MataPelajaran;
    });
  }, [bankSoal, activePaket]);

  // Filtered questions inside active package
  const filteredActiveQuestions = useMemo(() => {
    if (!searchQuestionInside.trim()) return activePackageQuestions;
    const q = searchQuestionInside.toLowerCase();
    return activePackageQuestions.filter(
      (item) =>
        item.TeksSoal.toLowerCase().includes(q) ||
        (item.MateriUjian && item.MateriUjian.toLowerCase().includes(q)) ||
        item.OpsiA.toLowerCase().includes(q) ||
        item.OpsiB.toLowerCase().includes(q)
    );
  }, [activePackageQuestions, searchQuestionInside]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return paketSoal.filter((p) => {
      const matchSubject =
        filterSubject === 'SEMUA' || p.MataPelajaran.toLowerCase() === filterSubject.toLowerCase();
      const matchClass =
        filterClass === 'SEMUA' || p.TargetKelas.toLowerCase() === filterClass.toLowerCase();

      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const teacher = guru.find((g) => g.ID === p.IDGuru);
        matchSearch =
          p.JudulPaket.toLowerCase().includes(q) ||
          p.MataPelajaran.toLowerCase().includes(q) ||
          p.TargetKelas.toLowerCase().includes(q) ||
          (teacher && teacher.NamaGuru.toLowerCase().includes(q)) ||
          false;
      }

      return matchSubject && matchClass && matchSearch;
    });
  }, [paketSoal, filterSubject, filterClass, searchQuery, guru]);

  // ==========================================
  // BULK SELECTION HANDLERS
  // ==========================================
  const toggleSelectPaket = (id: string) => {
    setSelectedPaketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPakets = () => {
    if (selectedPaketIds.length === filteredPackages.length) {
      setSelectedPaketIds([]);
    } else {
      setSelectedPaketIds(filteredPackages.map((p) => p.ID));
    }
  };

  // Bulk Delete Execution
  const handleExecuteBulkDelete = () => {
    if (selectedPaketIds.length === 0) return;

    // 1. Remove selected packages
    const remainingPakets = paketSoal.filter((p) => !selectedPaketIds.includes(p.ID));
    if (onUpdatePaketSoal) {
      onUpdatePaketSoal(remainingPakets);
    }

    // 2. Remove all questions linked to those packages
    const remainingQuestions = bankSoal.filter(
      (q) => !q.IDPaket || !selectedPaketIds.includes(q.IDPaket)
    );
    onUpdateBankSoal(remainingQuestions);

    // If active packet was one of the deleted, exit detail view
    if (activePaketId && selectedPaketIds.includes(activePaketId)) {
      setActivePaketId(null);
    }

    setSelectedPaketIds([]);
    setShowBulkDeleteModal(false);
  };

  // Single Delete Execution
  const handleExecuteSingleDeletePaket = () => {
    if (!singleDeletePaketTarget) return;
    const targetId = singleDeletePaketTarget.ID;

    // Remove package
    const remainingPakets = paketSoal.filter((p) => p.ID !== targetId);
    if (onUpdatePaketSoal) {
      onUpdatePaketSoal(remainingPakets);
    }

    // Remove linked questions
    const remainingQuestions = bankSoal.filter((q) => q.IDPaket !== targetId);
    onUpdateBankSoal(remainingQuestions);

    if (activePaketId === targetId) {
      setActivePaketId(null);
    }

    setSelectedPaketIds((prev) => prev.filter((id) => id !== targetId));
    setSingleDeletePaketTarget(null);
  };

  // ==========================================
  // MODAL BUAT PAKET BANK SOAL BARU HANDLERS
  // ==========================================
  const handleOpenAddPaket = () => {
    setEditingPaket(null);
    const defaultSubject = databaseSubjects[0] || 'Matematika Wajib';
    const defaultClass = databaseClasses[0] || 'XI-A';
    const defaultGuru = guru[0]?.ID || '';

    setPaketFormData({
      JudulPaket: '',
      MataPelajaran: defaultSubject,
      TargetKelas: defaultClass,
      IDGuru: defaultGuru,
    });
    setPaketFormError('');
    setPaketModalMode('add');
  };

  const handleOpenEditPaket = (paket: PaketSoal) => {
    setEditingPaket(paket);
    setPaketFormData({
      JudulPaket: paket.JudulPaket,
      MataPelajaran: paket.MataPelajaran,
      TargetKelas: paket.TargetKelas,
      IDGuru: paket.IDGuru || '',
    });
    setPaketFormError('');
    setPaketModalMode('edit');
  };

  // When teacher is selected, automatically synchronize subject if applicable
  const handleTeacherChangeInPaketModal = (teacherId: string) => {
    const selectedTeacher = guru.find((g) => g.ID === teacherId);
    let newSubject = paketFormData.MataPelajaran;

    if (selectedTeacher && selectedTeacher.MataPelajaran) {
      const firstSub = selectedTeacher.MataPelajaran.split(',')[0].trim();
      if (firstSub) newSubject = firstSub;
    }

    setPaketFormData((prev) => ({
      ...prev,
      IDGuru: teacherId,
      MataPelajaran: newSubject,
    }));
  };

  const handleSavePaket = (e: React.FormEvent) => {
    e.preventDefault();
    setPaketFormError('');

    if (!paketFormData.JudulPaket.trim()) {
      setPaketFormError('Judul Paket Soal wajib diisi.');
      return;
    }
    if (!paketFormData.MataPelajaran.trim()) {
      setPaketFormError('Mata Pelajaran wajib dipilih.');
      return;
    }
    if (!paketFormData.TargetKelas.trim()) {
      setPaketFormError('Target Kelas wajib dipilih.');
      return;
    }

    if (paketModalMode === 'add') {
      const newPaket: PaketSoal = {
        ID: 'PKT_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        JudulPaket: paketFormData.JudulPaket.trim(),
        MataPelajaran: paketFormData.MataPelajaran.trim(),
        TargetKelas: paketFormData.TargetKelas.trim(),
        IDGuru: paketFormData.IDGuru || undefined,
      };
      const updated = [newPaket, ...paketSoal];
      if (onUpdatePaketSoal) onUpdatePaketSoal(updated);
    } else if (editingPaket) {
      const updated = paketSoal.map((p) =>
        p.ID === editingPaket.ID
          ? {
              ...p,
              JudulPaket: paketFormData.JudulPaket.trim(),
              MataPelajaran: paketFormData.MataPelajaran.trim(),
              TargetKelas: paketFormData.TargetKelas.trim(),
              IDGuru: paketFormData.IDGuru || undefined,
            }
          : p
      );
      if (onUpdatePaketSoal) onUpdatePaketSoal(updated);
    }

    setPaketModalMode('none');
  };

  // ==========================================
  // QUESTIONS INSIDE PACKAGE HANDLERS
  // ==========================================
  const handleOpenAddQuestion = () => {
    if (!activePaket) return;
    setEditingSoal(null);
    setQuestionFormData({
      MateriUjian: '',
      TeksSoal: '',
      GambarSoal: '',
      OpsiA: '',
      GambarOpsiA: '',
      OpsiB: '',
      GambarOpsiB: '',
      OpsiC: '',
      GambarOpsiC: '',
      OpsiD: '',
      GambarOpsiD: '',
      OpsiE: '',
      GambarOpsiE: '',
      KunciJawaban: 'A',
      Bobot: 1,
    });
    setQuestionFormError('');
    setQuestionModalMode('add');
  };

  const handleOpenEditQuestion = (soal: BankSoal) => {
    setEditingSoal(soal);
    setQuestionFormData({
      MateriUjian: soal.MateriUjian || '',
      TeksSoal: soal.TeksSoal,
      GambarSoal: soal.GambarSoal || '',
      OpsiA: soal.OpsiA,
      GambarOpsiA: soal.GambarOpsiA || '',
      OpsiB: soal.OpsiB,
      GambarOpsiB: soal.GambarOpsiB || '',
      OpsiC: soal.OpsiC,
      GambarOpsiC: soal.GambarOpsiC || '',
      OpsiD: soal.OpsiD,
      GambarOpsiD: soal.GambarOpsiD || '',
      OpsiE: soal.OpsiE,
      GambarOpsiE: soal.GambarOpsiE || '',
      KunciJawaban: soal.KunciJawaban,
      Bobot: soal.Bobot || 1,
    });
    setQuestionFormError('');
    setQuestionModalMode('edit');
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'GambarSoal' | 'GambarOpsiA' | 'GambarOpsiB' | 'GambarOpsiC' | 'GambarOpsiD' | 'GambarOpsiE'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setQuestionFormData((prev) => ({ ...prev, [field]: compressed }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaket) return;
    setQuestionFormError('');

    if (!questionFormData.TeksSoal.trim() && !questionFormData.GambarSoal) {
      setQuestionFormError('Soal harus memiliki teks atau gambar.');
      return;
    }
    if (!questionFormData.OpsiA.trim() || !questionFormData.OpsiB.trim()) {
      setQuestionFormError('Pilihan A dan B wajib diisi.');
      return;
    }

    const materi = questionFormData.MateriUjian.trim() || 'Umum';

    if (questionModalMode === 'add') {
      const newSoal: BankSoal = {
        ID: 'SOAL_' + Math.random().toString(36).substring(2, 9),
        Dibuat: new Date().toISOString(),
        IDPaket: activePaket.ID,
        MataPelajaran: activePaket.MataPelajaran,
        MateriUjian: materi,
        IDGuru: activePaket.IDGuru,
        TeksSoal: questionFormData.TeksSoal,
        GambarSoal: questionFormData.GambarSoal || undefined,
        OpsiA: questionFormData.OpsiA,
        GambarOpsiA: questionFormData.GambarOpsiA || undefined,
        OpsiB: questionFormData.OpsiB,
        GambarOpsiB: questionFormData.GambarOpsiB || undefined,
        OpsiC: questionFormData.OpsiC,
        GambarOpsiC: questionFormData.GambarOpsiC || undefined,
        OpsiD: questionFormData.OpsiD,
        GambarOpsiD: questionFormData.GambarOpsiD || undefined,
        OpsiE: questionFormData.OpsiE,
        GambarOpsiE: questionFormData.GambarOpsiE || undefined,
        KunciJawaban: questionFormData.KunciJawaban,
        Bobot: Number(questionFormData.Bobot) || 1,
      };
      onUpdateBankSoal([newSoal, ...bankSoal]);
    } else if (editingSoal) {
      const updated = bankSoal.map((q) =>
        q.ID === editingSoal.ID
          ? {
              ...q,
              MateriUjian: materi,
              TeksSoal: questionFormData.TeksSoal,
              GambarSoal: questionFormData.GambarSoal || undefined,
              OpsiA: questionFormData.OpsiA,
              GambarOpsiA: questionFormData.GambarOpsiA || undefined,
              OpsiB: questionFormData.OpsiB,
              GambarOpsiB: questionFormData.GambarOpsiB || undefined,
              OpsiC: questionFormData.OpsiC,
              GambarOpsiC: questionFormData.GambarOpsiC || undefined,
              OpsiD: questionFormData.OpsiD,
              GambarOpsiD: questionFormData.GambarOpsiD || undefined,
              OpsiE: questionFormData.OpsiE,
              GambarOpsiE: questionFormData.GambarOpsiE || undefined,
              KunciJawaban: questionFormData.KunciJawaban,
              Bobot: Number(questionFormData.Bobot) || 1,
            }
          : q
      );
      onUpdateBankSoal(updated);
    }

    setQuestionModalMode('none');
  };

  const handleDeleteQuestion = () => {
    if (!deleteQuestionTarget) return;
    onUpdateBankSoal(bankSoal.filter((q) => q.ID !== deleteQuestionTarget.ID));
    setDeleteQuestionTarget(null);
  };

  const handleBulkUploadExcelToPackage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePaket) return;

    setUploadLoading(true);
    setUploadMessage(null);

    try {
      const res = await parseQuestionsFromExcel(file, activePaket.MataPelajaran);
      if (res.added.length > 0) {
        // Tag all imported questions to this active package
        const taggedQuestions: BankSoal[] = res.added.map((q) => ({
          ...(q as BankSoal),
          IDPaket: activePaket.ID,
          MataPelajaran: activePaket.MataPelajaran,
          IDGuru: activePaket.IDGuru || undefined,
        }));

        onUpdateBankSoal([...taggedQuestions, ...bankSoal]);
        setUploadMessage(
          `Berhasil mengimpor ${taggedQuestions.length} butir soal ke paket "${activePaket.JudulPaket}".`
        );
      } else {
        setUploadMessage('Tidak ada butir soal yang valid ditemukan dalam file Excel.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengurai file Excel template bank soal.');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportWordText = () => {
    if (!wordPastedText.trim() || !activePaket) return;
    const { parsed } = parseQuestionsFromWordText(
      wordPastedText,
      activePaket.MataPelajaran
    );

    if (parsed.length === 0) {
      setUploadMessage(
        'Format butir soal Word tidak terdeteksi. Pastikan nomor diawali angka (misal: 1.), pilihan A s.d E, dan KUNCI: A.'
      );
      return;
    }

    const taggedQuestions: BankSoal[] = parsed.map((q) => ({
      ...(q as BankSoal),
      IDPaket: activePaket.ID,
      MataPelajaran: activePaket.MataPelajaran,
      IDGuru: activePaket.IDGuru || undefined,
    }));

    onUpdateBankSoal([...taggedQuestions, ...bankSoal]);
    setUploadMessage(
      `Berhasil mengimpor ${taggedQuestions.length} butir soal dari format Word ke paket "${activePaket.JudulPaket}".`
    );
    setWordPastedText('');
  };

  // Helper count questions per package
  const getQuestionCountForPaket = (paket: PaketSoal) => {
    return bankSoal.filter((q) => {
      if (q.IDPaket) return q.IDPaket === paket.ID;
      return q.MataPelajaran === paket.MataPelajaran;
    }).length;
  };

  // ==========================================
  // VIEW: INSIDE PACKAGE DETAIL
  // ==========================================
  if (activePaket) {
    const teacher = guru.find((g) => g.ID === activePaket.IDGuru);

    return (
      <div className="space-y-6">
        {/* Back and Breadcrumb Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActivePaketId(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Kembali ke Daftar Paket Soal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEditPaket(activePaket)}
                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Edit Info Paket</span>
              </button>
              <button
                onClick={() => setSingleDeletePaketTarget(activePaket)}
                className="px-3 py-2 text-xs font-semibold bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-800/60 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Paket Ini</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
                  Detail Paket Bank Soal
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ID: {activePaket.ID}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
                {activePaket.JudulPaket}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-teal-300">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{activePaket.MataPelajaran}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono text-cyan-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Kelas: {activePaket.TargetKelas}</span>
                </span>
                {teacher && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Guru: {teacher.NamaGuru}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  downloadWordQuestionTemplate('SMAN 1 MAJALAYA', activePaket.MataPelajaran)
                }
                className="px-3 py-2 text-xs font-semibold bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-700/60 rounded-xl flex items-center gap-1.5 transition-colors"
                title="Unduh format template penulisan soal Microsoft Word (.doc)"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Template Word (.doc)</span>
              </button>

              <button
                onClick={downloadQuestionTemplate}
                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl flex items-center gap-1.5"
                title="Unduh format template soal Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                <span>Template Excel</span>
              </button>

              <button
                onClick={() => {
                  setUploadMessage(null);
                  setWordPastedText('');
                  setImportTab('word');
                  setQuestionModalMode('upload');
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import Soal (Word / Excel)</span>
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Butir Soal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Inside Package */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuestionInside}
              onChange={(e) => setSearchQuestionInside(e.target.value)}
              placeholder="Cari pertanyaan, materi, atau pilihan di paket ini..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Total:{' '}
            <strong className="text-white font-mono font-bold">
              {activePackageQuestions.length}
            </strong>{' '}
            butir soal dalam paket ini
          </div>
        </div>

        {/* Questions List */}
        {filteredActiveQuestions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-white">Belum Ada Soal di Paket Ini</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Tambahkan butir soal baru atau import massal dari template Excel untuk mengisi paket soal{' '}
              <strong>{activePaket.JudulPaket}</strong>.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
              >
                + Tambah Butir Soal
              </button>
              <button
                onClick={() => setQuestionModalMode('upload')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Import dari Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActiveQuestions.map((soal, index) => {
              return (
                <div
                  key={soal.ID}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 font-mono text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      {soal.MateriUjian && (
                        <span className="text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
                          Materi: {soal.MateriUjian}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        Bobot: <strong className="text-white">{soal.Bobot || 1}</strong>
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded">
                        Kunci: {soal.KunciJawaban}
                      </span>
                      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                        <button
                          onClick={() => handleOpenEditQuestion(soal)}
                          className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Soal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteQuestionTarget(soal)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Teks Soal & Gambar */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
                      {soal.TeksSoal}
                    </p>

                    {soal.GambarSoal && (
                      <div className="inline-block mt-1">
                        <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1">
                          <img
                            src={soal.GambarSoal}
                            alt="Ilustrasi Soal"
                            className="max-h-56 object-contain rounded-lg cursor-pointer"
                            onClick={() => setPreviewImage(soal.GambarSoal || null)}
                          />
                          <div
                            onClick={() => setPreviewImage(soal.GambarSoal || null)}
                            className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white cursor-pointer transition-opacity"
                          >
                            Klik untuk Memperbesar
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pilihan Jawaban A s.d E */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                      const text = soal[`Opsi${opt}`];
                      const img = soal[`GambarOpsi${opt}`];
                      const isKey = soal.KunciJawaban === opt;

                      return (
                        <div
                          key={opt}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                            isKey
                              ? 'bg-emerald-950/25 border-emerald-500/50 text-emerald-200'
                              : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center shrink-0 ${
                              isKey
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {opt}
                          </span>

                          <div className="space-y-1 flex-1">
                            <p className="leading-relaxed">{text || '-'}</p>
                            {img && (
                              <img
                                src={img}
                                alt={`Opsi ${opt}`}
                                className="max-h-24 object-contain rounded border border-slate-700 cursor-pointer"
                                onClick={() => setPreviewImage(img)}
                              />
                            )}
                          </div>

                          {isKey && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Tambah / Edit Butir Soal inside Package */}
        {(questionModalMode === 'add' || questionModalMode === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 sm:p-7 shadow-2xl relative my-8">
              <button
                onClick={() => setQuestionModalMode('none')}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                {questionModalMode === 'add' ? 'Tambah Butir Soal Baru' : 'Edit Butir Soal'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Paket: <strong>{activePaket.JudulPaket}</strong> ({activePaket.MataPelajaran} - Kelas {activePaket.TargetKelas})
              </p>

              {questionFormError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                  {questionFormError}
                </div>
              )}

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Materi / Pokok Bahasan
                    </label>
                    <input
                      type="text"
                      value={questionFormData.MateriUjian}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, MateriUjian: e.target.value })
                      }
                      placeholder="Contoh: Trigonometri, Kinematika, dsb..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bobot Soal (Nilai)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={questionFormData.Bobot}
                      onChange={(e) =>
                        setQuestionFormData({
                          ...questionFormData,
                          Bobot: Number(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Teks Soal */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Teks Pertanyaan Soal *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={questionFormData.TeksSoal}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, TeksSoal: e.target.value })
                    }
                    placeholder="Ketik pertanyaan atau deskripsi soal di sini..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-600"
                  ></textarea>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer border border-slate-700 flex items-center gap-1.5 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span>{questionFormData.GambarSoal ? 'Ganti Gambar Soal' : 'Unggah Gambar Soal'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'GambarSoal')}
                        className="hidden"
                      />
                    </label>
                    {questionFormData.GambarSoal && (
                      <div className="flex items-center gap-2">
                        <img
                          src={questionFormData.GambarSoal}
                          alt="Preview"
                          className="h-9 w-9 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => setQuestionFormData({ ...questionFormData, GambarSoal: '' })}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opsi Jawaban */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Pilihan Jawaban (A s.d E) & Kunci Jawaban
                    </label>
                    <span className="text-[11px] text-teal-400">Pilih radio untuk menentukan kunci jawaban</span>
                  </div>

                  <div className="space-y-2.5">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                      const isKey = questionFormData.KunciJawaban === opt;
                      const textVal = questionFormData[`Opsi${opt}`];
                      const imgVal = questionFormData[`GambarOpsi${opt}`];

                      return (
                        <div
                          key={opt}
                          className={`p-3 rounded-xl border transition-all ${
                            isKey
                              ? 'bg-emerald-950/20 border-emerald-500/50'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer flex items-center gap-2">
                              <input
                                type="radio"
                                name="kunciJawabanInPackage"
                                checked={isKey}
                                onChange={() => setQuestionFormData({ ...questionFormData, KunciJawaban: opt })}
                                className="text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                              />
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                                  isKey
                                    ? 'bg-emerald-500 text-slate-950 font-bold'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {opt}
                              </span>
                            </label>

                            <input
                              type="text"
                              value={textVal}
                              onChange={(e) =>
                                setQuestionFormData({ ...questionFormData, [`Opsi${opt}`]: e.target.value })
                              }
                              placeholder={`Teks Pilihan ${opt}...`}
                              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />

                            <label
                              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                              title={`Unggah gambar untuk opsi ${opt}`}
                            >
                              <ImageIcon className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, `GambarOpsi${opt}`)}
                                className="hidden"
                              />
                            </label>

                            {imgVal && (
                              <div className="flex items-center gap-1">
                                <img
                                  src={imgVal}
                                  alt={`Preview Opsi ${opt}`}
                                  className="h-7 w-7 object-cover rounded border border-slate-700"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuestionFormData({ ...questionFormData, [`GambarOpsi${opt}`]: '' })
                                  }
                                  className="text-slate-500 hover:text-rose-400 text-xs px-1"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuestionModalMode('none')}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                  >
                    Simpan Butir Soal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Upload Excel to Package */}
        {questionModalMode === 'upload' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setQuestionModalMode('none')}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                Import Butir Soal ke Paket
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Paket: <strong className="text-white">{activePaket.JudulPaket}</strong> ({activePaket.MataPelajaran})
              </p>

              {/* Tab Selector: Word vs Excel */}
              <div className="flex items-center gap-2 mb-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setImportTab('word');
                    setUploadMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    importTab === 'word'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Format Word (.doc / Teks)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportTab('excel');
                    setUploadMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    importTab === 'excel'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Format Excel (.xlsx)</span>
                </button>
              </div>

              {/* TAB 1: WORD FORMAT */}
              {importTab === 'word' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">Template Dokumen Word</span>
                      <span className="text-[11px] text-slate-400">Format standar lengkap KOP & panduan penulisan</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        downloadWordQuestionTemplate('SMAN 1 MAJALAYA', activePaket.MataPelajaran)
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/60 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Template Word</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Salin (Copy-Paste) Teks Soal dari Word ke Sini:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setWordPastedText(
`1. Himpunan penyelesaian dari pertidaksamaan linear 3x - 5 <= 7 + x untuk x bilangan bulat adalah...
A. x <= 6
B. x >= 6
C. x <= -6
D. x >= -6
E. x <= 3
KUNCI: A
BOBOT: 1

2. Diketahui segitiga siku-siku ABC dengan panjang sisi siku-siku berturut-turut 6 cm dan 8 cm. Panjang sisi miring AC adalah...
A. 9 cm
B. 10 cm
C. 12 cm
D. 14 cm
E. 15 cm
KUNCI: B
BOBOT: 1`
                          );
                        }}
                        className="text-[11px] text-teal-400 hover:underline"
                      >
                        Contoh Format
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      value={wordPastedText}
                      onChange={(e) => setWordPastedText(e.target.value)}
                      placeholder="1. Teks pertanyaan...&#10;A. Pilihan A&#10;B. Pilihan B&#10;C. Pilihan C&#10;D. Pilihan D&#10;E. Pilihan E&#10;KUNCI: A&#10;BOBOT: 1"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 leading-relaxed"
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    disabled={!wordPastedText.trim()}
                    onClick={handleImportWordText}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Proses & Simpan Soal Word ke Paket</span>
                  </button>
                </div>
              )}

              {/* TAB 2: EXCEL FORMAT */}
              {importTab === 'excel' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">Template Spreadsheet Excel</span>
                      <span className="text-[11px] text-slate-400">File tabel format .xlsx</span>
                    </div>
                    <button
                      type="button"
                      onClick={downloadQuestionTemplate}
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5 bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-800/60 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Template Excel</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleBulkUploadExcelToPackage}
                      disabled={uploadLoading}
                      className="hidden"
                      id="excel-question-input"
                    />
                    <label
                      htmlFor="excel-question-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-1">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-white">
                        {uploadLoading ? 'Memproses Soal...' : 'Pilih File Excel Bank Soal (.xlsx)'}
                      </span>
                      <span className="text-[11px] text-slate-500">Mendukung file .xlsx dan .xls</span>
                    </label>
                  </div>
                </div>
              )}

              {uploadMessage && (
                <div className="mt-4 p-3 rounded-xl bg-teal-950/40 border border-teal-800/80 text-teal-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400 mt-0.5" />
                  <span>{uploadMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus Satu Soal */}
        {deleteQuestionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Hapus Butir Soal?</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Butir soal ini akan dihapus dari paket <strong>{activePaket.JudulPaket}</strong>. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteQuestionTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Image Zoom */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          >
            <div className="max-w-4xl max-h-[90vh] p-2 bg-slate-900 border border-slate-800 rounded-2xl relative">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950 text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewImage}
                alt="Zoomed"
                className="max-h-[85vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: DAFTAR PAKET BANK SOAL
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Bank Soal Ujian (Paket Soal)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar paket bank soal kurikulum sekolah, terdistribusi per mata pelajaran, target rombel, dan guru pengampu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Unduh Format Template Word */}
          <button
            onClick={() =>
              downloadWordQuestionTemplate(
                'SMAN 1 MAJALAYA',
                filterSubject !== 'SEMUA' ? filterSubject : 'Matematika Wajib'
              )
            }
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-700/60 transition-colors flex items-center gap-1.5"
            title="Unduh format template penulisan soal Microsoft Word (.doc)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Template Word (.doc)</span>
          </button>

          {/* Tombol Unduh Format Template Excel */}
          <button
            onClick={downloadQuestionTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Unduh format template soal Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>Template Excel</span>
          </button>

          {/* Tombol Aksi Hapus Seluruh Paket Terpilih */}
          {selectedPaketIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 animate-pulse"
              title="Hapus seluruh paket soal yang terpilih beserta butir soal di dalamnya"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Terpilih ({selectedPaketIds.length})</span>
            </button>
          )}

          {/* Tombol Buat Paket Bank Soal Baru (Matches User Screenshot) */}
          <button
            onClick={handleOpenAddPaket}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Paket Bank Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul paket, mata pelajaran, atau guru..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Filter Mata Pelajaran */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="SEMUA">Semua Mata Pelajaran ({paketSoal.length} Paket)</option>
              {databaseSubjects.map((sub) => {
                const count = paketSoal.filter((p) => p.MataPelajaran === sub).length;
                return (
                  <option key={sub} value={sub}>
                    {sub} ({count} Paket)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Target Kelas */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="SEMUA">Semua Kelas</option>
              {databaseClasses.map((cls) => {
                const count = paketSoal.filter((p) => p.TargetKelas === cls).length;
                return (
                  <option key={cls} value={cls}>
                    Kelas {cls} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Master Selection Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllPakets}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-medium cursor-pointer"
            >
              {filteredPackages.length > 0 &&
              selectedPaketIds.length === filteredPackages.length ? (
                <CheckSquare className="w-4 h-4 text-teal-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span>
                Pilih Semua Paket ({selectedPaketIds.length}/{filteredPackages.length} terpilih)
              </span>
            </button>
          </div>

          {selectedPaketIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-medium">
                {selectedPaketIds.length} paket siap dihapus
              </span>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(true)}
                className="text-rose-400 hover:text-rose-300 underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Seluruh Paket Terpilih</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-white">Tidak Ada Paket Bank Soal</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Belum ada paket bank soal yang sesuai dengan filter pencarian. Klik tombol di bawah untuk membuat paket baru.
          </p>
          <button
            onClick={handleOpenAddPaket}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Paket Bank Soal Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((paket) => {
            const countSoal = getQuestionCountForPaket(paket);
            const teacher = guru.find((g) => g.ID === paket.IDGuru);
            const isSelected = selectedPaketIds.includes(paket.ID);

            return (
              <div
                key={paket.ID}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all space-y-4 shadow-sm ${
                  isSelected
                    ? 'border-teal-500/80 bg-teal-950/15 ring-1 ring-teal-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top card row: Checkbox, Subject Badge, Target Class */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectPaket(paket.ID)}
                      className="p-1 -ml-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Pilih paket untuk aksi massal"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      <span className="text-[11px] font-semibold text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
                        {paket.MataPelajaran}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
                        Kelas {paket.TargetKelas}
                      </span>
                    </div>
                  </div>

                  {/* Judul Paket */}
                  <h3
                    onClick={() => setActivePaketId(paket.ID)}
                    className="text-sm font-bold text-white hover:text-teal-300 cursor-pointer transition-colors leading-snug line-clamp-2"
                    title={paket.JudulPaket}
                  >
                    {paket.JudulPaket}
                  </h3>

                  {/* Guru Pengampu */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {teacher ? teacher.NamaGuru : 'Pengampu Belum Diatur'}
                    </span>
                  </div>

                  {/* Question Count indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Jumlah Soal:</span>
                    <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                      {countSoal} Butir Soal
                    </span>
                  </div>
                </div>

                {/* Bottom Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => setActivePaketId(paket.ID)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Kelola / Lihat Soal</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPaket(paket)}
                      className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-xl transition-colors"
                      title="Edit Info Paket"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSingleDeletePaketTarget(paket)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                      title="Hapus Paket Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BUAT / EDIT PAKET BANK SOAL BARU                       */}
      {/* (EXACT REPLICA OF USER SCREENSHOT /public/assets/aistudio/image_8142cc42.png) */}
      {/* ============================================================== */}
      {(paketModalMode === 'add' || paketModalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {paketModalMode === 'add' ? 'Buat Paket Bank Soal Baru' : 'Edit Paket Bank Soal'}
              </h3>
              <button
                type="button"
                onClick={() => setPaketModalMode('none')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paketFormError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {paketFormError}
              </div>
            )}

            <form onSubmit={handleSavePaket} className="space-y-4 pt-2">
              {/* Field 1: Judul Paket Soal * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul Paket Soal *
                </label>
                <input
                  type="text"
                  required
                  value={paketFormData.JudulPaket}
                  onChange={(e) =>
                    setPaketFormData({ ...paketFormData, JudulPaket: e.target.value })
                  }
                  placeholder="Contoh: Penilaian Harian Matematika Wajib Bab 2"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Field 2: Mata Pelajaran (Pilih dari Database) * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mata Pelajaran (Pilih dari Database) *
                </label>
                <select
                  required
                  value={paketFormData.MataPelajaran}
                  onChange={(e) =>
                    setPaketFormData({ ...paketFormData, MataPelajaran: e.target.value })
                  }
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {databaseSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mata pelajaran diambil otomatis dari database pengampu kurikulum sekolah.
                </p>
              </div>

              {/* Field 3: Target Kelas & Field 4: Guru Pengampu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Target Kelas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Kelas (Pilih dari Database) *
                  </label>
                  <select
                    required
                    value={paketFormData.TargetKelas}
                    onChange={(e) =>
                      setPaketFormData({ ...paketFormData, TargetKelas: e.target.value })
                    }
                    className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {databaseClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Daftar rombel aktif sesuai database siswa.
                  </p>
                </div>

                {/* Guru Pengampu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Guru Pengampu (Pilih dari Database) *
                  </label>
                  <select
                    value={paketFormData.IDGuru}
                    onChange={(e) => handleTeacherChangeInPaketModal(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
                  >
                    <option value="">-- Pilih Guru Pengampu --</option>
                    {guru.map((g) => {
                      const subjectDisplay = g.MataPelajaran
                        ? ` (${g.MataPelajaran})`
                        : '';
                      return (
                        <option key={g.ID} value={g.ID}>
                          {g.NamaGuru}
                          {subjectDisplay}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Memilih guru otomatis menyesuaikan mata pelajarannya.
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setPaketModalMode('none')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                  {paketModalMode === 'add' ? 'Buat Paket Soal' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI HAPUS SELURUH PAKET TERPILIH (AKSI DELETE)    */}
      {/* ============================================================== */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              Hapus Seluruh Paket Soal Terpilih?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda akan menghapus secara permanen{' '}
              <strong className="text-white font-mono">{selectedPaketIds.length} paket bank soal</strong> yang dipilih.
            </p>

            <div className="my-3 p-3 rounded-xl bg-rose-950/30 border border-rose-900/60 text-rose-300 text-[11px] leading-relaxed">
              <strong>PERINGATAN:</strong> Seluruh butir soal yang berada di dalam paket-paket ini juga akan ikut terhapus dari sistem dan tidak dapat dipulihkan kembali.
            </div>

            {/* List of packages to be deleted */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 my-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
              {paketSoal
                .filter((p) => selectedPaketIds.includes(p.ID))
                .map((p) => (
                  <div
                    key={p.ID}
                    className="flex items-center justify-between text-xs text-slate-300 py-1 px-2 border-b border-slate-800/40 last:border-0"
                  >
                    <span className="font-medium truncate mr-2">{p.JudulPaket}</span>
                    <span className="font-mono text-[10px] text-teal-400 shrink-0">
                      {getQuestionCountForPaket(p)} soal
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 transition-colors"
              >
                Ya, Hapus {selectedPaketIds.length} Paket & Seluruh Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI HAPUS SATU PAKET                             */}
      {/* ============================================================== */}
      {singleDeletePaketTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Hapus Paket Bank Soal?
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Apakah Anda yakin ingin menghapus paket <strong>&quot;{singleDeletePaketTarget.JudulPaket}&quot;</strong>?
            </p>

            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/60 text-rose-300 text-[11px] mb-4">
              Semua butir soal ({getQuestionCountForPaket(singleDeletePaketTarget)} butir) yang ada di dalam paket ini akan dihapus permanen.
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSingleDeletePaketTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteSingleDeletePaket}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Ya, Hapus Paket & Soal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
