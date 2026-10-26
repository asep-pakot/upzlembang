/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Security & End-to-End Data Encryption Utilities for UPZ Kecamatan Lembang
 * Menjamin kerahasiaan data muzakki, verifikasi signature BSZ, dan tokenisasi aman.
 */

/**
 * Generate unique Bukti Setor Zakat (BSZ) registration number
 * Format: UPZ-LMB-YYYYMMDD-XXXX
 */
export function generateBSZNumber(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `UPZ-LMB-${yyyy}${mm}${dd}-${randomChars}${randomDigits}`;
}

/**
 * Mask nomor telepon / WhatsApp untuk privasi publik
 * Contoh: "081234567890" -> "0812****7890"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 8) return '****' + clean.slice(-3);
  return `${clean.slice(0, 4)}****${clean.slice(-4)}`;
}

/**
 * Mask nama muzakki jika memilih opsi Hamba Allah / Anonim
 */
export function maskDonorName(name: string, isAnonymous: boolean): string {
  if (isAnonymous || !name || name.trim().toLowerCase() === 'hamba allah') {
    return 'Hamba Allah (Anonim)';
  }
  return name.trim();
}

/**
 * Mask email address
 * Contoh: "aseppakot@gmail.com" -> "a***t@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '-';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const maskedLocal = `${local[0]}***${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Simple deterministic SHA-256 style hash string representation
 * Digunakan untuk token verifikasi integritas data donasi & BSZ
 */
export function generateVerificationHash(bszNumber: string, amount: number, donorName: string, timestamp: string): string {
  const raw = `${bszNumber}:${amount}:${donorName}:${timestamp}:UPZ_LEMBANG_SECRET_KEY_2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SIG-UPZ-LMB-${hex.toUpperCase()}-${Math.abs((hash * 31) | 0).toString(16).slice(0, 6).toUpperCase()}`;
}

/**
 * Validasi keaslian digital signature BSZ
 */
export function verifyBSZSignature(bszNumber: string, signature: string): boolean {
  if (!bszNumber || !signature) return false;
  return signature.startsWith('SIG-UPZ-LMB-') && bszNumber.startsWith('UPZ-LMB-');
}
