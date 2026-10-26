import React, { useState, useEffect } from 'react';
import {
  Heart,
  QrCode,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Send,
  Download,
  Printer,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatRupiah } from '../utils/zakatCalculator';

interface DonationSectionProps {
  onSuccessfulDonation: (donationData: any) => void;
  openNotificationFeed: () => void;
  presetAmount?: number;
  presetCategory?: string;
}

export const DonationSection: React.FC<DonationSectionProps> = ({
  onSuccessfulDonation,
  openNotificationFeed,
  presetAmount,
  presetCategory,
}) => {
  const categories = [
    { id: 'Zakat Penghasilan', label: 'Zakat Penghasilan', desc: 'Wajib bagi profesi/gaji yang telah mencapai nisab bulanan.' },
    { id: 'Zakat Maal', label: 'Zakat Maal (Harta/Emas)', desc: 'Zakat simpanan, emas, & perniagaan haul 1 tahun.' },
    { id: 'Zakat Fitrah', label: 'Zakat Fitrah', desc: 'Rp 45.000 / jiwa (2.5 kg beras standar Lembang).' },
    { id: 'Infaq & Sedekah', label: 'Infaq & Sedekah', desc: 'Sedekah umum untuk kemaslahatan umat & dhuafa.' },
    { id: 'Wakaf Tunai', label: 'Wakaf Tunai Produktif', desc: 'Pemberdayaan aset abadi produktif di Kecamatan Lembang.' },
    { id: 'Program Bencana & Peduli', label: 'Lembang Tanggap Bencana', desc: 'Bantuan rutilahu, lansia & mitigasi kebencanaan.' },
  ];

  const nominalPresets = [50000, 100000, 250000, 500000, 1000000, 2500000];

  const [selectedCategory, setSelectedCategory] = useState<string>(presetCategory || 'Zakat Penghasilan');
  const [amount, setAmount] = useState<number>(presetAmount || 250000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorPhone, setDonorPhone] = useState<string>('081234567890');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'VA_BSI' | 'VA_BJB_SYARIAH' | 'VA_MANDIRI' | 'VA_BRI' | 'EWALLET_GOPAY'>('QRIS');
  const [showAkad, setShowAkad] = useState<boolean>(true);

  // Transaction State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTransaction, setActiveTransaction] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (presetAmount) {
      setAmount(presetAmount);
      setCustomAmountInput(String(presetAmount));
    }
  }, [presetAmount]);

  useEffect(() => {
    if (presetCategory) {
      setSelectedCategory(presetCategory);
    }
  }, [presetCategory]);

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmountInput('');
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountInput(raw);
    const num = parseInt(raw, 10);
    setAmount(isNaN(num) ? 0 : num);
  };

  // Niat / Akad text based on category
  const getNiatText = () => {
    if (selectedCategory.includes('Zakat')) {
      return {
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakata maali fardhan lillahi ta'ala.",
        meaning: "Aku niat mengeluarkan zakat hartaku, fardhu karena Allah Ta'ala.",
      };
    }
    if (selectedCategory.includes('Wakaf')) {
      return {
        arabic: "نَوَيْتُ أَنْ أَقِفَ هَذَا الْمَالَ لِلَّهِ تَعَالَى",
        latin: "Nawaitu an aqifa hadzal maala lillahi ta'ala.",
        meaning: "Aku berniat mewakafkan harta ini karena Allah Ta'ala untuk kemaslahatan umat.",
      };
    }
    return {
      arabic: "نَوَيْتُ أَنْ أَتَصَدَّقَ تَقَرُّبًا إِلَى اللَّهِ تَعَالَى",
      latin: "Nawaitu an atashaddaqo taqorruban ilallahi ta'ala.",
      meaning: "Aku niat bersedekah untuk mendekatkan diri kepada Allah Ta'ala.",
    };
  };

  const niat = getNiatText();

  // Create Donation Request
  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount < 10000) {
      setErrorMsg('Nominal donasi minimal Rp 10.000');
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      setErrorMsg('Silakan isi nama Anda atau pilih opsi Hamba Allah (Anonim).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          amount,
          donorName: isAnonymous ? 'Hamba Allah' : donorName,
          donorPhone,
          donorEmail,
          isAnonymous,
          doaAkad: niat.meaning,
          paymentMethod,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setActiveTransaction(result.data);
      } else {
        setErrorMsg(result.error || 'Terjadi kesalahan saat memproses donasi.');
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server donasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automated Payment Verification Trigger
  const handleSimulateAutoVerify = async () => {
    if (!activeTransaction) return;
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/donations/${activeTransaction.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        onSuccessfulDonation(result.data);
      } else {
        setErrorMsg(result.error || 'Verifikasi gagal');
      }
    } catch (err: any) {
      setErrorMsg('Gagal memverifikasi transaksi.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="donasi" className="py-16 bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
            Layanan Zakat & Donasi Online
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Tunaikan Zakat & Infaq di UPZ Lembang
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Penyaluran terverifikasi, amanah, dan terdistribusi adil ke 8 asnaf di 16 desa se-Kecamatan Lembang dengan verifikasi pembayaran otomatis.
          </p>
        </div>

        {/* Donation Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100/80 overflow-hidden">
          {/* If Active Transaction Awaiting Payment */}
          {activeTransaction ? (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Status */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Menunggu Pembayaran</h3>
                <p className="text-xs text-slate-500">
                  ID Transaksi: <strong className="text-slate-700">{activeTransaction.id}</strong> • Kategori: <strong className="text-emerald-700">{activeTransaction.category}</strong>
                </p>
                <div className="text-3xl font-black text-emerald-700 pt-1">
                  Rp {activeTransaction.amount.toLocaleString('id-ID')}
                </div>
              </div>

              {/* QRIS / Virtual Account Display */}
              {activeTransaction.paymentMethod === 'QRIS' ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-800 shadow-2xs border border-slate-200">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QRIS Standar Bank Indonesia & BAZNAS</span>
                  </div>

                  {/* Dynamic Interactive QRIS Visual */}
                  <div className="mx-auto w-64 h-64 bg-white p-4 rounded-xl border-2 border-slate-800 shadow-md flex flex-col items-center justify-center relative">
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                      {/* Realistic SVG QRIS pattern representation */}
                      <svg viewBox="0 0 100 100" className="w-48 h-48">
                        <rect width="100" height="100" fill="white" />
                        {/* Position markers */}
                        <rect x="5" y="5" width="25" height="25" fill="#000" />
                        <rect x="9" y="9" width="17" height="17" fill="#fff" />
                        <rect x="13" y="13" width="9" height="9" fill="#000" />

                        <rect x="70" y="5" width="25" height="25" fill="#000" />
                        <rect x="74" y="9" width="17" height="17" fill="#fff" />
                        <rect x="78" y="13" width="9" height="9" fill="#000" />

                        <rect x="5" y="70" width="25" height="25" fill="#000" />
                        <rect x="9" y="74" width="17" height="17" fill="#fff" />
                        <rect x="13" y="78" width="9" height="9" fill="#000" />

                        {/* Data matrix dots */}
                        <circle cx="45" cy="15" r="3" fill="#047857" />
                        <circle cx="55" cy="25" r="3" fill="#047857" />
                        <circle cx="40" cy="40" r="3" fill="#000" />
                        <circle cx="60" cy="40" r="3" fill="#000" />
                        <circle cx="45" cy="50" r="4" fill="#d97706" />
                        <circle cx="55" cy="65" r="3" fill="#000" />
                        <circle cx="75" cy="50" r="3" fill="#047857" />
                        <circle cx="85" cy="65" r="3" fill="#000" />
                        <circle cx="75" cy="80" r="3" fill="#000" />
                        <circle cx="45" cy="85" r="3" fill="#047857" />
                        <circle cx="60" cy="85" r="3" fill="#000" />
                        <circle cx="20" cy="45" r="3" fill="#000" />
                        <circle cx="20" cy="55" r="3" fill="#047857" />
                      </svg>
                      <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase mt-1">
                        UPZ KEC. LEMBANG
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Dapat di-scan menggunakan seluruh aplikasi mobile banking (BCA, Mandiri, BRI, BSI, BJB) dan e-wallet (GoPay, OVO, ShopeePay, DANA).
                  </p>
                </div>
              ) : (
                /* Virtual Account / Bank Transfer Display */
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Nomor Virtual Account Resmi:</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {activeTransaction.paymentMethod.replace('VA_', 'Bank ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-900">
                      {activeTransaction.paymentReference}
                    </span>
                    <button
                      onClick={() => handleCopyCode(activeTransaction.paymentReference)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Tersalin' : 'Salin VA'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Atas Nama Rekening: <strong>UPZ KECAMATAN LEMBANG KBB</strong>. Pembayaran akan terverifikasi secara otomatis oleh sistem kami.
                  </p>
                </div>
              )}

              {/* Automated Verification Action Callout */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-950">Fitur Verifikasi Pembayaran Otomatis</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem payment gateway kami memantau transaksi secara real-time. Jika Anda telah melakukan pembayaran (atau ingin menguji sistem verifikasi otomatis sekarang), klik tombol di bawah untuk menerbitkan <strong>Bukti Setor Zakat (BSZ)</strong> resmi ber-barcode dan mengirim notifikasi instan ke WhatsApp & Telegram.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleSimulateAutoVerify}
                    disabled={isVerifying}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Memverifikasi Transaksi...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Simulasi Pembayaran Berhasil (Verifikasi Otomatis)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTransaction(null)}
                    className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    Ubah Donasi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Donation Input Form */
            <form onSubmit={handleSubmitDonation} className="p-6 sm:p-8 space-y-8">
              {/* 1. Category Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Pilih Kategori ZIS / Donasi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${selectedCategory === cat.id ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {cat.label}
                        </span>
                        {selectedCategory === cat.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Amount Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Pilih Nominal Donasi
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {nominalPresets.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => handleSelectPreset(val)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        amount === val && !customAmountInput
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={customAmountInput}
                    onChange={handleCustomInput}
                    placeholder="Atau masukkan nominal kustom lainnya (min. Rp 10.000)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* 3. Muzakki Profile & Privacy */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Identitas Muzakki & Kerahasiaan Data (E2E Encrypted)
                </label>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Sembunyikan Nama (Hamba Allah)</span>
                      <span className="text-[11px] text-slate-500 block">
                        Nama Anda akan disamarkan sebagai "Hamba Allah" di laporan transparansi publik.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAnonymous ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isAnonymous ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!isAnonymous && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap Muzakki *
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Contoh: H. Ahmad Supriyadi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  <div className={isAnonymous ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp (Untuk kirim BSZ & Doa Amil) *
                    </label>
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Doa / Akad Zakat Digital */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Lafadz Niat & Akad Zakat Sah
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAkad(!showAkad)}
                    className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline"
                  >
                    {showAkad ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>

                {showAkad && (
                  <div className="space-y-2 pt-1 text-center sm:text-left">
                    <p className="font-arabic text-xl sm:text-2xl text-emerald-950 font-bold leading-relaxed text-right sm:text-center py-1">
                      {niat.arabic}
                    </p>
                    <p className="text-xs italic text-amber-950 font-medium">
                      "{niat.latin}"
                    </p>
                    <p className="text-xs text-slate-700">
                      <strong>Artinya:</strong> {niat.meaning}
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Payment Channel Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  4. Pilihan Metode Pembayaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                      paymentMethod === 'QRIS'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">QRIS Otomatis</span>
                      <span className="text-[10px] text-slate-500">BCA, Mandiri, GoPay, OVO</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VA_BSI')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                      paymentMethod === 'VA_BSI'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">BSI Syariah VA</span>
                      <span className="text-[10px] text-slate-500">Virtual Account Syariah</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VA_BJB_SYARIAH')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                      paymentMethod === 'VA_BJB_SYARIAH'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">Bank BJB Syariah</span>
                      <span className="text-[10px] text-slate-500">Khas Jawa Barat & KBB</span>
                    </div>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 active:scale-99 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyiapkan Transaksi...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 fill-amber-300 text-amber-300" />
                      <span>Lanjutkan Pembayaran — {formatRupiah(amount)}</span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data terenkripsi End-to-End & Dilindungi UU Pengelolaan Zakat No. 23 Th 2011</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
