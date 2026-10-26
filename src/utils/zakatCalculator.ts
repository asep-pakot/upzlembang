/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Zakat Calculator & Standards for UPZ Kecamatan Lembang, Kab. Bandung Barat
 * Sesuai Fatwa MUI & Keputusan BAZNAS Kab. Bandung Barat
 */

export interface ZakatSettings {
  goldPricePerGram: number; // in IDR (e.g., 1.450.000)
  ricePricePerKg: number;   // in IDR (e.g., 15.000)
  fidyahRatePerDay: number; // in IDR (e.g., 30.000)
  fitrahRatePerPerson: number; // in IDR (e.g., 45.000 = 2.5 kg/3.5 ltr beras)
}

export const DEFAULT_ZAKAT_SETTINGS: ZakatSettings = {
  goldPricePerGram: 1450000,
  ricePricePerKg: 15000,
  fidyahRatePerDay: 30000,
  fitrahRatePerPerson: 45000, // 2.5 kg x Rp 18.000 / beras kualitas baik Lembang
};

/**
 * Nisab Zakat Maal & Penghasilan adalah 85 gram emas per tahun
 */
export function calculateAnnualNisab(goldPrice: number = DEFAULT_ZAKAT_SETTINGS.goldPricePerGram): number {
  return 85 * goldPrice;
}

/**
 * Nisab Zakat Penghasilan per bulan (Nisab tahunan dibagi 12)
 */
export function calculateMonthlyNisab(goldPrice: number = DEFAULT_ZAKAT_SETTINGS.goldPricePerGram): number {
  return Math.round((85 * goldPrice) / 12);
}

export interface ZakatIncomeParams {
  monthlyIncome: number;
  otherMonthlyIncome?: number;
  monthlyExpenses?: number;
  goldPrice?: number;
}

export interface ZakatCalculationResult {
  isWajib: boolean;
  totalAssetsOrIncome: number;
  netBase: number;
  nisabThreshold: number;
  zakatDue: number;
  explanation: string;
}

/**
 * Hitung Zakat Penghasilan / Profesi (2.5%)
 */
export function calculateZakatIncome({
  monthlyIncome,
  otherMonthlyIncome = 0,
  monthlyExpenses = 0,
  goldPrice = DEFAULT_ZAKAT_SETTINGS.goldPricePerGram,
}: ZakatIncomeParams): ZakatCalculationResult {
  const totalIncome = Math.max(0, monthlyIncome + otherMonthlyIncome);
  const netIncome = Math.max(0, totalIncome - monthlyExpenses);
  const monthlyNisab = calculateMonthlyNisab(goldPrice);

  const isWajib = netIncome >= monthlyNisab;
  const zakatDue = isWajib ? Math.round(netIncome * 0.025) : 0;

  return {
    isWajib,
    totalAssetsOrIncome: totalIncome,
    netBase: netIncome,
    nisabThreshold: monthlyNisab,
    zakatDue,
    explanation: isWajib
      ? `Penghasilan bersih (Rp ${netIncome.toLocaleString('id-ID')}) telah melampaui nisab bulanan setara 85g emas/12 (Rp ${monthlyNisab.toLocaleString('id-ID')}). Wajib zakat 2.5%.`
      : `Penghasilan bersih (Rp ${netIncome.toLocaleString('id-ID')}) belum mencapai nisab bulanan (Rp ${monthlyNisab.toLocaleString('id-ID')}). Anda disarankan berinfaq/sedekah sukarela.`,
  };
}

export interface ZakatMaalParams {
  cashAndSavings: number;
  goldAndSilverValue: number;
  otherInvestments?: number;
  debtsDueNow?: number;
  goldPrice?: number;
}

/**
 * Hitung Zakat Maal (Tabungan, Emas, Investasi) haul 1 tahun (2.5%)
 */
export function calculateZakatMaal({
  cashAndSavings,
  goldAndSilverValue,
  otherInvestments = 0,
  debtsDueNow = 0,
  goldPrice = DEFAULT_ZAKAT_SETTINGS.goldPricePerGram,
}: ZakatMaalParams): ZakatCalculationResult {
  const totalAssets = Math.max(0, cashAndSavings + goldAndSilverValue + otherInvestments);
  const netAssets = Math.max(0, totalAssets - debtsDueNow);
  const annualNisab = calculateAnnualNisab(goldPrice);

  const isWajib = netAssets >= annualNisab;
  const zakatDue = isWajib ? Math.round(netAssets * 0.025) : 0;

  return {
    isWajib,
    totalAssetsOrIncome: totalAssets,
    netBase: netAssets,
    nisabThreshold: annualNisab,
    zakatDue,
    explanation: isWajib
      ? `Harta yang telah tersimpan 1 tahun (Rp ${netAssets.toLocaleString('id-ID')}) telah melampaui nisab 85g emas (Rp ${annualNisab.toLocaleString('id-ID')}). Wajib zakat maal 2.5%.`
      : `Harta simpanan (Rp ${netAssets.toLocaleString('id-ID')}) belum mencapai nisab 85g emas (Rp ${annualNisab.toLocaleString('id-ID')}). Anda belum wajib zakat maal, namun dianjurkan infaq/sedekah.`,
  };
}

/**
 * Hitung Zakat Fitrah berdasarkan jumlah jiwa
 */
export function calculateZakatFitrah(personCount: number, ratePerPerson: number = DEFAULT_ZAKAT_SETTINGS.fitrahRatePerPerson): number {
  const count = Math.max(0, Math.floor(personCount));
  return count * ratePerPerson;
}

/**
 * Hitung Fidyah puasa
 */
export function calculateFidyah(daysCount: number, ratePerDay: number = DEFAULT_ZAKAT_SETTINGS.fidyahRatePerDay): number {
  const days = Math.max(0, Math.floor(daysCount));
  return days * ratePerDay;
}

/**
 * Format Angka ke Rupiah Indonesia
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
