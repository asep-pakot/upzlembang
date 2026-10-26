import React, { useState } from 'react';
import {
  Calculator,
  X,
  Coins,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  DEFAULT_ZAKAT_SETTINGS,
  calculateAnnualNisab,
  calculateMonthlyNisab,
  calculateZakatIncome,
  calculateZakatMaal,
  calculateZakatFitrah,
  calculateFidyah,
  formatRupiah,
} from '../utils/zakatCalculator';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyZakat: (amount: number, category: string) => void;
}

export const ZakatCalculatorModal: React.FC<ZakatCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyZakat,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'income' | 'maal' | 'fitrah' | 'fidyah'>('income');
  const [goldPrice, setGoldPrice] = useState<number>(DEFAULT_ZAKAT_SETTINGS.goldPricePerGram);

  // Income Calculator States
  const [monthlySalary, setMonthlySalary] = useState<number>(12000000);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [monthlyNeeds, setMonthlyNeeds] = useState<number>(2000000);

  // Maal Calculator States
  const [cashSavings, setCashSavings] = useState<number>(100000000);
  const [goldGrams, setGoldGrams] = useState<number>(25);
  const [investments, setInvestments] = useState<number>(30000000);
  const [debtsDue, setDebtsDue] = useState<number>(5000000);

  // Fitrah & Fidyah States
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [fidyahDays, setFidyahDays] = useState<number>(7);

  // Calculations
  const incomeResult = calculateZakatIncome({
    monthlyIncome: monthlySalary,
    otherMonthlyIncome: otherIncome,
    monthlyExpenses: monthlyNeeds,
    goldPrice,
  });

  const maalResult = calculateZakatMaal({
    cashAndSavings: cashSavings,
    goldAndSilverValue: goldGrams * goldPrice,
    otherInvestments: investments,
    debtsDueNow: debtsDue,
    goldPrice,
  });

  const fitrahTotal = calculateZakatFitrah(familyMembers);
  const fidyahTotal = calculateFidyah(fidyahDays);

  const handleApplyCurrent = () => {
    if (activeTab === 'income') {
      onApplyZakat(incomeResult.zakatDue > 0 ? incomeResult.zakatDue : 100000, 'Zakat Penghasilan');
    } else if (activeTab === 'maal') {
      onApplyZakat(maalResult.zakatDue > 0 ? maalResult.zakatDue : 250000, 'Zakat Maal');
    } else if (activeTab === 'fitrah') {
      onApplyZakat(fitrahTotal, 'Zakat Fitrah');
    } else {
      onApplyZakat(fidyahTotal, 'Infaq & Sedekah');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Kalkulator Zakat Standar BAZNAS</h3>
              <p className="text-xs text-emerald-200">
                Unit Pengumpul Zakat (UPZ) Kecamatan Lembang Kab. Bandung Barat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-700/60 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition ${
              activeTab === 'income'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Zakat Penghasilan
          </button>
          <button
            onClick={() => setActiveTab('maal')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition ${
              activeTab === 'maal'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Zakat Maal / Harta
          </button>
          <button
            onClick={() => setActiveTab('fitrah')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition ${
              activeTab === 'fitrah'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Zakat Fitrah
          </button>
          <button
            onClick={() => setActiveTab('fidyah')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition ${
              activeTab === 'fidyah'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Fidyah Puasa
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Gold Benchmark Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span className="text-amber-900 font-semibold">Patokan Nisab Emas Terkini:</span>
              <strong className="text-amber-950">Rp {goldPrice.toLocaleString('id-ID')} / gram</strong>
            </div>
            <span className="text-[11px] text-amber-800">
              Nisab 85g: <strong>Rp {calculateAnnualNisab(goldPrice).toLocaleString('id-ID')} / thn</strong>
            </span>
          </div>

          {/* TAB 1: ZAKAT PENGHASILAN */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gaji / Pendapatan Pokok Per Bulan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pendapatan Lain / Bonus / Tunjangan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={otherIncome}
                      onChange={(e) => setOtherIncome(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pengeluaran Kebutuhan Pokok / Utang Jatuh Tempo Per Bulan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={monthlyNeeds}
                      onChange={(e) => setMonthlyNeeds(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Income Calculation Result */}
              <div className={`p-4 rounded-2xl border ${incomeResult.isWajib ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Status Kewajiban:</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${incomeResult.isWajib ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    {incomeResult.isWajib ? 'WAJIB ZAKAT' : 'BELUM WAJIB ZAKAT'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-700">Kewajiban Zakat (2.5%):</span>
                  <span className="text-2xl font-black text-emerald-800">
                    {formatRupiah(incomeResult.zakatDue)} <span className="text-xs font-normal text-slate-500">/ bulan</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                  {incomeResult.explanation}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ZAKAT MAAL */}
          {activeTab === 'maal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Uang Tunai, Tabungan & Deposito (Rp)
                  </label>
                  <input
                    type="number"
                    value={cashSavings}
                    onChange={(e) => setCashSavings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Emas Simpanan (Gram)
                  </label>
                  <input
                    type="number"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Nilai: Rp {(goldGrams * goldPrice).toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Investasi / Saham / Aset Niaga (Rp)
                  </label>
                  <input
                    type="number"
                    value={investments}
                    onChange={(e) => setInvestments(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hutang / Cicilan Jatuh Tempo Saat Ini (Rp)
                  </label>
                  <input
                    type="number"
                    value={debtsDue}
                    onChange={(e) => setDebtsDue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Maal Result */}
              <div className={`p-4 rounded-2xl border ${maalResult.isWajib ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Status Nisab & Haul (1 Tahun):</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${maalResult.isWajib ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    {maalResult.isWajib ? 'WAJIB ZAKAT MAAL' : 'BELUM MENCAPAI NISAB'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-700">Kewajiban Zakat Maal (2.5%):</span>
                  <span className="text-2xl font-black text-emerald-800">
                    {formatRupiah(maalResult.zakatDue)} <span className="text-xs font-normal text-slate-500">/ tahun</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                  {maalResult.explanation}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ZAKAT FITRAH */}
          {activeTab === 'fitrah' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Jumlah Anggota Keluarga (Jiwa)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="w-12 text-center font-bold text-lg text-emerald-800 bg-white py-1 rounded-lg border border-slate-300">
                    {familyMembers}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Besaran standar BAZNAS KBB: <strong>Rp 45.000 / jiwa</strong> (setara 2,5 kg / 3,5 liter beras premium Lembang).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Total Zakat Fitrah Keluarga:</span>
                  <span className="text-xs text-slate-600">{familyMembers} Jiwa × Rp 45.000</span>
                </div>
                <span className="text-2xl font-black text-emerald-800">
                  {formatRupiah(fitrahTotal)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: FIDYAH */}
          {activeTab === 'fidyah' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Jumlah Hari Puasa yang Ditinggalkan (Hari)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={fidyahDays}
                    onChange={(e) => setFidyahDays(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="w-12 text-center font-bold text-lg text-emerald-800 bg-white py-1 rounded-lg border border-slate-300">
                    {fidyahDays}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tarif Fidyah Lembang: <strong>Rp 30.000 / hari / mustahik</strong> (1 mud beras + lauk pauk bergizi bagi fakir miskin).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Total Kewajiban Fidyah:</span>
                  <span className="text-xs text-slate-600">{fidyahDays} Hari × Rp 30.000</span>
                </div>
                <span className="text-2xl font-black text-emerald-800">
                  {formatRupiah(fidyahTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Tutup
          </button>
          <button
            onClick={handleApplyCurrent}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <span>Tunaikan Zakat Hasil Perhitungan Ini</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
