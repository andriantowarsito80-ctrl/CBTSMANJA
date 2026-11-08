/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from './types';
import { StorageManager } from './utils/storage';
import { LoginView } from './components/LoginView';
import { AdminLayout } from './components/admin/AdminLayout';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentExamRoom } from './components/student/StudentExamRoom';

type UserSession =
  | { type: 'admin'; data: Pengguna }
  | { type: 'siswa'; data: DataSiswa }
  | null;

export default function App() {
  // Master State loaded from storage
  const [admin, setAdmin] = useState<Pengguna>(() => StorageManager.getAdmin());
  const [profil, setProfil] = useState<ProfilSekolah>(() => StorageManager.getProfilSekolah());
  const [siswa, setSiswa] = useState<DataSiswa[]>(() => StorageManager.getSiswa());
  const [guru, setGuru] = useState<DataGuru[]>(() => StorageManager.getGuru());
  const [paketSoal, setPaketSoal] = useState<PaketSoal[]>(() => StorageManager.getPaketSoal());
  const [bankSoal, setBankSoal] = useState<BankSoal[]>(() => StorageManager.getBankSoal());
  const [jadwal, setJadwal] = useState<JadwalUjian[]>(() => StorageManager.getJadwal());
  const [statusTest, setStatusTest] = useState<StatusTest[]>(() => StorageManager.getStatusTest());
  const [pesertaUjian, setPesertaUjian] = useState<PesertaUjian[]>(() => StorageManager.getPesertaUjian());
  const [sesiUjian, setSesiUjian] = useState<SesiUjian[]>(() => StorageManager.getSesiUjian());

  // Active authenticated user session
  const [currentSession, setCurrentSession] = useState<UserSession>(null);

  // Student active exam state (for S2)
  const [activeExamForStudent, setActiveExamForStudent] = useState<JadwalUjian | null>(null);

  // Update handlers with storage persistence
  const handleUpdateProfil = (newProfil: ProfilSekolah) => {
    setProfil(newProfil);
    StorageManager.saveProfilSekolah(newProfil);
  };

  const handleUpdateAdmin = (newAdmin: Pengguna) => {
    setAdmin(newAdmin);
    StorageManager.saveAdmin(newAdmin);
  };

  const handleUpdateSiswa = (newSiswa: DataSiswa[]) => {
    setSiswa(newSiswa);
    StorageManager.saveSiswa(newSiswa);
  };

  const handleUpdateGuru = (newGuru: DataGuru[]) => {
    setGuru(newGuru);
    StorageManager.saveGuru(newGuru);
  };

  const handleUpdatePaketSoal = (newPaket: PaketSoal[]) => {
    setPaketSoal(newPaket);
    StorageManager.savePaketSoal(newPaket);
  };

  const handleUpdateBankSoal = (newBankSoal: BankSoal[]) => {
    setBankSoal(newBankSoal);
    StorageManager.saveBankSoal(newBankSoal);
  };

  const handleUpdateJadwal = (newJadwal: JadwalUjian[]) => {
    setJadwal(newJadwal);
    StorageManager.saveJadwal(newJadwal);
  };

  const handleUpdateStatusTest = (newStatusTest: StatusTest[]) => {
    setStatusTest(newStatusTest);
    StorageManager.saveStatusTest(newStatusTest);
  };

  const handleUpdatePesertaUjian = (newPeserta: PesertaUjian[]) => {
    setPesertaUjian(newPeserta);
    StorageManager.savePesertaUjian(newPeserta);
  };

  const handleUpdateSesiUjian = (newSesi: SesiUjian[]) => {
    setSesiUjian(newSesi);
    StorageManager.saveSesiUjian(newSesi);
  };

  // Student saves/updates their exam session using functional state updater
  const handleSaveStudentSession = (session: SesiUjian) => {
    setSesiUjian((prev) => {
      const exists = prev.some((s) => s.ID === session.ID);
      const updated = exists
        ? prev.map((s) => (s.ID === session.ID ? session : s))
        : [session, ...prev];
      StorageManager.saveSesiUjian(updated);
      return updated;
    });
  };

  // Logout handlers
  const handleLogout = () => {
    if (currentSession?.type === 'siswa') {
      // Revert status to Belum Login
      const studentId = currentSession.data.ID;
      const updated = siswa.map((s) =>
        s.ID === studentId ? { ...s, StatusLogin: 'Belum Login' as const } : s
      );
      handleUpdateSiswa(updated);
    }
    setCurrentSession(null);
    setActiveExamForStudent(null);
  };

  // If not logged in, render the login view
  if (!currentSession) {
    return (
      <LoginView
        profil={profil}
        onLoginAdmin={(adm) => setCurrentSession({ type: 'admin', data: adm })}
        onLoginSiswa={(sis) => setCurrentSession({ type: 'siswa', data: sis })}
      />
    );
  }

  // Admin View
  if (currentSession.type === 'admin') {
    return (
      <AdminLayout
        admin={admin}
        profil={profil}
        siswa={siswa}
        guru={guru}
        paketSoal={paketSoal}
        bankSoal={bankSoal}
        jadwal={jadwal}
        statusTest={statusTest}
        pesertaUjian={pesertaUjian}
        sesiUjian={sesiUjian}
        onUpdateProfil={handleUpdateProfil}
        onUpdateAdmin={handleUpdateAdmin}
        onUpdateSiswa={handleUpdateSiswa}
        onUpdateGuru={handleUpdateGuru}
        onUpdatePaketSoal={handleUpdatePaketSoal}
        onUpdateBankSoal={handleUpdateBankSoal}
        onUpdateJadwal={handleUpdateJadwal}
        onUpdateStatusTest={handleUpdateStatusTest}
        onUpdatePesertaUjian={handleUpdatePesertaUjian}
        onUpdateSesiUjian={handleUpdateSesiUjian}
        onLogout={handleLogout}
      />
    );
  }

  // Student View: Active Exam (S2) or Student Dashboard (S1)
  if (activeExamForStudent) {
    const studentSession = sesiUjian.find(
      (s) => s.IDJadwal === activeExamForStudent.ID && s.NIS === currentSession.data.NIS
    );
    const testRecord = statusTest.find((st) => st.IDJadwal === activeExamForStudent.ID);

    return (
      <StudentExamRoom
        siswa={currentSession.data}
        profil={profil}
        jadwal={activeExamForStudent}
        statusTestRecord={testRecord}
        bankSoal={bankSoal}
        existingSession={studentSession}
        onSaveSession={handleSaveStudentSession}
        onExit={() => setActiveExamForStudent(null)}
      />
    );
  }

  return (
    <StudentDashboard
      siswa={currentSession.data}
      profil={profil}
      jadwal={jadwal}
      statusTest={statusTest}
      pesertaUjian={pesertaUjian}
      sesiUjian={sesiUjian}
      bankSoal={bankSoal}
      onOpenExam={(exam) => setActiveExamForStudent(exam)}
      onLogout={handleLogout}
    />
  );
}
