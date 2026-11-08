/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { BankSoal, DataSiswa } from '../types';

export function generateRandomPassword(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomToken(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Downloads student template excel with columns: NIS, NamaSiswa, Kelas
 */
export function downloadStudentTemplate() {
  const sampleData = [
    { NIS: '2425001', NamaSiswa: 'Ahmad Fauzi', Kelas: 'X-1' },
    { NIS: '2425002', NamaSiswa: 'Bunga Citra Lestari', Kelas: 'X-1' },
    { NIS: '2425003', NamaSiswa: 'Cahya Ramadhan', Kelas: 'X-2' },
    { NIS: '2425004', NamaSiswa: 'Dewi Sartika', Kelas: 'XI IPA 1' },
    { NIS: '2425005', NamaSiswa: 'Eko Prasetyo', Kelas: 'XII IPA 1' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Siswa');

  // Trigger download
  XLSX.writeFile(workbook, 'Template_Upload_Siswa_SMAN1Majalaya.xlsx');
}

/**
 * Exports current student database to Excel
 */
export function exportStudentsToExcel(students: DataSiswa[]) {
  const exportData = students.map((s, index) => ({
    No: index + 1,
    NIS: s.NIS,
    NamaSiswa: s.NamaSiswa,
    Kelas: s.Kelas,
    Username: s.Username,
    Password: s.Password,
    StatusLogin: s.StatusLogin,
    LoginTerakhir: s.LoginTerakhir || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');
  XLSX.writeFile(workbook, `Database_Siswa_SMAN1Majalaya_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Parses uploaded Excel file for student imports
 */
export async function parseStudentsFromExcel(
  file: File,
  existingNISList: string[]
): Promise<{ added: Partial<DataSiswa>[]; duplicates: string[]; invalidCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const added: Partial<DataSiswa>[] = [];
        const duplicates: string[] = [];
        let invalidCount = 0;
        const currentNISSet = new Set(existingNISList.map((n) => String(n).trim()));

        for (const row of rawJson) {
          const nis = String(row.NIS || row.nis || row['No Induk'] || '').trim();
          const nama = String(row.NamaSiswa || row.Nama || row['Nama Lengkap'] || row.nama || '').trim();
          const kelas = String(row.Kelas || row.kelas || row.Rombel || '').trim();

          if (!nis || !nama || !kelas) {
            invalidCount++;
            continue;
          }

          if (currentNISSet.has(nis)) {
            duplicates.push(nis);
          } else {
            currentNISSet.add(nis);
            const now = new Date().toISOString();
            added.push({
              ID: 'SISWA_' + Math.random().toString(36).substring(2, 9),
              Dibuat: now,
              NIS: nis,
              NamaSiswa: nama,
              Kelas: kelas,
              Username: nis,
              Password: generateRandomPassword(6),
              StatusLogin: 'Belum Login',
            });
          }
        }

        resolve({ added, duplicates, invalidCount });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads question template Excel
 */
export function downloadQuestionTemplate() {
  const sampleData = [
    {
      MataPelajaran: 'Matematika Wajib',
      MateriUjian: 'Persamaan & Pertidaksamaan Linear',
      TeksSoal: 'Nilai x yang memenuhi persamaan 2x + 7 = 15 adalah...',
      GambarSoal: '',
      OpsiA: '3',
      GambarOpsiA: '',
      OpsiB: '4',
      GambarOpsiB: '',
      OpsiC: '5',
      GambarOpsiC: '',
      OpsiD: '6',
      GambarOpsiD: '',
      OpsiE: '7',
      GambarOpsiE: '',
      KunciJawaban: 'B',
      Bobot: 1,
    },
    {
      MataPelajaran: 'Biologi',
      MateriUjian: 'Struktur & Fungsi Sel',
      TeksSoal: 'Organel sel yang berfungsi sebagai tempat sintesis protein adalah...',
      GambarSoal: '',
      OpsiA: 'Mitokondria',
      GambarOpsiA: '',
      OpsiB: 'Ribosom',
      GambarOpsiB: '',
      OpsiC: 'Badan Golgi',
      GambarOpsiC: '',
      OpsiD: 'Lisosom',
      GambarOpsiD: '',
      OpsiE: 'Retikulum Endoplasma Kasar',
      GambarOpsiE: '',
      KunciJawaban: 'B',
      Bobot: 1,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Soal');
  XLSX.writeFile(workbook, 'Template_Bank_Soal_SMAN1Majalaya.xlsx');
}

/**
 * Parses uploaded Excel file for question bank
 */
export async function parseQuestionsFromExcel(
  file: File,
  defaultSubject?: string
): Promise<{ added: Partial<BankSoal>[]; invalidCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const added: Partial<BankSoal>[] = [];
        let invalidCount = 0;

        for (const row of rawJson) {
          const mapel = String(row.MataPelajaran || defaultSubject || '').trim();
          const materi = String(row.MateriUjian || row.Materi || row.Topik || '').trim();
          const teks = String(row.TeksSoal || row.Soal || '').trim();
          const opsiA = String(row.OpsiA || row.A || '').trim();
          const opsiB = String(row.OpsiB || row.B || '').trim();
          const opsiC = String(row.OpsiC || row.C || '').trim();
          const opsiD = String(row.OpsiD || row.D || '').trim();
          const opsiE = String(row.OpsiE || row.E || '').trim();
          let kunci = String(row.KunciJawaban || row.Kunci || 'A').trim().toUpperCase();
          if (!['A', 'B', 'C', 'D', 'E'].includes(kunci)) {
            kunci = 'A';
          }
          const bobot = Number(row.Bobot) || 1;

          if (!mapel || !teks || !opsiA || !opsiB) {
            invalidCount++;
            continue;
          }

          const now = new Date().toISOString();
          added.push({
            ID: 'SOAL_' + Math.random().toString(36).substring(2, 9),
            Dibuat: now,
            MataPelajaran: mapel,
            MateriUjian: materi || 'Umum',
            TeksSoal: teks,
            GambarSoal: row.GambarSoal ? String(row.GambarSoal).trim() : undefined,
            OpsiA: opsiA,
            GambarOpsiA: row.GambarOpsiA ? String(row.GambarOpsiA).trim() : undefined,
            OpsiB: opsiB,
            GambarOpsiB: row.GambarOpsiB ? String(row.GambarOpsiB).trim() : undefined,
            OpsiC: opsiC || '-',
            GambarOpsiC: row.GambarOpsiC ? String(row.GambarOpsiC).trim() : undefined,
            OpsiD: opsiD || '-',
            GambarOpsiD: row.GambarOpsiD ? String(row.GambarOpsiD).trim() : undefined,
            OpsiE: opsiE || '-',
            GambarOpsiE: row.GambarOpsiE ? String(row.GambarOpsiE).trim() : undefined,
            KunciJawaban: kunci as 'A' | 'B' | 'C' | 'D' | 'E',
            Bobot: bobot,
          });
        }

        resolve({ added, invalidCount });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
  });
}
