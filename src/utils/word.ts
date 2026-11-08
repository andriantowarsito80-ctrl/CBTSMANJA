/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankSoal } from '../types';

/**
 * Downloads a professional Microsoft Word (.doc) template formatted specifically
 * for CBT question preparation at SMAN 1 Majalaya.
 * Compatible with Microsoft Word 2007+, Office 365, Google Docs, and WPS Office.
 */
export function downloadWordQuestionTemplate(namaSekolah = 'SMAN 1 MAJALAYA', mapel = 'Matematika Wajib') {
  const content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Template Bank Soal CBT - ${namaSekolah}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: 21.0cm 29.7cm; /* A4 */
    margin: 2.0cm 2.0cm 2.0cm 2.0cm;
    mso-page-orientation: portrait;
  }
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000000;
  }
  .kop {
    text-align: center;
    border-bottom: 3px double #000;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .kop h1 {
    font-size: 14pt;
    font-weight: bold;
    margin: 0;
    text-transform: uppercase;
  }
  .kop h2 {
    font-size: 12pt;
    font-weight: bold;
    margin: 2px 0;
  }
  .kop p {
    font-size: 9pt;
    margin: 0;
    color: #333;
  }
  .title {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 12px;
  }
  .guide-box {
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 10px;
    margin-bottom: 16px;
    font-size: 9.5pt;
  }
  .guide-box strong {
    color: #0f172a;
  }
  .table-meta {
    width: 100%;
    margin-bottom: 15px;
    font-size: 10pt;
    border-collapse: collapse;
  }
  .table-meta td {
    padding: 3px 5px;
  }
  .soal-card {
    margin-bottom: 18px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #94a3b8;
  }
  .soal-header {
    font-weight: bold;
    color: #0369a1;
    font-size: 10pt;
    margin-bottom: 4px;
  }
  .opsi {
    margin-left: 20px;
  }
  .kunci {
    margin-left: 20px;
    font-weight: bold;
    color: #15803d;
    background-color: #dcfce7;
    display: inline-block;
    padding: 1px 6px;
  }
</style>
</head>
<body>

<div class="kop">
  <h1>PEMERINTAH DAERAH PROVINSI JAWA BARAT</h1>
  <h2>DINAS PENDIDIKAN - CABANG DINAS WILAYAH IV</h2>
  <h1>${namaSekolah.toUpperCase()}</h1>
  <p>Jalan Pasirjengkol, Majalaya, Kabupaten Karawang - Jawa Barat 41371</p>
  <p>Laman: cbt.sman1majalaya.sch.id | Surat Elektronik: info@sman1majalaya.sch.id</p>
</div>

<div class="title">TEMPLATE PENULISAN BANK SOAL UJIAN CBT</div>

<table class="table-meta">
  <tr>
    <td width="22%"><strong>Mata Pelajaran</strong></td>
    <td width="3%">:</td>
    <td width="35%">${mapel}</td>
    <td width="20%"><strong>Bentuk Asesmen</strong></td>
    <td width="3%">:</td>
    <td width="17%">Pilihan Ganda (A s.d E)</td>
  </tr>
  <tr>
    <td><strong>Target Rombel</strong></td>
    <td>:</td>
    <td>Semua Kelas / Sesuai Jadwal</td>
    <td><strong>Tahun Pelajaran</strong></td>
    <td>:</td>
    <td>2026 / 2027</td>
  </tr>
  <tr>
    <td><strong>Guru Pengampu</strong></td>
    <td>:</td>
    <td colspan="4">....................................................................................</td>
  </tr>
</table>

<div class="guide-box">
  <strong>PETUNJUK PENULISAN SOAL BAGI BAPAK/IBU GURU:</strong><br>
  1. Tuliskan nomor soal diikuti pertanyaan (Contoh: <strong>1. Perhatikan gambar berikut...</strong>).<br>
  2. Pilihan jawaban wajib terdiri dari 5 pilihan (<strong>A.</strong>, <strong>B.</strong>, <strong>C.</strong>, <strong>D.</strong>, <strong>E.</strong>).<br>
  3. Di bawah pilihan E, tuliskan kunci jawaban dengan format: <strong>KUNCI: A</strong> (atau B / C / D / E).<br>
  4. (Opsional) Tuliskan bobot soal dengan format: <strong>BOBOT: 1</strong> (default adalah 1).<br>
  5. (Opsional) Tuliskan topik materi dengan format: <strong>MATERI: [Nama Materi]</strong>.<br>
  6. Rumus matematika dan simbol latin dapat ditulis langsung atau disalin sebagai gambar.
</div>

<!-- CONTOH BUTIR SOAL 1 -->
<div class="soal-card">
  <div class="soal-header">[SOAL NOMOR 1] - MATERI: Persamaan Linear</div>
  <p><strong>1.</strong> Himpunan penyelesaian dari pertidaksamaan linear 3x - 5 &le; 7 + x untuk x bilangan bulat adalah...</p>
  <div class="opsi">A. x &le; 6</div>
  <div class="opsi">B. x &ge; 6</div>
  <div class="opsi">C. x &le; -6</div>
  <div class="opsi">D. x &ge; -6</div>
  <div class="opsi">E. x &le; 3</div>
  <p><span class="kunci">KUNCI: A</span> &nbsp;&nbsp; <strong>BOBOT: 1</strong></p>
</div>

<!-- CONTOH BUTIR SOAL 2 -->
<div class="soal-card">
  <div class="soal-header">[SOAL NOMOR 2] - MATERI: Trigonometri & Geometri</div>
  <p><strong>2.</strong> Diketahui segitiga siku-siku ABC dengan panjang sisi siku-siku berturut-turut adalah AB = 6 cm dan BC = 8 cm. Panjang sisi miring (hipotenusa) AC adalah...</p>
  <div class="opsi">A. 9 cm</div>
  <div class="opsi">B. 10 cm</div>
  <div class="opsi">C. 12 cm</div>
  <div class="opsi">D. 14 cm</div>
  <div class="opsi">E. 15 cm</div>
  <p><span class="kunci">KUNCI: B</span> &nbsp;&nbsp; <strong>BOBOT: 1</strong></p>
</div>

<!-- CONTOH BUTIR SOAL 3 -->
<div class="soal-card">
  <div class="soal-header">[SOAL NOMOR 3] - MATERI: Relasi & Fungsi Kuadrat</div>
  <p><strong>3.</strong> Jika suatu fungsi kuadrat ditentukan oleh rumus f(x) = 2x&sup2; - 3x + 5, maka nilai dari f(-2) adalah...</p>
  <div class="opsi">A. 15</div>
  <div class="opsi">B. 17</div>
  <div class="opsi">C. 19</div>
  <div class="opsi">D. 21</div>
  <div class="opsi">E. 23</div>
  <p><span class="kunci">KUNCI: C</span> &nbsp;&nbsp; <strong>BOBOT: 1</strong></p>
</div>

<!-- CONTOH BUTIR SOAL 4 -->
<div class="soal-card">
  <div class="soal-header">[SOAL NOMOR 4] - MATERI: Barisan & Deret Aritmetika</div>
  <p><strong>4.</strong> Suatu barisan aritmetika memiliki suku pertama a = 4 dan beda antarsuku b = 3. Nilai suku ke-10 (U10) adalah...</p>
  <div class="opsi">A. 28</div>
  <div class="opsi">B. 30</div>
  <div class="opsi">C. 31</div>
  <div class="opsi">D. 34</div>
  <div class="opsi">E. 37</div>
  <p><span class="kunci">KUNCI: C</span> &nbsp;&nbsp; <strong>BOBOT: 1</strong></p>
</div>

<!-- CONTOH BUTIR SOAL 5 -->
<div class="soal-card">
  <div class="soal-header">[SOAL NOMOR 5] - MATERI: Eksponen & Logaritma</div>
  <p><strong>5.</strong> Hasil operasi logaritma dari &sup2;log 16 + &sup3;log 27 - &sup5;log 25 adalah...</p>
  <div class="opsi">A. 3</div>
  <div class="opsi">B. 4</div>
  <div class="opsi">C. 5</div>
  <div class="opsi">D. 6</div>
  <div class="opsi">E. 7</div>
  <p><span class="kunci">KUNCI: C</span> &nbsp;&nbsp; <strong>BOBOT: 1</strong></p>
</div>

<!-- TEMPAT GURU MENAMBAHKAN SOAL -->
<p style="color: #64748b; font-style: italic; margin-top: 30px;">
  [Silakan lanjutkan penulisan soal nomor 6, 7, 8, dan seterusnya di bawah ini dengan format yang sama]
</p>

</body>
</html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Template_Soal_Word_${mapel.replace(/\s+/g, '_')}_SMAN1Majalaya.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw text copied or read from Word documents.
 * Standard format recognized:
 * 1. Pertanyaan...
 * A. Opsi A
 * B. Opsi B
 * C. Opsi C
 * D. Opsi D
 * E. Opsi E
 * KUNCI: A
 * BOBOT: 1 (opsional)
 * MATERI: [Nama Materi] (opsional)
 */
export function parseQuestionsFromWordText(
  rawText: string,
  defaultSubject = 'Matematika Wajib'
): { parsed: Partial<BankSoal>[]; errorCount: number } {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed: Partial<BankSoal>[] = [];
  let errorCount = 0;

  let currentSoal: Partial<BankSoal> | null = null;
  let currentMateri = 'Umum';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect MATERI tag
    const materiMatch = line.match(/^(?:MATERI|TOPIK)\s*[:=]\s*(.+)$/i);
    if (materiMatch) {
      currentMateri = materiMatch[1].trim();
      continue;
    }

    // Detect new question starting with number e.g. "1." or "1)" or "Soal 1:"
    const questionStartMatch = line.match(/^(?:(?:\[?SOAL\s*(?:NOMOR\s*)?\d+\]?|(?:\d+[\.\)]))\s*)(.+)$/i);
    if (questionStartMatch || (/^\d+[\.\)]/.test(line))) {
      // Save previous question if valid
      if (currentSoal && currentSoal.TeksSoal && currentSoal.OpsiA && currentSoal.OpsiB) {
        parsed.push({
          ID: 'SOAL_' + Math.random().toString(36).substring(2, 9),
          Dibuat: new Date().toISOString(),
          MataPelajaran: defaultSubject,
          MateriUjian: currentSoal.MateriUjian || currentMateri || 'Umum',
          TeksSoal: currentSoal.TeksSoal,
          OpsiA: currentSoal.OpsiA,
          OpsiB: currentSoal.OpsiB,
          OpsiC: currentSoal.OpsiC || '-',
          OpsiD: currentSoal.OpsiD || '-',
          OpsiE: currentSoal.OpsiE || '-',
          KunciJawaban: (currentSoal.KunciJawaban as 'A' | 'B' | 'C' | 'D' | 'E') || 'A',
          Bobot: currentSoal.Bobot || 1,
        });
      }

      const qText = questionStartMatch ? questionStartMatch[1] : line.replace(/^\d+[\.\)]\s*/, '');
      currentSoal = {
        TeksSoal: qText,
        MateriUjian: currentMateri,
        OpsiA: '',
        OpsiB: '',
        OpsiC: '',
        OpsiD: '',
        OpsiE: '',
        KunciJawaban: 'A',
        Bobot: 1,
      };
      continue;
    }

    if (!currentSoal) continue;

    // Detect Options A through E
    const optMatch = line.match(/^([A-E])[\.\)]\s*(.+)$/i);
    if (optMatch) {
      const optLetter = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      const optText = optMatch[2].trim();
      currentSoal[`Opsi${optLetter}`] = optText;
      continue;
    }

    // Detect KUNCI: A
    const keyMatch = line.match(/^KUNCI(?:\s*JAWABAN)?\s*[:=]\s*([A-E])/i);
    if (keyMatch) {
      currentSoal.KunciJawaban = keyMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      continue;
    }

    // Detect BOBOT: 1
    const bobotMatch = line.match(/^BOBOT(?:\s*NILAI)?\s*[:=]\s*(\d+)/i);
    if (bobotMatch) {
      currentSoal.Bobot = Number(bobotMatch[1]) || 1;
      continue;
    }

    // If continuation of question text or option
    if (!currentSoal.OpsiA) {
      currentSoal.TeksSoal = (currentSoal.TeksSoal ? currentSoal.TeksSoal + ' ' : '') + line;
    }
  }

  // Push last question
  if (currentSoal && currentSoal.TeksSoal && currentSoal.OpsiA && currentSoal.OpsiB) {
    parsed.push({
      ID: 'SOAL_' + Math.random().toString(36).substring(2, 9),
      Dibuat: new Date().toISOString(),
      MataPelajaran: defaultSubject,
      MateriUjian: currentSoal.MateriUjian || currentMateri || 'Umum',
      TeksSoal: currentSoal.TeksSoal,
      OpsiA: currentSoal.OpsiA,
      OpsiB: currentSoal.OpsiB,
      OpsiC: currentSoal.OpsiC || '-',
      OpsiD: currentSoal.OpsiD || '-',
      OpsiE: currentSoal.OpsiE || '-',
      KunciJawaban: (currentSoal.KunciJawaban as 'A' | 'B' | 'C' | 'D' | 'E') || 'A',
      Bobot: currentSoal.Bobot || 1,
    });
  }

  return { parsed, errorCount };
}
