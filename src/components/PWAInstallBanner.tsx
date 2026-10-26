import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  X,
  CheckCircle2,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  forceShowGuide?: boolean;
  onCloseGuide?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  forceShowGuide,
  onCloseGuide,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const isModalOpen = forceShowGuide || showGuide;

  const handleClose = () => {
    setShowGuide(false);
    if (onCloseGuide) onCloseGuide();
  };

  // If already running standalone and guide is not forced, hide banner
  if (isInstalled && !forceShowGuide) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom-Left Install Banner */}
      {!bannerDismissed && !isInstalled && (
        <div className="fixed bottom-5 left-5 z-40 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-amber-300 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight truncate">
              Aplikasi UPZ Lembang Mobile
            </h5>
            <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
              Pasang di Android & iOS tanpa Play Store
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isInstallable ? (
              <button
                onClick={install}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Install
              </button>
            ) : (
              <button
                onClick={() => setShowGuide(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Panduan
              </button>
            )}
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Tutup Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Install Guide Modal (Android & iOS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Pasang Aplikasi Smartphone</h4>
                  <p className="text-[11px] text-emerald-200">UPZ Lembang (Android & iOS PWA)</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="text-center space-y-1.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 p-3 mx-auto shadow-md border border-emerald-500/20">
                  <svg viewBox="0 0 512 512" className="w-full h-full fill-current text-amber-300">
                    <path d="M 276 90 A 38 38 0 1 0 276 150 A 30 30 0 1 1 276 90 Z" />
                    <path d="M 256 140 C 220 180 200 210 200 260 L 312 260 C 312 210 292 180 256 140 Z" fill="#ffffff" />
                    <path d="M 170 300 C 190 280 230 310 256 325 C 282 310 322 280 342 300 C 362 320 330 360 256 400 C 182 360 150 320 170 300 Z" />
                  </svg>
                </div>
                <h5 className="font-bold text-base text-slate-900">UPZ Kecamatan Lembang</h5>
                <p className="text-slate-500 text-[11px]">
                  Aplikasi ringan (&lt; 2 MB), cepat, hemat kuota, dan dapat diakses offline saat sinyal minim.
                </p>
              </div>

              {/* iOS Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  Petunjuk Pengguna iPhone / iPad (iOS Safari):
                </span>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed text-[11px]">
                  <li>
                    Buka situs ini di browser <strong>Safari</strong> iPhone Anda.
                  </li>
                  <li>
                    Tekan tombol <strong>Bagikan (Share)</strong> <span className="inline-block p-1 bg-white border rounded">⎋ / Share</span> di bilah bawah browser.
                  </li>
                  <li>
                    Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                  </li>
                  <li>
                    Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi UPZ Lembang akan langsung muncul di layar utama HP Anda!
                  </li>
                </ol>
              </div>

              {/* Android Guide / Direct Button */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-950 block text-xs">
                  Petunjuk Pengguna Android (Chrome / Edge):
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Jika tombol install otomatis muncul, klik tombol di bawah untuk langsung menambahkan ke layar HP Anda. Jika tidak, tekan menu titik tiga (⋮) di Chrome lalu pilih <strong>"Instal Aplikasi" / "Tambahkan ke Layar Utama"</strong>.
                </p>

                {isInstallable && (
                  <button
                    onClick={async () => {
                      await install();
                      handleClose();
                    }}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Pasang Aplikasi di Android Sekarang</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
