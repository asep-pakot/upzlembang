import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAnnualNisab,
  calculateMonthlyNisab,
  calculateZakatIncome,
  calculateZakatMaal,
  calculateZakatFitrah,
  calculateFidyah,
  formatRupiah,
} from './zakatCalculator';
import {
  generateBSZNumber,
  maskPhoneNumber,
  maskDonorName,
  maskEmail,
  generateVerificationHash,
  verifyBSZSignature,
} from './security';

test('Zakat Nisab calculation correctly calculates 85g gold equivalent', () => {
  const goldPrice = 1450000;
  const annualNisab = calculateAnnualNisab(goldPrice);
  assert.equal(annualNisab, 85 * 1450000); // 123.250.000
  const monthlyNisab = calculateMonthlyNisab(goldPrice);
  assert.equal(monthlyNisab, Math.round((85 * 1450000) / 12)); // 10.270.833
});

test('calculateZakatIncome determines wajib or tidak based on monthly nisab threshold', () => {
  const goldPrice = 1000000; // Nisab = 85.000.000 / 12 = 7.083.333
  const underNisab = calculateZakatIncome({
    monthlyIncome: 6000000,
    monthlyExpenses: 1000000,
    goldPrice,
  });
  assert.equal(underNisab.isWajib, false);
  assert.equal(underNisab.zakatDue, 0);

  const aboveNisab = calculateZakatIncome({
    monthlyIncome: 12000000,
    monthlyExpenses: 2000000,
    goldPrice,
  });
  assert.equal(aboveNisab.isWajib, true);
  // Net = 10.000.000 -> 2.5% = 250.000
  assert.equal(aboveNisab.zakatDue, 250000);
});

test('calculateZakatMaal calculates 2.5% on annual assets exceeding 85g gold', () => {
  const goldPrice = 1000000; // Nisab = 85.000.000
  const result = calculateZakatMaal({
    cashAndSavings: 50000000,
    goldAndSilverValue: 50000000,
    debtsDueNow: 10000000,
    goldPrice,
  });
  // Net = 90.000.000 >= 85.000.000
  assert.equal(result.isWajib, true);
  assert.equal(result.zakatDue, Math.round(90000000 * 0.025)); // 2.250.000
});

test('calculateZakatFitrah and Fidyah scale with family/day counts', () => {
  assert.equal(calculateZakatFitrah(4, 45000), 180000);
  assert.equal(calculateFidyah(10, 30000), 300000);
});

test('formatRupiah produces standard Indonesian currency format', () => {
  const formatted = formatRupiah(1500000);
  assert.ok(formatted.includes('1.500.000'));
});

test('Security module masks sensitive donor information correctly', () => {
  assert.equal(maskPhoneNumber('081234567890'), '0812****7890');
  assert.equal(maskEmail('aseppakot@gmail.com'), 'a***t@gmail.com');
  assert.equal(maskDonorName('Ahmad Dahlan', false), 'Ahmad Dahlan');
  assert.equal(maskDonorName('Ahmad Dahlan', true), 'Hamba Allah (Anonim)');
});

test('BSZ generation and cryptographic verification hash', () => {
  const bsz = generateBSZNumber();
  assert.ok(bsz.startsWith('UPZ-LMB-'));
  const sig = generateVerificationHash(bsz, 500000, 'Muzakki Lembang', '2026-10-25');
  assert.ok(sig.startsWith('SIG-UPZ-LMB-'));
  assert.equal(verifyBSZSignature(bsz, sig), true);
  assert.equal(verifyBSZSignature('INVALID', 'INVALID'), false);
});
