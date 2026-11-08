/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BankSoal,
  DataGuru,
  DataSiswa,
  JadwalUjian,
  PaketSoal,
  Pengguna,
  PesertaUjian,
  ProfilSekolah,
  SesiUjian,
  StatusTest,
} from '../types';

const STORAGE_KEY_PREFIX = 'cbt_sman1majalaya_';

// Initial school profile as defined in specification
export const initialProfilSekolah: ProfilSekolah = {
  ID: 'PROF_01',
  Dibuat: '2026-07-01T08:00:00Z',
  NamaSekolah: 'SMAN 1 Majalaya Kabupaten Karawang',
  StatusAkreditasi: 'Terakreditasi B',
  NPSN: '69915810',
  NamaKepalaSekolah: 'Dr. Ratih Komala, M.Pd.',
  TahunPelajaran: '2026 - 2027',
};

// Initial admin account as defined in specification
export const initialAdmin: Pengguna = {
  ID: 'USR_ADMIN_01',
  Dibuat: '2026-07-01T08:00:00Z',
  Username: 'admin',
  Password: 'admin123',
  NamaLengkap: 'Administrator CBT SMAN 1 Majalaya',
  Role: 'Admin',
};

// Initial teachers
export const initialGuru: DataGuru[] = [
  {
    ID: 'GURU_01',
    Dibuat: '2026-07-05T08:00:00Z',
    NamaGuru: 'Drs. H. Asep Hidayat, M.Pd.',
    MataPelajaran: 'Matematika Wajib, Matematika Peminatan',
    KelasMengajar: 'X-1, X-2, XI IPA 1',
  },
  {
    ID: 'GURU_02',
    Dibuat: '2026-07-05T08:30:00Z',
    NamaGuru: 'Dra. Hj. Siti Nurbaya, M.Si.',
    MataPelajaran: 'Biologi',
    KelasMengajar: 'XI IPA 1, XI IPA 2',
  },
  {
    ID: 'GURU_03',
    Dibuat: '2026-07-06T09:00:00Z',
    NamaGuru: 'Endang Suherman, S.Pd.',
    MataPelajaran: 'Bahasa Indonesia',
    KelasMengajar: 'X-1, X-2',
  },
  {
    ID: 'GURU_04',
    Dibuat: '2026-07-06T09:30:00Z',
    NamaGuru: 'Rina Marlina, M.Pd.',
    MataPelajaran: 'Fisika',
    KelasMengajar: 'XI IPA 1, XII IPA 1',
  },
  {
    ID: 'GURU_05',
    Dibuat: '2026-07-07T10:00:00Z',
    NamaGuru: 'Denny Kurniawan, M.Hum.',
    MataPelajaran: 'Bahasa Inggris',
    KelasMengajar: 'X-1, XI IPA 2, XII IPA 1',
  },
];

// Initial students
export const initialSiswa: DataSiswa[] = [
  {
    ID: 'SIS_101',
    Dibuat: '2026-07-10T08:00:00Z',
    NIS: '2425001',
    NamaSiswa: 'Aditya Pratama',
    Kelas: 'X-1',
    Username: '2425001',
    Password: 'MJA781',
    StatusLogin: 'Belum Login',
    LoginTerakhir: '2026-11-06 09:15',
  },
  {
    ID: 'SIS_102',
    Dibuat: '2026-07-10T08:05:00Z',
    NIS: '2425002',
    NamaSiswa: 'Bunga Citra Lestari',
    Kelas: 'X-1',
    Username: '2425002',
    Password: 'BNG924',
    StatusLogin: 'Belum Login',
    LoginTerakhir: '2026-11-05 14:20',
  },
  {
    ID: 'SIS_103',
    Dibuat: '2026-07-10T08:10:00Z',
    NIS: '2425003',
    NamaSiswa: 'Cahya Ramadhan',
    Kelas: 'X-1',
    Username: '2425003',
    Password: 'CHY331',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_104',
    Dibuat: '2026-07-10T08:15:00Z',
    NIS: '2425004',
    NamaSiswa: 'Dinda Kirana',
    Kelas: 'X-2',
    Username: '2425004',
    Password: 'DND452',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_105',
    Dibuat: '2026-07-10T08:20:00Z',
    NIS: '2425005',
    NamaSiswa: 'Eko Prasetyo Nugroho',
    Kelas: 'X-2',
    Username: '2425005',
    Password: 'EKO887',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_106',
    Dibuat: '2026-07-10T08:25:00Z',
    NIS: '2324011',
    NamaSiswa: 'Fadhil Muhammad',
    Kelas: 'XI IPA 1',
    Username: '2324011',
    Password: 'FDH561',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_107',
    Dibuat: '2026-07-10T08:30:00Z',
    NIS: '2324012',
    NamaSiswa: 'Gita Gutawa Putri',
    Kelas: 'XI IPA 1',
    Username: '2324012',
    Password: 'GIT902',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_108',
    Dibuat: '2026-07-10T08:35:00Z',
    NIS: '2324021',
    NamaSiswa: 'Hendra Setiawan',
    Kelas: 'XI IPA 2',
    Username: '2324021',
    Password: 'HND314',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_109',
    Dibuat: '2026-07-10T08:40:00Z',
    NIS: '2324022',
    NamaSiswa: 'Intan Nuraini',
    Kelas: 'XI IPA 2',
    Username: '2324022',
    Password: 'NTN773',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_110',
    Dibuat: '2026-07-10T08:45:00Z',
    NIS: '2223001',
    NamaSiswa: 'Joko Wicaksono',
    Kelas: 'XII IPA 1',
    Username: '2223001',
    Password: 'JKW629',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_111',
    Dibuat: '2026-07-10T08:50:00Z',
    NIS: '2223002',
    NamaSiswa: 'Kania Dewi Anggraini',
    Kelas: 'XII IPA 1',
    Username: '2223002',
    Password: 'KND192',
    StatusLogin: 'Belum Login',
  },
  {
    ID: 'SIS_112',
    Dibuat: '2026-07-10T08:55:00Z',
    NIS: '2223003',
    NamaSiswa: 'Lutfi Hakim',
    Kelas: 'XII IPA 1',
    Username: '2223003',
    Password: 'LTF804',
    StatusLogin: 'Belum Login',
  },
];

// Mathematical triangle formula SVG data URI for demoing image questions
const sampleMathDiagramSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180" fill="none"><rect width="300" height="180" fill="%23f8fafc" rx="8"/><path d="M 50 140 L 250 140 L 50 40 Z" stroke="%230284c7" stroke-width="3" fill="%23e0f2fe"/><rect x="50" y="125" width="15" height="15" stroke="%230284c7" stroke-width="2" fill="none"/><text x="40" y="90" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230f172a">a = 6 cm</text><text x="140" y="160" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230f172a">b = 8 cm</text><text x="160" y="80" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230284c7">c = ?</text></svg>`;

export const initialPaketSoal: PaketSoal[] = [
  {
    ID: 'PKT_01',
    Dibuat: '2026-10-01T08:00:00Z',
    JudulPaket: 'Penilaian Harian Matematika Wajib Bab 2',
    MataPelajaran: 'Matematika Wajib',
    TargetKelas: 'XI-A',
    IDGuru: 'GURU_01',
    Deskripsi: 'Paket bank soal asesmen materi trigonometri, geometri, dan pertidaksamaan linear.',
  },
  {
    ID: 'PKT_02',
    Dibuat: '2026-10-02T09:00:00Z',
    JudulPaket: 'Sumatif Biologi Sel dan Genetika',
    MataPelajaran: 'Biologi',
    TargetKelas: 'XI IPA 1',
    IDGuru: 'GURU_02',
    Deskripsi: 'Struktur sel, pembelahan meiosis, dan organel penghasil ATP.',
  },
  {
    ID: 'PKT_03',
    Dibuat: '2026-10-03T10:00:00Z',
    JudulPaket: 'Penilaian Harian Dinamika Gerak Fisika',
    MataPelajaran: 'Fisika',
    TargetKelas: 'XII IPA 1',
    IDGuru: 'GURU_04',
    Deskripsi: 'Hukum II Newton, gaya gesek, dan percepatan benda.',
  },
  {
    ID: 'PKT_04',
    Dibuat: '2026-10-04T11:00:00Z',
    JudulPaket: 'Asesmen Tata Bahasa & Konjungsi Bahasa Indonesia',
    MataPelajaran: 'Bahasa Indonesia',
    TargetKelas: 'X-1',
    IDGuru: 'GURU_03',
    Deskripsi: 'Analisis kalimat efektif, konjungsi kausalitas, dan struktur teks.',
  },
];

export const initialBankSoal: BankSoal[] = [
  {
    ID: 'SOAL_001',
    IDPaket: 'PKT_01',
    Dibuat: '2026-10-01T08:00:00Z',
    MataPelajaran: 'Matematika Wajib',
    MateriUjian: 'Trigonometri & Geometri',
    IDGuru: 'GURU_01',
    TeksSoal: 'Perhatikan gambar segitiga siku-siku di bawah ini. Tentukan panjang sisi miring (hipotenusa) c jika panjang sisi siku-siku berturut-turut adalah 6 cm dan 8 cm!',
    GambarSoal: sampleMathDiagramSVG,
    OpsiA: '9 cm',
    OpsiB: '10 cm',
    OpsiC: '12 cm',
    OpsiD: '14 cm',
    OpsiE: '15 cm',
    KunciJawaban: 'B',
    Bobot: 1,
  },
  {
    ID: 'SOAL_002',
    IDPaket: 'PKT_01',
    Dibuat: '2026-10-01T08:15:00Z',
    MataPelajaran: 'Matematika Wajib',
    MateriUjian: 'Persamaan & Pertidaksamaan Linear',
    IDGuru: 'GURU_01',
    TeksSoal: 'Himpunan penyelesaian dari pertidaksamaan linear 3x - 5 ≤ 7 + x untuk x bilangan bulat adalah...',
    OpsiA: 'x ≤ 6',
    OpsiB: 'x ≥ 6',
    OpsiC: 'x ≤ -6',
    OpsiD: 'x ≥ -6',
    OpsiE: 'x ≤ 3',
    KunciJawaban: 'A',
    Bobot: 1,
  },
  {
    ID: 'SOAL_003',
    IDPaket: 'PKT_01',
    Dibuat: '2026-10-01T08:30:00Z',
    MataPelajaran: 'Matematika Wajib',
    MateriUjian: 'Relasi & Fungsi Kuadrat',
    IDGuru: 'GURU_01',
    TeksSoal: 'Jika f(x) = 2x² - 3x + 5, maka nilai dari f(-2) adalah...',
    OpsiA: '15',
    OpsiB: '17',
    OpsiC: '19',
    OpsiD: '21',
    OpsiE: '23',
    KunciJawaban: 'C',
    Bobot: 1,
  },
  {
    ID: 'SOAL_004',
    Dibuat: '2026-10-01T08:45:00Z',
    MataPelajaran: 'Matematika Wajib',
    MateriUjian: 'Barisan & Deret Aritmetika',
    IDGuru: 'GURU_01',
    TeksSoal: 'Diketahui deret aritmetika dengan suku pertama a = 4 dan beda b = 3. Suku ke-10 (U10) dari deret tersebut adalah...',
    OpsiA: '28',
    OpsiB: '30',
    OpsiC: '31',
    OpsiD: '34',
    OpsiE: '37',
    KunciJawaban: 'C',
    Bobot: 1,
  },
  {
    ID: 'SOAL_005',
    Dibuat: '2026-10-01T09:00:00Z',
    MataPelajaran: 'Matematika Wajib',
    MateriUjian: 'Eksponen & Logaritma',
    IDGuru: 'GURU_01',
    TeksSoal: 'Nilai dari logaritma ²log 16 + ³log 27 - ⁵log 25 adalah...',
    OpsiA: '3',
    OpsiB: '4',
    OpsiC: '5',
    OpsiD: '6',
    OpsiE: '7',
    KunciJawaban: 'C',
    Bobot: 1,
  },
  {
    ID: 'SOAL_006',
    Dibuat: '2026-10-02T10:00:00Z',
    MataPelajaran: 'Biologi',
    MateriUjian: 'Struktur & Organel Sel',
    IDGuru: 'GURU_02',
    TeksSoal: 'Organel sel yang dijuluki sebagai "the powerhouse of cell" karena bertindak sebagai tempat utama pembentukan energi (ATP) melalui respirasi seluler adalah...',
    OpsiA: 'Kloroplas',
    OpsiB: 'Mitokondria',
    OpsiC: 'Ribosom',
    OpsiD: 'Badan Golgi',
    OpsiE: 'Vakuola',
    KunciJawaban: 'B',
    Bobot: 1,
  },
  {
    ID: 'SOAL_007',
    Dibuat: '2026-10-02T10:15:00Z',
    MataPelajaran: 'Biologi',
    MateriUjian: 'Pembelahan Sel & Genetika',
    IDGuru: 'GURU_02',
    TeksSoal: 'Proses pembelahan sel yang menghasilkan empat sel anakan dengan jumlah kromosom haploid (n) disebut...',
    OpsiA: 'Mitosis',
    OpsiB: 'Amitosis',
    OpsiC: 'Meiosis',
    OpsiD: 'Sitokinesis',
    OpsiE: 'Interfase',
    KunciJawaban: 'C',
    Bobot: 1,
  },
  {
    ID: 'SOAL_008',
    Dibuat: '2026-10-03T11:00:00Z',
    MataPelajaran: 'Bahasa Indonesia',
    MateriUjian: 'Tata Bahasa & Konjungsi',
    IDGuru: 'GURU_03',
    TeksSoal: 'Kalimat berikut yang menggunakan konjungsi kausalitas secara tepat adalah...',
    OpsiA: 'Hujan deras mengguyur kota, namun jalanan tetap kering.',
    OpsiB: 'Ia tidak hadir dalam rapat karena sedang mendampingi orang tuanya di rumah sakit.',
    OpsiC: 'Andi menyukai membaca buku serta ia rajin menulis cerpen.',
    OpsiD: 'Meskipun hari sudah larut, tetapi pekerjaan rumahnya belum selesai.',
    OpsiE: 'Kami beristirahat sejenak agar melanjutkan perjalanan.',
    KunciJawaban: 'B',
    Bobot: 1,
  },
  {
    ID: 'SOAL_009',
    Dibuat: '2026-10-03T11:20:00Z',
    MataPelajaran: 'Fisika',
    MateriUjian: 'Hukum Gerak Newton',
    IDGuru: 'GURU_04',
    TeksSoal: 'Sebuah benda bermassa 2 kg didorong dengan gaya konstan 10 N pada lantai licin tanpa gesekan. Percepatan gerak benda tersebut adalah...',
    OpsiA: '2 m/s²',
    OpsiB: '5 m/s²',
    OpsiC: '8 m/s²',
    OpsiD: '12 m/s²',
    OpsiE: '20 m/s²',
    KunciJawaban: 'B',
    Bobot: 1,
  },
];

export const initialJadwal: JadwalUjian[] = [
  {
    ID: 'JADWAL_01',
    Dibuat: '2026-10-15T08:00:00Z',
    NamaUjian: 'Penilaian Sumatif Tengah Semester (PSTS) Matematika Wajib',
    MataPelajaran: 'Matematika Wajib',
    KelasPeserta: 'X-1, X-2',
    Tanggal: new Date().toISOString().slice(0, 10), // Today
    JamMulai: '07:30',
    JamSelesai: '16:00',
    DurasiMenit: 60,
    JumlahSoal: 5,
    AcakSoal: 'Ya',
  },
  {
    ID: 'JADWAL_02',
    Dibuat: '2026-10-16T08:00:00Z',
    NamaUjian: 'Asesmen Sumatif Harian Biologi Sel',
    MataPelajaran: 'Biologi',
    KelasPeserta: 'XI IPA 1, XI IPA 2',
    Tanggal: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow
    JamMulai: '08:00',
    JamSelesai: '09:30',
    DurasiMenit: 90,
    JumlahSoal: 2,
    AcakSoal: 'Ya',
  },
];

export const initialStatusTest: StatusTest[] = [
  {
    ID: 'STAT_01',
    Dibuat: '2026-10-15T08:30:00Z',
    IDJadwal: 'JADWAL_01',
    Status: 'Aktif',
    Token: 'MJA26X',
    TokenTampil: 'Ya',
  },
  {
    ID: 'STAT_02',
    Dibuat: '2026-10-16T08:30:00Z',
    IDJadwal: 'JADWAL_02',
    Status: 'Nonaktif',
    Token: 'BIO88K',
    TokenTampil: 'Tidak',
  },
];

export const initialPesertaUjian: PesertaUjian[] = [
  // Participants for JADWAL_01 (Class X-1 & X-2)
  { ID: 'PES_01', Dibuat: '2026-10-15T09:00:00Z', IDJadwal: 'JADWAL_01', NIS: '2425001' },
  { ID: 'PES_02', Dibuat: '2026-10-15T09:00:00Z', IDJadwal: 'JADWAL_01', NIS: '2425002' },
  { ID: 'PES_03', Dibuat: '2026-10-15T09:00:00Z', IDJadwal: 'JADWAL_01', NIS: '2425003' },
  { ID: 'PES_04', Dibuat: '2026-10-15T09:00:00Z', IDJadwal: 'JADWAL_01', NIS: '2425004' },
  { ID: 'PES_05', Dibuat: '2026-10-15T09:00:00Z', IDJadwal: 'JADWAL_01', NIS: '2425005' },

  // Participants for JADWAL_02 (Class XI IPA 1 & 2)
  { ID: 'PES_06', Dibuat: '2026-10-16T09:00:00Z', IDJadwal: 'JADWAL_02', NIS: '2324011' },
  { ID: 'PES_07', Dibuat: '2026-10-16T09:00:00Z', IDJadwal: 'JADWAL_02', NIS: '2324012' },
  { ID: 'PES_08', Dibuat: '2026-10-16T09:00:00Z', IDJadwal: 'JADWAL_02', NIS: '2324021' },
];

export const initialSesiUjian: SesiUjian[] = [
  {
    ID: 'SESI_01',
    Dibuat: '2026-10-15T10:00:00Z',
    IDJadwal: 'JADWAL_01',
    NIS: '2425002',
    DaftarSoal: ['SOAL_001', 'SOAL_002', 'SOAL_003', 'SOAL_004', 'SOAL_005'],
    Jawaban: {
      SOAL_001: 'B',
      SOAL_002: 'A',
      SOAL_003: 'C',
      SOAL_004: 'C',
      SOAL_005: 'C',
    },
    WaktuMulai: '2026-10-15T10:00:00Z',
    WaktuSelesai: '2026-10-15T10:45:00Z',
    Status: 'Selesai',
    Skor: 100,
  },
];

// Helper to get or set items
function getOrInit<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!item) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Storage API
export const StorageManager = {
  getAdmin: (): Pengguna => getOrInit('admin', initialAdmin),
  saveAdmin: (data: Pengguna) => save('admin', data),

  getProfilSekolah: (): ProfilSekolah => getOrInit('profil_sekolah', initialProfilSekolah),
  saveProfilSekolah: (data: ProfilSekolah) => save('profil_sekolah', data),

  getSiswa: (): DataSiswa[] => getOrInit('data_siswa', initialSiswa),
  saveSiswa: (data: DataSiswa[]) => save('data_siswa', data),

  getGuru: (): DataGuru[] => getOrInit('data_guru', initialGuru),
  saveGuru: (data: DataGuru[]) => save('data_guru', data),

  getBankSoal: (): BankSoal[] => getOrInit('bank_soal', initialBankSoal),
  saveBankSoal: (data: BankSoal[]) => save('bank_soal', data),

  getPaketSoal: (): PaketSoal[] => getOrInit('paket_soal', initialPaketSoal),
  savePaketSoal: (data: PaketSoal[]) => save('paket_soal', data),

  getJadwal: (): JadwalUjian[] => getOrInit('jadwal_ujian', initialJadwal),
  saveJadwal: (data: JadwalUjian[]) => save('jadwal_ujian', data),

  getStatusTest: (): StatusTest[] => getOrInit('status_test', initialStatusTest),
  saveStatusTest: (data: StatusTest[]) => save('status_test', data),

  getPesertaUjian: (): PesertaUjian[] => getOrInit('peserta_ujian', initialPesertaUjian),
  savePesertaUjian: (data: PesertaUjian[]) => save('peserta_ujian', data),

  getSesiUjian: (): SesiUjian[] => getOrInit('sesi_ujian', initialSesiUjian),
  saveSesiUjian: (data: SesiUjian[]) => save('sesi_ujian', data),

  // Reset all to defaults if desired
  resetAll: () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'admin');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'profil_sekolah');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'data_siswa');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'data_guru');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'bank_soal');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'jadwal_ujian');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'status_test');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'peserta_ujian');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'sesi_ujian');
  },
};
