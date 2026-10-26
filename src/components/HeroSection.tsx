import React from 'react';
import {
  Heart,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Smartphone,
  Users,
} from 'lucide-react';

interface HeroSectionProps {
  onDonateClick: () => void;
  onCalculatorClick: () => void;
  onTransparencyClick: () => void;
  onPwaClick: () => void;
  stats?: {
    totalTerkumpul: number;
    totalDisalurkan: number;
    saldoKas: number;
    totalMuzakki: number;
    totalMustahik: number;
    persentaseCapaian: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onDonateClick,
  onCalculatorClick,
  onTransparencyClick,
  onPwaClick,
  stats,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative Islamic Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="#ffffff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamicPattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Resmi SK BAZNAS Kabupaten Bandung Barat</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Verifikasi Otomatis & BSZ Ber-Barcode</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-500/40 text-teal-200 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <span>Melayani 16 Desa Se-Kecamatan Lembang</span>
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Tunaikan Zakat & Infaq dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100">Mudah, Amanah</span> dan <span className="underline decoration-emerald-400/60 decoration-wavy">Transparan</span>.
            </h1>

            <p className="text-emerald-100/90 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Portal resmi Unit Pengumpul Zakat (UPZ) Kecamatan Lembang, Kabupaten Bandung Barat. Bersihkan harta, berdayakan mustahik dhuafa, yatim, lansia, petani sayur, dan peternak sapi perah di 16 desa binaan Lembang.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onDonateClick}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-emerald-950 font-bold text-base shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-yellow-400 active:scale-98 transition flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-emerald-950" />
                <span>Donasi & Zakat Online</span>
              </button>

              <button
                onClick={onCalculatorClick}
                className="px-5 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-600/50 text-white font-semibold text-base transition flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-5 h-5 text-amber-300" />
                <span>Hitung Zakat Anda</span>
              </button>

              <button
                onClick={onTransparencyClick}
                className="px-4 py-3.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/40 transition text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Laporan Keuangan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Assurance Points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-emerald-700/50 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aman Syar'i (Akad Zakat Sah)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Notifikasi WA & Telegram Instan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enkripsi End-to-End Data</span>
              </div>
            </div>
          </div>

          {/* Right Card: Real-time Live Metrics Dashboard */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 p-6 backdrop-blur-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Ringkasan Transparansi Real-Time
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-white/10">
                  Tahun Anggaran 2026
                </span>
              </div>

              {/* Total Donasi Terkumpul */}
              <div className="space-y-1">
                <span className="text-xs text-emerald-200 font-medium">Total Dana ZIS Terkumpul:</span>
                <div className="text-3xl font-extrabold text-amber-300 tracking-tight">
                  Rp {(stats?.totalTerkumpul || 750000000).toLocaleString('id-ID')}
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-300/80 pt-1">
                  <span>Target BAZNAS KBB: Rp 1,2 Miliar</span>
                  <span className="font-bold text-amber-200">{stats?.persentaseCapaian || 63}% Tercapai</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-emerald-950/60 rounded-full h-2.5 overflow-hidden border border-emerald-700/40">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${stats?.persentaseCapaian || 63}%` }}
                  ></div>
                </div>
              </div>

              {/* Grid 2 Column for Disbursed and Balance */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-emerald-950/50 rounded-xl p-3 border border-emerald-700/40">
                  <span className="text-[11px] text-emerald-300 block">Telah Disalurkan:</span>
                  <span className="text-lg font-bold text-white block mt-0.5">
                    Rp {(stats?.totalDisalurkan || 648000000).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    Di 16 Desa se-Lembang
                  </span>
                </div>

                <div className="bg-emerald-950/50 rounded-xl p-3 border border-emerald-700/40">
                  <span className="text-[11px] text-emerald-300 block">Saldo Kas Siap Salur:</span>
                  <span className="text-lg font-bold text-amber-300 block mt-0.5">
                    Rp {(stats?.saldoKas || 102000000).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    Kas BSI & Muamalat UPZ
                  </span>
                </div>
              </div>

              {/* Beneficiaries Count */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-300" />
                  <span>
                    <strong className="text-white">{(stats?.totalMustahik || 3420).toLocaleString('id-ID')} Mustahik</strong> Terbantu
                  </span>
                </div>
                <div className="text-emerald-300">
                  <strong className="text-white">{(stats?.totalMuzakki || 1840).toLocaleString('id-ID')} Muzakki</strong> Terdaftar
                </div>
              </div>

              {/* Mobile App Install Mini CTA */}
              <div className="pt-1">
                <button
                  onClick={onPwaClick}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600/60 hover:bg-emerald-600/90 border border-emerald-400/30 text-white text-xs font-semibold transition"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span>Pasang Aplikasi di HP (Android / iOS) Tanpa Download Play Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
