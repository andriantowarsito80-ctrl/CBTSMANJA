/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pengguna {
  ID: string;
  Dibuat: string;
  Username: string;
  Password: string;
  NamaLengkap: string;
  Role: 'Admin';
}

export interface ProfilSekolah {
  ID: string;
  Dibuat: string;
  NamaSekolah: string;
  StatusAkreditasi: string;
  NPSN: string;
  NamaKepalaSekolah: string;
  TahunPelajaran: string;
}

export interface DataSiswa {
  ID: string;
  Dibuat: string;
  NIS: string;
  NamaSiswa: string;
  Kelas: string;
  Username: string;
  Password: string;
  StatusLogin: 'Belum Login' | 'Sedang Login' | 'Terkunci';
  LoginTerakhir?: string;
}

export interface DataGuru {
  ID: string;
  Dibuat: string;
  NamaGuru: string;
  MataPelajaran: string; // Comma-separated or single subject
  KelasMengajar?: string; // Comma-separated classes e.g. "X-1, X-2"
}

export interface PaketSoal {
  ID: string;
  Dibuat: string;
  JudulPaket: string;
  MataPelajaran: string;
  TargetKelas: string; // Rombel e.g. "XI-A" or "X-1"
  IDGuru?: string; // Guru Pengampu
  Deskripsi?: string;
}

export interface BankSoal {
  ID: string;
  Dibuat: string;
  IDPaket?: string; // Relasi ke PaketSoal
  MataPelajaran: string;
  MateriUjian?: string; // Topik / Pokok Bahasan Materi yang diujikan
  IDGuru?: string;
  TeksSoal: string;
  GambarSoal?: string;
  OpsiA: string;
  GambarOpsiA?: string;
  OpsiB: string;
  GambarOpsiB?: string;
  OpsiC: string;
  GambarOpsiC?: string;
  OpsiD: string;
  GambarOpsiD?: string;
  OpsiE: string;
  GambarOpsiE?: string;
  KunciJawaban: 'A' | 'B' | 'C' | 'D' | 'E';
  Bobot: number;
}

export interface JadwalUjian {
  ID: string;
  Dibuat: string;
  NamaUjian: string;
  MataPelajaran: string;
  KelasPeserta: string; // Comma-separated e.g. "X-1, X-2, XI IPA 1"
  Tanggal: string; // YYYY-MM-DD
  JamMulai: string; // HH:mm
  JamSelesai: string; // HH:mm
  DurasiMenit: number;
  JumlahSoal: number;
  AcakSoal: 'Ya' | 'Tidak';
}

export interface StatusTest {
  ID: string;
  Dibuat: string;
  IDJadwal: string;
  Status: 'Nonaktif' | 'Aktif' | 'Selesai';
  Token: string; // 6 random characters
  TokenTampil: 'Ya' | 'Tidak';
}

export interface PesertaUjian {
  ID: string;
  Dibuat: string;
  IDJadwal: string;
  NIS: string;
}

export interface SesiUjian {
  ID: string;
  Dibuat: string;
  IDJadwal: string;
  NIS: string;
  DaftarSoal: string[]; // Ordered question IDs
  Jawaban: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  RaguRagu?: Record<string, boolean>;
  WaktuMulai: string;
  WaktuSelesai?: string;
  Status: 'Mengerjakan' | 'Selesai';
  Skor?: number;
}

export type AdminMenuKey =
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M6'
  | 'M7'
  | 'M8'
  | 'M9';

export type StudentMenuKey = 'S1' | 'S2';
