import React, { useState } from 'react';
import {
  Calculator,
  Heart,
  BarChart3,
  BookOpen,
  Send,
  ShieldCheck,
  Download,
  Menu,
  X,
  PhoneCall,
  BellRing,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCalculator: () => void;
  openDonate: () => void;
  openMustahikModal: () => void;
  openNotificationFeed: () => void;
  openPwaGuide: () => void;
  isInstallable: boolean;
  onInstall: () => void;
  stats?: {
    totalTerkumpul: number;
    totalDisalurkan: number;
    saldoKas: number;
  };
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openCalculator,
  openDonate,
  openMustahikModal,
  openNotificationFeed,
  openPwaGuide,
  isInstallable,
  onInstall,
  stats,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'donasi', label: 'Tunaikan Zakat' },
    { id: 'transparansi', label: 'Transparansi Real-Time' },
    { id: 'penyaluran', label: 'Program Penyaluran' },
    { id: 'berita', label: 'Berita & Galeri' },
    { id: 'keamanan', label: 'Keamanan & MySQL' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner Ticker: Real-time Financial Transparency */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 overflow-hidden border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-semibold text-emerald-300">LIVE Transparansi UPZ:</span>
            <span>
              Terkumpul: <strong className="text-white">Rp {(stats?.totalTerkumpul || 750000000).toLocaleString('id-ID')}</strong>
            </span>
            <span className="hidden sm:inline text-emerald-400">•</span>
            <span className="hidden sm:inline">
              Tersalurkan: <strong className="text-emerald-200">Rp {(stats?.totalDisalurkan || 648000000).toLocaleString('id-ID')}</strong>
            </span>
            <span className="hidden md:inline text-emerald-400">•</span>
            <span className="hidden md:inline">
              Saldo Kas Aktif: <strong className="text-amber-300">Rp {(stats?.saldoKas || 102000000).toLocaleString('id-ID')}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNotificationFeed}
              className="flex items-center gap-1 hover:text-white transition text-amber-200 cursor-pointer"
              title="Cek Integrasi Notifikasi WA & Telegram"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span className="underline decoration-dotted">Notifikasi WA & TG</span>
            </button>
            <span className="text-emerald-700 hidden sm:inline">|</span>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40 text-[11px] font-bold transition cursor-pointer"
              title="Masuk ke Panel Kendali Admin UPZ"
            >
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              <span>{isAdminLoggedIn ? 'Panel Admin (Aktif)' : 'Login Admin UPZ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Entity Name */}
          <div
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group py-2"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-2 shadow-md flex items-center justify-center text-white border border-emerald-600/30 group-hover:scale-105 transition-transform shrink-0">
              <svg viewBox="0 0 512 512" className="w-full h-full fill-current text-amber-300">
                <path d="M 276 90 A 38 38 0 1 0 276 150 A 30 30 0 1 1 276 90 Z" />
                <path d="M 256 140 C 220 180 200 210 200 260 L 312 260 C 312 210 292 180 256 140 Z" fill="#ffffff" />
                <path d="M 170 300 C 190 280 230 310 256 325 C 282 310 322 280 342 300 C 362 320 330 360 256 400 C 182 360 150 320 170 300 Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm sm:text-lg text-emerald-950 tracking-tight leading-tight truncate">
                  UPZ KEC. LEMBANG
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                  BAZNAS KBB
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 font-medium leading-none mt-0.5 truncate">
                Portal Zakat, Infaq & Transparansi Keuangan 16 Desa
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={openCalculator}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-sm font-semibold transition cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Kalkulator</span>
            </button>

            <button
              onClick={openDonate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-800 active:scale-95 transition cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Donasi / Zakat</span>
            </button>

            {/* PWA Install Trigger */}
            <button
              onClick={isInstallable ? onInstall : openPwaGuide}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Install Aplikasi di Android atau iOS"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Install App</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={openDonate}
              className="sm:hidden px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
            >
              Donasi
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-700 hover:bg-emerald-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                openCalculator();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold"
            >
              <Calculator className="w-4 h-4" />
              Kalkulator Zakat
            </button>
            <button
              onClick={() => {
                openMustahikModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold"
            >
              <Send className="w-4 h-4" />
              Usul Mustahik
            </button>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>{isAdminLoggedIn ? 'Buka Panel Admin (Aktif)' : 'Login Pengurus / Admin UPZ'}</span>
            </button>
            <button
              onClick={() => {
                openPwaGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Install Aplikasi Smartphone (Android & iOS)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
