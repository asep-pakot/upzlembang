/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Portal Resmi UPZ Kecamatan Lembang, Kabupaten Bandung Barat
 * upzlembang.org
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DonationSection } from './components/DonationSection';
import { TransparencyDashboard } from './components/TransparencyDashboard';
import { DisbursementPrograms } from './components/DisbursementPrograms';
import { NewsAndGallery } from './components/NewsAndGallery';
import { ZakatCalculatorModal } from './components/ZakatCalculatorModal';
import { BSZModal } from './components/BSZModal';
import { MustahikSubmissionModal } from './components/MustahikSubmissionModal';
import { WhatsAppTelegramNotificationModal } from './components/WhatsAppTelegramNotificationModal';
import { SecurityMySQLModal } from './components/SecurityMySQLModal';
import { CustomerServiceWidget } from './components/CustomerServiceWidget';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [stats, setStats] = useState<any>(null);

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isBSZOpen, setIsBSZOpen] = useState<boolean>(false);
  const [activeBSZDonation, setActiveBSZDonation] = useState<any | null>(null);
  const [isMustahikModalOpen, setIsMustahikModalOpen] = useState<boolean>(false);
  const [isNotificationFeedOpen, setIsNotificationFeedOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState<boolean>(false);

  // Preset for donation form from calculator or programs
  const [presetAmount, setPresetAmount] = useState<number | undefined>(undefined);
  const [presetCategory, setPresetCategory] = useState<string | undefined>(undefined);

  // Admin View & Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('upz_admin_token');
  });
  const [adminUser, setAdminUser] = useState<any>(() => {
    const saved = localStorage.getItem('upz_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  const { isInstallable, install } = usePWAInstall();

  // Load Real-time Stats
  const loadStats = () => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDonate = () => {
    setActiveTab('donasi');
    const el = document.getElementById('donasi');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyZakatFromCalculator = (amount: number, category: string) => {
    setPresetAmount(amount);
    setPresetCategory(category);
    setActiveTab('donasi');
    setTimeout(() => {
      const el = document.getElementById('donasi');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDonateToProgram = (programName: string) => {
    setPresetCategory(
      programName === 'Lembang Peduli'
        ? 'Program Bencana & Peduli'
        : programName === 'Lembang Makmur'
        ? 'Wakaf Tunai'
        : 'Infaq & Sedekah'
    );
    setActiveTab('donasi');
    setTimeout(() => {
      const el = document.getElementById('donasi');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSuccessfulDonation = (donationData: any) => {
    setActiveBSZDonation(donationData);
    setIsBSZOpen(true);
    loadStats();
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn && adminUser) {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (userData: any, _token: string) => {
    setAdminUser(userData);
    setIsAdminLoggedIn(true);
    setIsAdminLoginModalOpen(false);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('upz_admin_token');
    localStorage.removeItem('upz_admin_user');
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    setCurrentView('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <AdminDashboard
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          onExitToPublic={() => {
            setCurrentView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenBSZ={(donation) => {
            setActiveBSZDonation(donation);
            setIsBSZOpen(true);
          }}
        />

        {/* BSZ Preview in Admin */}
        {isBSZOpen && activeBSZDonation && (
          <BSZModal
            donation={activeBSZDonation}
            onClose={() => setIsBSZOpen(false)}
            openNotificationFeed={() => {
              setIsBSZOpen(false);
              setIsNotificationFeedOpen(true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCalculator={() => setIsCalculatorOpen(true)}
        openDonate={handleOpenDonate}
        openMustahikModal={() => setIsMustahikModalOpen(true)}
        openNotificationFeed={() => setIsNotificationFeedOpen(true)}
        openPwaGuide={() => setIsPwaGuideOpen(true)}
        isInstallable={isInstallable}
        onInstall={install}
        stats={stats}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Sections based on Active Navigation Tab */}
      <main className="flex-1">
        {activeTab === 'beranda' && (
          <>
            <HeroSection
              onDonateClick={handleOpenDonate}
              onCalculatorClick={() => setIsCalculatorOpen(true)}
              onTransparencyClick={() => setActiveTab('transparansi')}
              onPwaClick={() => setIsPwaGuideOpen(true)}
              stats={stats}
            />

            <DonationSection
              onSuccessfulDonation={handleSuccessfulDonation}
              openNotificationFeed={() => setIsNotificationFeedOpen(true)}
              presetAmount={presetAmount}
              presetCategory={presetCategory}
            />

            <TransparencyDashboard
              onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            />

            <DisbursementPrograms
              onOpenMustahikModal={() => setIsMustahikModalOpen(true)}
              onDonateToProgram={handleDonateToProgram}
            />

            <NewsAndGallery />
          </>
        )}

        {activeTab === 'donasi' && (
          <div className="pt-4">
            <DonationSection
              onSuccessfulDonation={handleSuccessfulDonation}
              openNotificationFeed={() => setIsNotificationFeedOpen(true)}
              presetAmount={presetAmount}
              presetCategory={presetCategory}
            />
          </div>
        )}

        {activeTab === 'transparansi' && (
          <div className="pt-4">
            <TransparencyDashboard
              onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'penyaluran' && (
          <div className="pt-4">
            <DisbursementPrograms
              onOpenMustahikModal={() => setIsMustahikModalOpen(true)}
              onDonateToProgram={handleDonateToProgram}
            />
          </div>
        )}

        {activeTab === 'berita' && (
          <div className="pt-4">
            <NewsAndGallery />
          </div>
        )}

        {activeTab === 'keamanan' && (
          <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900">
                Sistem Keamanan & Basis Data MySQL
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Implementasi standar keamanan enkripsi End-to-End data donatur dan akuntabilitas keuangan UPZ Lembang.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Seluruh data identitas muzakki, nomor kontak WhatsApp, dan catatan transaksi dienkripsi menggunakan algoritma AES-256-CBC sebelum tersimpan ke dalam tabel relasional basis data MySQL. Setiap bukti setor zakat diverifikasi keasliannya dengan token tanda tangan kriptografi HMAC SHA-256.
              </p>
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition"
              >
                Buka Panel Arsitektur MySQL & Unduh Skema DDL (.sql)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Interactive Customer Service / Live Fiqih Zakat Chat */}
      <CustomerServiceWidget />

      {/* PWA Floating Banner & Guide Modal */}
      <PWAInstallBanner
        forceShowGuide={isPwaGuideOpen}
        onCloseGuide={() => setIsPwaGuideOpen(false)}
      />

      {/* Modals */}
      <ZakatCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyZakat={handleApplyZakatFromCalculator}
      />

      {isBSZOpen && activeBSZDonation && (
        <BSZModal
          donation={activeBSZDonation}
          onClose={() => setIsBSZOpen(false)}
          openNotificationFeed={() => {
            setIsBSZOpen(false);
            setIsNotificationFeedOpen(true);
          }}
        />
      )}

      <MustahikSubmissionModal
        isOpen={isMustahikModalOpen}
        onClose={() => setIsMustahikModalOpen(false)}
      />

      <WhatsAppTelegramNotificationModal
        isOpen={isNotificationFeedOpen}
        onClose={() => setIsNotificationFeedOpen(false)}
        recentTransaction={activeBSZDonation}
      />

      <SecurityMySQLModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Official Footer */}
      <Footer
        onOpenDonate={handleOpenDonate}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
