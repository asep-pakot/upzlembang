import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Heart,
  Globe,
  ArrowUp,
  Download,
} from 'lucide-react';
import { LEMBANG_VILLAGES } from '../utils/constants';

interface FooterProps {
  onOpenDonate: () => void;
  onOpenCalculator: () => void;
  onOpenPwaGuide: () => void;
  onOpenSecurityModal: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDonate,
  onOpenCalculator,
  onOpenPwaGuide,
  onOpenSecurityModal,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Identity */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-2.5 shadow-md flex items-center justify-center text-amber-300 border border-emerald-500/30">
                <svg viewBox="0 0 512 512" className="w-full h-full fill-current">
                  <path d="M 276 90 A 38 38 0 1 0 276 150 A 30 30 0 1 1 276 90 Z" />
                  <path d="M 256 140 C 220 180 200 210 200 260 L 312 260 C 312 210 292 180 256 140 Z" fill="#ffffff" />
                  <path d="M 170 300 C 190 280 230 310 256 325 C 282 310 322 280 342 300 C 362 320 330 360 256 400 C 182 360 150 320 170 300 Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white tracking-tight">
                  UPZ KECAMATAN LEMBANG
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  BAZNAS KABUPATEN BANDUNG BARAT
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Lembaga pengelola zakat, infaq, dan sedekah tingkat kecamatan yang berwenang menghimpun dan mendistribusikan dana sosial keagamaan Islam secara amanah, akuntabel, dan transparan di wilayah Kecamatan Lembang.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Gedung Dakwah & KUA Lembang, Jl. Raya Lembang No. 238, Lembang, Kab. Bandung Barat 40391</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>(022) 2786012 • WhatsApp: 0812-2334-4556</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>layanan@upzlembang.org</span>
              </div>
            </div>
          </div>

          {/* Col 2: Program & Layanan */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Layanan & Program
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenDonate} className="hover:text-amber-300 transition cursor-pointer">
                  • Zakat Penghasilan & Profesi
                </button>
              </li>
              <li>
                <button onClick={onOpenDonate} className="hover:text-amber-300 transition cursor-pointer">
                  • Zakat Maal, Emas & Perniagaan
                </button>
              </li>
              <li>
                <button onClick={onOpenDonate} className="hover:text-amber-300 transition cursor-pointer">
                  • Infaq & Sedekah Subuh
                </button>
              </li>
              <li>
                <button onClick={onOpenDonate} className="hover:text-amber-300 transition cursor-pointer">
                  • Wakaf Tunai Produktif
                </button>
              </li>
              <li>
                <button onClick={onOpenCalculator} className="hover:text-amber-300 transition cursor-pointer">
                  • Kalkulator Zakat Online
                </button>
              </li>
              <li>
                <button onClick={onOpenSecurityModal} className="hover:text-amber-300 transition cursor-pointer">
                  • Keamanan Enkripsi & Database MySQL
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: 16 Desa Binaan */}
          <div className="lg:col-span-4 space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              16 Desa Binaan di Kecamatan Lembang
            </h5>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {LEMBANG_VILLAGES.map((v) => (
                <span
                  key={v}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-emerald-600 transition"
                >
                  Desa {v}
                </span>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={onOpenPwaGuide}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/50 text-white text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Pasang Aplikasi Smartphone (PWA Android / iOS)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Unit Pengumpul Zakat (UPZ) Kecamatan Lembang, Kab. Bandung Barat. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>

          <div className="flex items-center gap-3">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 hover:text-white transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Panel Pengurus / Admin</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <span>Kembali ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
