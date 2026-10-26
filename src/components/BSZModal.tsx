import React, { useRef } from 'react';
import {
  CheckCircle2,
  Printer,
  Download,
  Share2,
  X,
  ShieldCheck,
  QrCode,
  Building2,
  Send,
} from 'lucide-react';
import { formatRupiah } from '../utils/zakatCalculator';

interface BSZModalProps {
  donation: any;
  onClose: () => void;
  openNotificationFeed: () => void;
}

export const BSZModal: React.FC<BSZModalProps> = ({
  donation,
  onClose,
  openNotificationFeed,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const donorDisplayName = donation.isAnonymous ? 'Hamba Allah (Anonim)' : donation.donorName;
  const bszNumber = donation.bszNumber || `UPZ-LMB-${donation.id}`;
  const verifiedDate = donation.verifiedAt || new Date().toLocaleString('id-ID');

  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `*Bukti Setor Zakat (BSZ) Resmi UPZ Kec. Lembang*\nNo: ${bszNumber}\nMuzakki: ${donorDisplayName}\nNominal: Rp ${donation.amount.toLocaleString('id-ID')}\nStatus: Terverifikasi Sah oleh BAZNAS KBB.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden print:border-none print:shadow-none animate-fadeIn">
        {/* Top Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 bg-emerald-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Bukti Setor Zakat (BSZ) Resmi Terbit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Official Certificate Content */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 bg-white text-slate-800">
          {/* Certificate Official Letterhead (KOP Resmi) */}
          <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center p-2.5 shadow-sm">
                <Building2 className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  BADAN AMIL ZAKAT NASIONAL (BAZNAS) KAB. BANDUNG BARAT
                </h3>
                <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  UNIT PENGUMPUL ZAKAT (UPZ) KECAMATAN LEMBANG
                </h2>
                <p className="text-[11px] text-slate-500">
                  Gedung Dakwah & KUA Lembang, Jl. Raya Lembang No. 238, Kab. Bandung Barat 40391
                </p>
              </div>
            </div>

            {/* Official Badge */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 uppercase">
                SURAT SETORAN SAH
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">UU No. 23/2011</p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-wider uppercase underline decoration-emerald-600 decoration-2">
              BUKTI SETOR ZAKAT (BSZ)
            </h1>
            <p className="text-xs font-mono font-semibold text-emerald-800">
              NOMOR REGISTRASI: {bszNumber}
            </p>
          </div>

          {/* Statement of Receipt */}
          <p className="text-xs text-slate-600 text-justify leading-relaxed">
            Telah diterima titipan dana zakat / infaq / sedekah dari Muzakki / Munfiq di bawah ini dengan rincian yang sah dan tercatat pada basis data terpusat UPZ Kecamatan Lembang:
          </p>

          {/* Data Table */}
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-3 p-2.5 bg-slate-50">
              <span className="font-semibold text-slate-500">Nama Muzakki</span>
              <span className="col-span-2 font-bold text-slate-900">{donorDisplayName}</span>
            </div>
            <div className="grid grid-cols-3 p-2.5">
              <span className="font-semibold text-slate-500">Jenis Setoran</span>
              <span className="col-span-2 font-bold text-emerald-800">{donation.category}</span>
            </div>
            <div className="grid grid-cols-3 p-2.5 bg-slate-50">
              <span className="font-semibold text-slate-500">Nominal Zakat / Infaq</span>
              <span className="col-span-2 font-black text-slate-950 text-sm">
                {formatRupiah(donation.amount)}
              </span>
            </div>
            <div className="grid grid-cols-3 p-2.5">
              <span className="font-semibold text-slate-500">Waktu Verifikasi</span>
              <span className="col-span-2 text-slate-700">{verifiedDate} WIB</span>
            </div>
            <div className="grid grid-cols-3 p-2.5 bg-slate-50">
              <span className="font-semibold text-slate-500">Kanal Pembayaran</span>
              <span className="col-span-2 text-slate-700 font-semibold">{donation.paymentMethod}</span>
            </div>
            <div className="grid grid-cols-3 p-2.5">
              <span className="font-semibold text-slate-500">Tanda Tangan Digital</span>
              <span className="col-span-2 font-mono text-[10px] text-slate-600 break-all">
                {donation.digitalSignature || 'SIG-UPZ-LMB-9B7C1A-VERIFIED'}
              </span>
            </div>
          </div>

          {/* Doa Amil untuk Muzakki */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
              Doa Amil untuk Muzakki (QS. At-Taubah: 103)
            </span>
            <p className="font-arabic text-lg font-bold text-emerald-950">
              آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيْمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوْرًا
            </p>
            <p className="text-[11px] italic text-slate-600 max-w-lg mx-auto">
              "Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang engkau sisakan, dan menjadikannya pembersih bagimu."
            </p>
          </div>

          {/* Validation QR & Amil Seal */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
            {/* Digital QR Validation */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-700 block">QR Verifikasi Keabsahan</span>
                <span>Pindai untuk memverifikasi</span>
                <span className="block text-emerald-700 font-semibold">upzlembang.org/cek-bsz</span>
              </div>
            </div>

            {/* Official Stamp & Sign */}
            <div className="text-right space-y-1">
              <span className="text-[11px] text-slate-500 block">Lembang, Kab. Bandung Barat</span>
              <div className="inline-block relative py-1">
                {/* Simulated Digital Stamp */}
                <div className="border-2 border-emerald-700 text-emerald-800 rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider rotate-[-2deg] bg-emerald-50/90 shadow-2xs">
                  UNIT PENGUMPUL ZAKAT<br />KECAMATAN LEMBANG<br />★ TERVERIFIKASI SAH ★
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900 block">Drs. H. Agus Sutisna</span>
              <span className="text-[10px] text-slate-500 block">Ketua UPZ Kec. Lembang</span>
            </div>
          </div>
        </div>

        {/* Bottom Modal Actions (Hidden on Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={openNotificationFeed}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-200 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Lihat Log Notifikasi WA & Telegram</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
