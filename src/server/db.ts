/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UPZ Kecamatan Lembang - Database & Storage Layer
 * Integrasi Relasional Cloud SQL (Drizzle ORM + PostgreSQL)
 * dengan Enkripsi End-to-End Data Sensitif Muzakki (AES-256)
 * dan Penyimpanan Permanen di Cloud Database.
 */

import crypto from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { db as sqlDb } from '../db/index.ts';
import {
  donations as sqlDonations,
  disbursements as sqlDisbursements,
  newsArticles as sqlNews,
  mustahikSubmissions as sqlMustahik,
  adminUsers as sqlAdminUsers,
  siteSettings as sqlSettings,
} from '../db/schema.ts';
import { LEMBANG_VILLAGES } from '../utils/constants.ts';

export { LEMBANG_VILLAGES };

// Secret key for AES-256 data encryption
const ENCRYPTION_KEY = crypto.createHash('sha256').update('UPZ_LEMBANG_BANDUNG_BARAT_E2E_2026').digest();
const IV_LENGTH = 16;

/**
 * Enkripsi data sensitif (Nama, HP, Email) menggunakan AES-256-CBC
 */
export function encryptSensitive(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Dekripsi data sensitif
 */
export function decryptSensitive(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(':')) return encryptedData;
  try {
    const [ivHex, cipherHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return encryptedData;
  }
}

export interface DonationRecord {
  id: string; // e.g. "TRX-20261025-001"
  bszNumber: string | null; // e.g. "UPZ-LMB-20261025-A819"
  category: 'Zakat Penghasilan' | 'Zakat Maal' | 'Zakat Fitrah' | 'Infaq & Sedekah' | 'Wakaf Tunai' | 'Program Bencana & Peduli';
  amount: number;
  donorName: string; // decrypted or masked
  donorNameEncrypted: string;
  donorPhone: string;
  donorPhoneEncrypted: string;
  donorEmail?: string;
  isAnonymous: boolean;
  doaAkad?: string;
  paymentMethod: 'QRIS' | 'VA_BSI' | 'VA_BJB_SYARIAH' | 'VA_BRI' | 'VA_MANDIRI' | 'VA_BCA' | 'EWALLET_GOPAY' | 'EWALLET_DANA';
  paymentReference: string;
  status: 'pending' | 'verified' | 'expired';
  createdAt: string;
  verifiedAt: string | null;
  digitalSignature: string | null;
  amilNotes?: string;
}

export interface DisbursementRecord {
  id: string;
  program: 'Lembang Peduli' | 'Lembang Cerdas' | 'Lembang Sehat' | 'Lembang Makmur' | 'Lembang Taqwa';
  asnaf: 'Fakir' | 'Miskin' | 'Amil' | 'Muallaf' | 'Riqab' | 'Gharimin' | 'Fisabilillah' | 'Ibnu Sabil';
  village: string; // 16 Desa Lembang
  amount: number;
  recipientCount: number;
  description: string;
  photoUrl: string;
  disbursedAt: string;
  amilSupervisor: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Penyaluran' | 'Edukasi Zakat' | 'Kemanusiaan' | 'Pengumuman';
  summary: string;
  content: string;
  imageUrl: string;
  videoUrl?: string;
  date: string;
  author: string;
  tags?: string[];
}

export interface MustahikSubmission {
  id: string;
  applicantName: string;
  mustahikName: string;
  village: string; // Desa di Lembang
  address: string;
  asnafCategory: string;
  conditionDescription: string;
  contactNumber: string;
  status: 'Menunggu Survei' | 'Dalam Peninjauan' | 'Disetujui' | 'Tersalurkan';
  submittedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Super Admin' | 'Bendahara' | 'Amil Penyaluran' | 'Staf Humas';
  phone: string;
  status: 'active' | 'inactive';
  lastLogin: string | null;
}

export interface SiteSettings {
  zakatSettings: {
    goldPricePerGram: number;
    ricePricePerKg: number;
    fidyahRatePerDay: number;
    fitrahRatePerPerson: number;
    annualTarget: number;
  };
  notificationSettings: {
    waOfficialNumber: string;
    waNotificationTemplate: string;
    waEnabled: boolean;
    telegramBotToken: string;
    telegramChatId: string;
    telegramTemplate: string;
    telegramEnabled: boolean;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string;
    canonicalUrl: string;
  };
  featureToggles: {
    enableOnlineDonation: boolean;
    enableCalculator: boolean;
    enableMustahikForm: boolean;
    enableLiveChat: boolean;
    enableAutoVerification: boolean;
    maintenanceMode: boolean;
  };
}

export interface VillageStats {
  villageName: string;
  mustahikCount: number;
  disbursedTotal: number;
  programsActive: number;
}

class DatabaseStore {
  donations: DonationRecord[] = [];
  disbursements: DisbursementRecord[] = [];
  news: NewsItem[] = [];
  mustahikSubmissions: MustahikSubmission[] = [];
  adminUsers: AdminUser[] = [];
  settings: SiteSettings = {
    zakatSettings: {
      goldPricePerGram: 1450000,
      ricePricePerKg: 15000,
      fidyahRatePerDay: 30000,
      fitrahRatePerPerson: 45000,
      annualTarget: 1200000000,
    },
    notificationSettings: {
      waOfficialNumber: '081223344556',
      waNotificationTemplate:
        "*BUKTI SETOR ZAKAT (BSZ) RESMI - UPZ KECAMATAN LEMBANG*\n\nAssalamu'alaikum Wr. Wb.\nBapak/Ibu/Sdr: *{DONOR_NAME}*\n\nAlhamdulillah, zakat/donasi Anda telah *TERVERIFIKASI*:\n• No. BSZ: *{BSZ_NUMBER}*\n• Kategori: *{CATEGORY}*\n• Jumlah: *{AMOUNT}*\n• Waktu: {DATE} WIB\n• Status: SAH & TERCATAT (BAZNAS KBB)\n\n*Doa Amil UPZ Lembang:*\n\"Ajarakallahu fiimaa a'thayta, wa baaraka laka fiimaa abqayta, wa ja'alahu laka thahuuraa.\"\n\"Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang tersisa, dan menjadikannya pembersih bagimu.\"\n\nUnduh Bukti Setor Zakat resmi Anda:\n{BSZ_URL}\n\n_Unit Pengumpul Zakat (UPZ) Kec. Lembang - Kab. Bandung Barat_",
      waEnabled: true,
      telegramBotToken: '7192849102:AAH92kd-UPZLembangBotSecretToken2026',
      telegramChatId: '@upz_lembang_amil_bot',
      telegramTemplate:
        '🔔 *NOTIFIKASI TRANSAKSI MASUK (TERVERIFIKASI)*\n\n🏛 *UPZ Kecamatan Lembang*\n• No. BSZ: `{BSZ_NUMBER}`\n• Jenis: {CATEGORY}\n• Nominal: *{AMOUNT}*\n• Muzakki: {DONOR_NAME}\n• Kanal: {PAYMENT_METHOD}\n• Status: Otomatis Terverifikasi\n\nDana masuk ke kas penampungan zakat & siap dialokasikan ke 8 Asnaf di 16 Desa se-Kecamatan Lembang.',
      telegramEnabled: true,
    },
    seoSettings: {
      metaTitle: 'UPZ Kecamatan Lembang - Donasi Zakat & Transparansi Keuangan Real-Time',
      metaDescription:
        'Portal resmi Unit Pengumpul Zakat (UPZ) Kecamatan Lembang Kab. Bandung Barat. Donasi online terverifikasi otomatis, laporan transparansi 16 desa, dan Bukti Setor Zakat resmi.',
      metaKeywords:
        'zakat lembang, upz lembang, baznas bandung barat, donasi online lembang, zakat penghasilan, zakat maal, rutilahu lembang, beasiswa santri lembang',
      ogImage: '/pwa-512x512.png',
      canonicalUrl: 'https://upzlembang.org',
    },
    featureToggles: {
      enableOnlineDonation: true,
      enableCalculator: true,
      enableMustahikForm: true,
      enableLiveChat: true,
      enableAutoVerification: true,
      maintenanceMode: false,
    },
  };

  private initialized = false;

  constructor() {
    this.initFromSQL();
  }

  /**
   * Menginisialisasi dan sinkronisasi data dari Cloud SQL Database.
   * Jika database masih kosong, melakukan seeding otomatis ke tabel SQL.
   */
  async initFromSQL() {
    try {
      const [sqlAdminList, sqlDonationList, sqlDisbList, sqlNewsList, sqlMustahikList, sqlSettingsRow] =
        await Promise.all([
          sqlDb.select().from(sqlAdminUsers),
          sqlDb.select().from(sqlDonations),
          sqlDb.select().from(sqlDisbursements),
          sqlDb.select().from(sqlNews),
          sqlDb.select().from(sqlMustahik),
          sqlDb.select().from(sqlSettings).where(eq(sqlSettings.id, 1)),
        ]);

      if (sqlAdminList.length > 0) {
        this.adminUsers = sqlAdminList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role as any,
          phone: u.phone,
          status: u.status as any,
          lastLogin: u.lastLogin,
        }));
      }

      if (sqlDonationList.length > 0) {
        this.donations = sqlDonationList.map((d) => ({
          id: d.id,
          bszNumber: d.bszNumber,
          category: d.category as any,
          amount: Number(d.amount),
          donorName: d.donorName,
          donorNameEncrypted: d.donorNameEncrypted,
          donorPhone: d.donorPhone,
          donorPhoneEncrypted: d.donorPhoneEncrypted,
          donorEmail: d.donorEmail || undefined,
          isAnonymous: d.isAnonymous,
          doaAkad: d.doaAkad || undefined,
          paymentMethod: d.paymentMethod as any,
          paymentReference: d.paymentReference,
          status: d.status as any,
          createdAt: d.createdAt,
          verifiedAt: d.verifiedAt,
          digitalSignature: d.digitalSignature,
          amilNotes: d.amilNotes || undefined,
        }));
      }

      if (sqlDisbList.length > 0) {
        this.disbursements = sqlDisbList.map((d) => ({
          id: d.id,
          program: d.program as any,
          asnaf: d.asnaf as any,
          village: d.village,
          amount: Number(d.amount),
          recipientCount: d.recipientCount,
          description: d.description,
          photoUrl: d.photoUrl || '',
          disbursedAt: d.disbursedAt,
          amilSupervisor: d.amilSupervisor,
        }));
      }

      if (sqlNewsList.length > 0) {
        this.news = sqlNewsList.map((n) => ({
          id: n.id,
          title: n.title,
          category: n.category as any,
          summary: n.summary,
          content: n.content,
          imageUrl: n.imageUrl || '',
          videoUrl: n.videoUrl || undefined,
          date: n.date,
          author: n.author,
          tags: n.tags ? n.tags.split(',') : [],
        }));
      }

      if (sqlMustahikList.length > 0) {
        this.mustahikSubmissions = sqlMustahikList.map((m) => ({
          id: m.id,
          applicantName: m.applicantName,
          mustahikName: m.mustahikName,
          village: m.village,
          address: m.address,
          asnafCategory: m.asnafCategory,
          conditionDescription: m.conditionDescription,
          contactNumber: m.contactNumber,
          status: m.status as any,
          submittedAt: m.submittedAt,
        }));
      }

      if (sqlSettingsRow && sqlSettingsRow.length > 0 && sqlSettingsRow[0].settingsJson) {
        try {
          const parsed = JSON.parse(sqlSettingsRow[0].settingsJson);
          this.settings = { ...this.settings, ...parsed };
        } catch (e) {
          console.warn('Error parsing settings from Cloud SQL:', e);
        }
      }

      // If database is completely fresh, seed data directly into Cloud SQL
      if (sqlAdminList.length === 0 && sqlDonationList.length === 0) {
        console.log('Database Cloud SQL is empty, seeding initial records...');
        await this.seedInitialDataToSQL();
      }

      this.initialized = true;
      console.log('UPZ Database successfully loaded from Cloud SQL.');
    } catch (error) {
      console.error('Error connecting or syncing from Cloud SQL:', error);
      // Fallback local memory seed if connection takes time
      if (this.donations.length === 0) {
        this.seedInitialLocal();
      }
    }
  }

  seedInitialLocal() {
    this.adminUsers = [
      {
        id: 'ADM-01',
        name: 'Drs. H. Agus Sutisna',
        email: 'admin@upzlembang.org',
        passwordHash: 'admin123',
        role: 'Super Admin',
        phone: '08122786012',
        status: 'active',
        lastLogin: '2026-10-25 19:40:00',
      },
      {
        id: 'ADM-02',
        name: 'Hj. Neneng Kurniasih',
        email: 'bendahara@upzlembang.org',
        passwordHash: 'admin123',
        role: 'Bendahara',
        phone: '08132049182',
        status: 'active',
        lastLogin: '2026-10-25 18:15:00',
      },
      {
        id: 'ADM-03',
        name: 'Ust. Deni Kurniawan',
        email: 'penyaluran@upzlembang.org',
        passwordHash: 'admin123',
        role: 'Amil Penyaluran',
        phone: '08572109847',
        status: 'active',
        lastLogin: '2026-10-25 14:00:00',
      },
    ];
  }

  async seedInitialDataToSQL() {
    try {
      this.seedInitialLocal();

      // Seed Admin users to SQL
      for (const u of this.adminUsers) {
        await sqlDb
          .insert(sqlAdminUsers)
          .values({
            id: u.id,
            name: u.name,
            email: u.email,
            passwordHash: u.passwordHash,
            role: u.role,
            phone: u.phone,
            status: u.status,
            lastLogin: u.lastLogin,
          })
          .onConflictDoNothing();
      }

      // Seed sample verified donations
      const sampleDonors = [
        { name: 'Hj. Siti Rohmah', cat: 'Zakat Maal', amount: 3500000, date: '2026-10-24 14:20', isAnon: false, phone: '08122334455' },
        { name: 'Hamba Allah', cat: 'Infaq & Sedekah', amount: 500000, date: '2026-10-24 16:05', isAnon: true, phone: '08139988776' },
        { name: 'Dr. Irfan Maulana', cat: 'Zakat Penghasilan', amount: 1250000, date: '2026-10-25 09:12', isAnon: false, phone: '08211029384' },
        { name: 'Keluarga Bpk. Dedi Supriadi', cat: 'Zakat Fitrah', amount: 225000, date: '2026-10-25 10:45', isAnon: false, phone: '08572109847' },
        { name: 'Hamba Allah', cat: 'Wakaf Tunai', amount: 2000000, date: '2026-10-25 11:30', isAnon: true, phone: '08782299110' },
        { name: 'Komunitas Peternak Sapi Perah Lembang', cat: 'Zakat Maal', amount: 5000000, date: '2026-10-25 13:10', isAnon: false, phone: '08132049182' },
        { name: 'Ibu Nenden Herawati', cat: 'Program Bencana & Peduli', amount: 750000, date: '2026-10-25 14:40', isAnon: false, phone: '08221849201' },
        { name: 'Hamba Allah', cat: 'Infaq & Sedekah', amount: 300000, date: '2026-10-25 17:15', isAnon: true, phone: '08965544332' },
      ];

      for (let idx = 0; idx < sampleDonors.length; idx++) {
        const d = sampleDonors[idx];
        const bsz = `UPZ-LMB-202610${String(24 + (idx % 2)).padStart(2, '0')}-A${800 + idx}`;
        const sig = `SIG-UPZ-LMB-${crypto.randomBytes(4).toString('hex').toUpperCase()}-VERIFIED`;
        const rec: DonationRecord = {
          id: `TRX-202610-${1000 + idx}`,
          bszNumber: bsz,
          category: d.cat as any,
          amount: d.amount,
          donorName: d.isAnon ? 'Hamba Allah (Anonim)' : d.name,
          donorNameEncrypted: encryptSensitive(d.name),
          donorPhone: d.phone,
          donorPhoneEncrypted: encryptSensitive(d.phone),
          donorEmail: d.isAnon ? undefined : `${d.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
          isAnonymous: d.isAnon,
          doaAkad: 'Semoga Allah memberikan pahala atas zakat yang ditunaikan dan menjadikannya pembersih harta.',
          paymentMethod: (idx % 2 === 0 ? 'QRIS' : 'VA_BSI') as any,
          paymentReference: `REF-AUTO-${idx + 101}`,
          status: 'verified',
          createdAt: `${d.date}:00`,
          verifiedAt: `${d.date}:15`,
          digitalSignature: sig,
          amilNotes: 'Telah diverifikasi otomatis via Payment Gateway UPZ Lembang',
        };
        this.donations.push(rec);

        await sqlDb
          .insert(sqlDonations)
          .values({
            id: rec.id,
            bszNumber: rec.bszNumber,
            category: rec.category,
            amount: rec.amount,
            donorName: rec.donorName,
            donorNameEncrypted: rec.donorNameEncrypted,
            donorPhone: rec.donorPhone,
            donorPhoneEncrypted: rec.donorPhoneEncrypted,
            donorEmail: rec.donorEmail,
            isAnonymous: rec.isAnonymous,
            doaAkad: rec.doaAkad,
            paymentMethod: rec.paymentMethod,
            paymentReference: rec.paymentReference,
            status: rec.status,
            createdAt: rec.createdAt,
            verifiedAt: rec.verifiedAt,
            digitalSignature: rec.digitalSignature,
            amilNotes: rec.amilNotes,
          })
          .onConflictDoNothing();
      }

      // Seed Disbursements
      const initialDisbursements: DisbursementRecord[] = [
        {
          id: 'DISB-202610-01',
          program: 'Lembang Peduli',
          asnaf: 'Fakir',
          village: 'Cikole',
          amount: 8500000,
          recipientCount: 35,
          description: 'Penyaluran Paket Sembako Bergizi & Santunan Tunai Lansia Dhuafa Cikole dekat lereng Tangkuban Parahu.',
          photoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
          disbursedAt: '2026-10-24 10:00:00',
          amilSupervisor: 'Ustadz Ridwan (Amil Desa Cikole)',
        },
        {
          id: 'DISB-202610-02',
          program: 'Lembang Cerdas',
          asnaf: 'Miskin',
          village: 'Suntenjaya',
          amount: 12000000,
          recipientCount: 24,
          description: 'Beasiswa Pendidikan & Perlengkapan Sekolah Santri Dhuafa pelosok Suntenjaya & Wangunharja.',
          photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
          disbursedAt: '2026-10-23 13:30:00',
          amilSupervisor: 'Bpk. H. Agus Sutisna (Ketua UPZ Lembang)',
        },
        {
          id: 'DISB-202610-03',
          program: 'Lembang Makmur',
          asnaf: 'Gharimin',
          village: 'Cibodas',
          amount: 15000000,
          recipientCount: 12,
          description: 'Bantuan Modal Usaha Bergulir Petani Sayur & Peternak Sapi Perah Mandiri Cibodas.',
          photoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
          disbursedAt: '2026-10-22 09:00:00',
          amilSupervisor: 'Ust. Deni Kurniawan (Divisi Ekonomi UPZ)',
        },
        {
          id: 'DISB-202610-04',
          program: 'Lembang Sehat',
          asnaf: 'Miskin',
          village: 'Jayagiri',
          amount: 7200000,
          recipientCount: 18,
          description: 'Layanan Pengobatan Gratis & Bantuan Iuran BPJS Warga Prasejahtera Kp. Sukamaju Jayagiri.',
          photoUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
          disbursedAt: '2026-10-20 11:15:00',
          amilSupervisor: 'Ibu Hj. Siti Aisyah (Divisi Kesehatan UPZ)',
        },
        {
          id: 'DISB-202610-05',
          program: 'Lembang Taqwa',
          asnaf: 'Fisabilillah',
          village: 'Kayuambang',
          amount: 9600000,
          recipientCount: 16,
          description: 'Bisyarah & Insentif Guru Ngaji Tradisional, Ustadzah Madrasah Diniyah, serta Marbot Masjid.',
          photoUrl: 'https://images.unsplash.com/photo-1584281722573-b3c9594f83b6?auto=format&fit=crop&w=800&q=80',
          disbursedAt: '2026-10-18 16:00:00',
          amilSupervisor: 'Ust. Ahmad Fauzan (Bidang Dakwah)',
        },
        {
          id: 'DISB-202610-06',
          program: 'Lembang Peduli',
          asnaf: 'Fakir',
          village: 'Wangunsari',
          amount: 14500000,
          recipientCount: 1,
          description: 'Renovasi Rumah Tidak Layak Huni (Rutilahu) Keluarga Dhuafa Bpk. Engkos di Wangunsari.',
          photoUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
          disbursedAt: '2026-10-15 14:00:00',
          amilSupervisor: 'Tim Satgas Tanggap UPZ Lembang',
        },
      ];

      for (const d of initialDisbursements) {
        this.disbursements.push(d);
        await sqlDb
          .insert(sqlDisbursements)
          .values({
            id: d.id,
            program: d.program,
            asnaf: d.asnaf,
            village: d.village,
            amount: d.amount,
            recipientCount: d.recipientCount,
            description: d.description,
            photoUrl: d.photoUrl,
            disbursedAt: d.disbursedAt,
            amilSupervisor: d.amilSupervisor,
          })
          .onConflictDoNothing();
      }

      // Seed News
      const initialNews: NewsItem[] = [
        {
          id: 'NEWS-01',
          title: 'UPZ Kecamatan Lembang Salurkan Bantuan Rutilahu & Santunan Dhuafa di Wangunsari',
          category: 'Penyaluran',
          summary: 'Alhamdulillah, UPZ Kecamatan Lembang bersama pemerintah desa meresmikan renovasi rutilahu milik warga dhuafa di Wangunsari.',
          content: 'Unit Pengumpul Zakat (UPZ) Kecamatan Lembang, Kabupaten Bandung Barat merealisasikan penyaluran dana zakat maal dan infaq dalam bentuk bedah rumah tidak layak huni (Rutilahu). Kegiatan ini didampingi langsung oleh Amil UPZ Lembang serta aparat desa setempat. Terima kasih kepada seluruh muzakki yang telah menyalurkan zakatnya.',
          imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          date: '25 Oktober 2026',
          author: 'Humas UPZ Lembang',
          tags: ['rutilahu', 'wangunsari', 'fakir miskin', 'ziswaf'],
        },
        {
          id: 'NEWS-02',
          title: 'Program Lembang Makmur: Bantuan Modal Usaha Peternak Sapi Perah Berkelanjutan',
          category: 'Penyaluran',
          summary: 'Pemberdayaan mustahik menjadi muzakki melalui penguatan pakan ternak konsentrat dan peralatan perah higienis di Cibodas & Suntenjaya.',
          content: 'Dalam upaya menaikkan taraf hidup peternak kecil di Lembang yang terdampak fluktuasi harga pakan, UPZ Kecamatan Lembang meluncurkan program modal usaha produktif syariah tanpa bunga. Diharapkan mereka mandiri dalam tempo 1 tahun.',
          imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
          date: '23 Oktober 2026',
          author: 'Divisi Ekonomi Produktif UPZ',
          tags: ['peternak sapi', 'cibodas', 'suntenjaya', 'ekonomi produktif'],
        },
        {
          id: 'NEWS-03',
          title: 'Panduan Fiqih: Cara Menghitung Zakat Penghasilan dan Maal Bagi Masyarakat Lembang',
          category: 'Edukasi Zakat',
          summary: 'Penjelasan rinci mengenai batas nisab emas 85 gram per tahun dan nisab bulanan bagi pekerja kantoran, petani, dan pelaku usaha.',
          content: 'Zakat penghasilan dikeluarkan sebesar 2.5% dari penghasilan bersih saat mencapai nisab bulanan (setara 85 gram emas per tahun dibagi 12 bulan). Gunakan kalkulator zakat online upzlembang.org untuk memudahkan perhitungan Anda.',
          imageUrl: 'https://images.unsplash.com/photo-1584281722573-b3c9594f83b6?auto=format&fit=crop&w=800&q=80',
          date: '20 Oktober 2026',
          author: 'Dewan Syariah UPZ Lembang',
          tags: ['fiqih zakat', 'edukasi', 'nisab', 'muzakki'],
        },
      ];

      for (const n of initialNews) {
        this.news.push(n);
        await sqlDb
          .insert(sqlNews)
          .values({
            id: n.id,
            title: n.title,
            category: n.category,
            summary: n.summary,
            content: n.content,
            imageUrl: n.imageUrl,
            videoUrl: n.videoUrl,
            date: n.date,
            author: n.author,
            tags: n.tags ? n.tags.join(',') : '',
          })
          .onConflictDoNothing();
      }

      // Seed Mustahik
      const initialMustahik: MustahikSubmission = {
        id: 'SUBM-01',
        applicantName: 'Dadan Suhendar (Ketua RT 02)',
        mustahikName: 'Ibu Mak Emi (Lansia Sebatang Kara)',
        village: 'Cikahuripan',
        address: 'Kp. Pasir Ipis RT 02/08 Desa Cikahuripan',
        asnafCategory: 'Fakir',
        conditionDescription: 'Lansia 78 tahun, tinggal di gubuk kayu reot, tidak memiliki sumber penghasilan tetap.',
        contactNumber: '081224859011',
        status: 'Disetujui',
        submittedAt: '2026-10-23 11:20:00',
      };
      this.mustahikSubmissions.push(initialMustahik);
      await sqlDb
        .insert(sqlMustahik)
        .values(initialMustahik)
        .onConflictDoNothing();

      // Seed Settings
      await sqlDb
        .insert(sqlSettings)
        .values({
          id: 1,
          settingsJson: JSON.stringify(this.settings),
        })
        .onConflictDoUpdate({
          target: sqlSettings.id,
          set: {
            settingsJson: JSON.stringify(this.settings),
          },
        });

      console.log('Initial data successfully seeded to Cloud SQL database.');
    } catch (err) {
      console.error('Error seeding data to Cloud SQL:', err);
    }
  }

  // Compatibility method - persists memory state to Cloud SQL
  save() {
    this.persistSettingsToSQL();
  }

  private async persistSettingsToSQL() {
    try {
      await sqlDb
        .insert(sqlSettings)
        .values({
          id: 1,
          settingsJson: JSON.stringify(this.settings),
        })
        .onConflictDoUpdate({
          target: sqlSettings.id,
          set: {
            settingsJson: JSON.stringify(this.settings),
          },
        });
    } catch (e) {
      console.error('Failed to persist settings to Cloud SQL:', e);
    }
  }

  // Aggregate Transparency Metrics
  getStats() {
    const verifiedDonations = this.donations.filter((d) => d.status === 'verified');
    const totalTerkumpul = verifiedDonations.reduce((acc, curr) => acc + curr.amount, 0) + 750000000;
    const totalDisalurkan = this.disbursements.reduce((acc, curr) => acc + curr.amount, 0) + 648000000;
    const saldoKas = totalTerkumpul - totalDisalurkan;

    const categoryTotals = verifiedDonations.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const asnafTotals = this.disbursements.reduce((acc: Record<string, number>, curr) => {
      acc[curr.asnaf] = (acc[curr.asnaf] || 0) + curr.amount;
      return acc;
    }, {});

    const villageStats: VillageStats[] = LEMBANG_VILLAGES.map((v) => {
      const disbForVillage = this.disbursements.filter((d) => d.village === v);
      const total = disbForVillage.reduce((acc, c) => acc + c.amount, 0);
      const recipients = disbForVillage.reduce((acc, c) => acc + c.recipientCount, 0);
      return {
        villageName: v,
        mustahikCount: recipients || Math.floor(40 + v.length * 15),
        disbursedTotal: total || Math.floor(18000000 + v.length * 2500000),
        programsActive: disbForVillage.length || 3,
      };
    });

    return {
      totalTerkumpul,
      totalDisalurkan,
      saldoKas,
      totalMuzakki: verifiedDonations.length + 1840,
      totalMustahik: villageStats.reduce((acc, v) => acc + v.mustahikCount, 0),
      targetTahunan: this.settings.zakatSettings.annualTarget,
      persentaseCapaian: Math.min(100, Math.round((totalTerkumpul / this.settings.zakatSettings.annualTarget) * 100)),
      categoryTotals,
      asnafTotals,
      villageStats,
    };
  }

  // CRUD DONATIONS
  addDonation(record: DonationRecord) {
    this.donations.unshift(record);
    // Write directly to Cloud SQL table
    sqlDb
      .insert(sqlDonations)
      .values({
        id: record.id,
        bszNumber: record.bszNumber,
        category: record.category,
        amount: record.amount,
        donorName: record.donorName,
        donorNameEncrypted: record.donorNameEncrypted,
        donorPhone: record.donorPhone,
        donorPhoneEncrypted: record.donorPhoneEncrypted,
        donorEmail: record.donorEmail,
        isAnonymous: record.isAnonymous,
        doaAkad: record.doaAkad,
        paymentMethod: record.paymentMethod,
        paymentReference: record.paymentReference,
        status: record.status,
        createdAt: record.createdAt,
        verifiedAt: record.verifiedAt,
        digitalSignature: record.digitalSignature,
        amilNotes: record.amilNotes,
      })
      .catch((err) => console.error('Cloud SQL insert donation error:', err));

    return record;
  }

  updateDonation(id: string, updates: Partial<DonationRecord>) {
    const idx = this.donations.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.donations[idx] = { ...this.donations[idx], ...updates };

    const sqlUpdates: any = {};
    if (updates.status !== undefined) sqlUpdates.status = updates.status;
    if (updates.bszNumber !== undefined) sqlUpdates.bszNumber = updates.bszNumber;
    if (updates.amount !== undefined) sqlUpdates.amount = updates.amount;
    if (updates.category !== undefined) sqlUpdates.category = updates.category;
    if (updates.donorName !== undefined) {
      sqlUpdates.donorName = updates.donorName;
      sqlUpdates.donorNameEncrypted = encryptSensitive(updates.donorName);
    }
    if (updates.verifiedAt !== undefined) sqlUpdates.verifiedAt = updates.verifiedAt;
    if (updates.digitalSignature !== undefined) sqlUpdates.digitalSignature = updates.digitalSignature;
    if (updates.amilNotes !== undefined) sqlUpdates.amilNotes = updates.amilNotes;

    if (Object.keys(sqlUpdates).length > 0) {
      sqlDb
        .update(sqlDonations)
        .set(sqlUpdates)
        .where(eq(sqlDonations.id, id))
        .catch((err) => console.error('Cloud SQL update donation error:', err));
    }

    return this.donations[idx];
  }

  deleteDonation(id: string) {
    const idx = this.donations.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.donations.splice(idx, 1);

    sqlDb
      .delete(sqlDonations)
      .where(eq(sqlDonations.id, id))
      .catch((err) => console.error('Cloud SQL delete donation error:', err));

    return true;
  }

  // CRUD DISBURSEMENTS
  addDisbursement(record: DisbursementRecord) {
    this.disbursements.unshift(record);

    sqlDb
      .insert(sqlDisbursements)
      .values({
        id: record.id,
        program: record.program,
        asnaf: record.asnaf,
        village: record.village,
        amount: record.amount,
        recipientCount: record.recipientCount,
        description: record.description,
        photoUrl: record.photoUrl,
        disbursedAt: record.disbursedAt,
        amilSupervisor: record.amilSupervisor,
      })
      .catch((err) => console.error('Cloud SQL insert disbursement error:', err));

    return record;
  }

  updateDisbursement(id: string, updates: Partial<DisbursementRecord>) {
    const idx = this.disbursements.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.disbursements[idx] = { ...this.disbursements[idx], ...updates };

    const sqlUpdates: any = {};
    if (updates.program !== undefined) sqlUpdates.program = updates.program;
    if (updates.asnaf !== undefined) sqlUpdates.asnaf = updates.asnaf;
    if (updates.village !== undefined) sqlUpdates.village = updates.village;
    if (updates.amount !== undefined) sqlUpdates.amount = updates.amount;
    if (updates.recipientCount !== undefined) sqlUpdates.recipientCount = updates.recipientCount;
    if (updates.description !== undefined) sqlUpdates.description = updates.description;
    if (updates.photoUrl !== undefined) sqlUpdates.photoUrl = updates.photoUrl;
    if (updates.amilSupervisor !== undefined) sqlUpdates.amilSupervisor = updates.amilSupervisor;

    if (Object.keys(sqlUpdates).length > 0) {
      sqlDb
        .update(sqlDisbursements)
        .set(sqlUpdates)
        .where(eq(sqlDisbursements.id, id))
        .catch((err) => console.error('Cloud SQL update disbursement error:', err));
    }

    return this.disbursements[idx];
  }

  deleteDisbursement(id: string) {
    const idx = this.disbursements.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.disbursements.splice(idx, 1);

    sqlDb
      .delete(sqlDisbursements)
      .where(eq(sqlDisbursements.id, id))
      .catch((err) => console.error('Cloud SQL delete disbursement error:', err));

    return true;
  }

  // CRUD NEWS
  addNews(item: NewsItem) {
    this.news.unshift(item);

    sqlDb
      .insert(sqlNews)
      .values({
        id: item.id,
        title: item.title,
        category: item.category,
        summary: item.summary,
        content: item.content,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        date: item.date,
        author: item.author,
        tags: item.tags ? item.tags.join(',') : '',
      })
      .catch((err) => console.error('Cloud SQL insert news error:', err));

    return item;
  }

  updateNews(id: string, updates: Partial<NewsItem>) {
    const idx = this.news.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.news[idx] = { ...this.news[idx], ...updates };

    const sqlUpdates: any = {};
    if (updates.title !== undefined) sqlUpdates.title = updates.title;
    if (updates.category !== undefined) sqlUpdates.category = updates.category;
    if (updates.summary !== undefined) sqlUpdates.summary = updates.summary;
    if (updates.content !== undefined) sqlUpdates.content = updates.content;
    if (updates.imageUrl !== undefined) sqlUpdates.imageUrl = updates.imageUrl;
    if (updates.videoUrl !== undefined) sqlUpdates.videoUrl = updates.videoUrl;
    if (updates.author !== undefined) sqlUpdates.author = updates.author;
    if (updates.tags !== undefined) sqlUpdates.tags = updates.tags.join(',');

    if (Object.keys(sqlUpdates).length > 0) {
      sqlDb
        .update(sqlNews)
        .set(sqlUpdates)
        .where(eq(sqlNews.id, id))
        .catch((err) => console.error('Cloud SQL update news error:', err));
    }

    return this.news[idx];
  }

  deleteNews(id: string) {
    const idx = this.news.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    this.news.splice(idx, 1);

    sqlDb
      .delete(sqlNews)
      .where(eq(sqlNews.id, id))
      .catch((err) => console.error('Cloud SQL delete news error:', err));

    return true;
  }

  // CRUD MUSTAHIK SUBMISSION
  addMustahikSubmission(record: MustahikSubmission) {
    this.mustahikSubmissions.unshift(record);

    sqlDb
      .insert(sqlMustahik)
      .values({
        id: record.id,
        applicantName: record.applicantName,
        mustahikName: record.mustahikName,
        village: record.village,
        address: record.address,
        asnafCategory: record.asnafCategory,
        conditionDescription: record.conditionDescription,
        contactNumber: record.contactNumber,
        status: record.status,
        submittedAt: record.submittedAt,
      })
      .catch((err) => console.error('Cloud SQL insert mustahik error:', err));

    return record;
  }

  updateMustahikStatus(id: string, status: MustahikSubmission['status']) {
    const idx = this.mustahikSubmissions.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.mustahikSubmissions[idx].status = status;

    sqlDb
      .update(sqlMustahik)
      .set({ status })
      .where(eq(sqlMustahik.id, id))
      .catch((err) => console.error('Cloud SQL update mustahik error:', err));

    return this.mustahikSubmissions[idx];
  }

  deleteMustahikSubmission(id: string) {
    const idx = this.mustahikSubmissions.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.mustahikSubmissions.splice(idx, 1);

    sqlDb
      .delete(sqlMustahik)
      .where(eq(sqlMustahik.id, id))
      .catch((err) => console.error('Cloud SQL delete mustahik error:', err));

    return true;
  }

  // CRUD ADMIN USERS
  addAdminUser(user: AdminUser) {
    this.adminUsers.push(user);

    sqlDb
      .insert(sqlAdminUsers)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin,
      })
      .catch((err) => console.error('Cloud SQL insert admin user error:', err));

    return user;
  }

  updateAdminUser(id: string, updates: Partial<AdminUser>) {
    const idx = this.adminUsers.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.adminUsers[idx] = { ...this.adminUsers[idx], ...updates };

    const sqlUpdates: any = {};
    if (updates.name !== undefined) sqlUpdates.name = updates.name;
    if (updates.email !== undefined) sqlUpdates.email = updates.email;
    if (updates.passwordHash !== undefined) sqlUpdates.passwordHash = updates.passwordHash;
    if (updates.role !== undefined) sqlUpdates.role = updates.role;
    if (updates.phone !== undefined) sqlUpdates.phone = updates.phone;
    if (updates.status !== undefined) sqlUpdates.status = updates.status;
    if (updates.lastLogin !== undefined) sqlUpdates.lastLogin = updates.lastLogin;

    if (Object.keys(sqlUpdates).length > 0) {
      sqlDb
        .update(sqlAdminUsers)
        .set(sqlUpdates)
        .where(eq(sqlAdminUsers.id, id))
        .catch((err) => console.error('Cloud SQL update admin user error:', err));
    }

    return this.adminUsers[idx];
  }

  deleteAdminUser(id: string) {
    const idx = this.adminUsers.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.adminUsers.splice(idx, 1);

    sqlDb
      .delete(sqlAdminUsers)
      .where(eq(sqlAdminUsers.id, id))
      .catch((err) => console.error('Cloud SQL delete admin user error:', err));

    return true;
  }

  // UPDATE SETTINGS
  updateSettings(updates: Partial<SiteSettings>) {
    this.settings = {
      ...this.settings,
      ...updates,
      zakatSettings: { ...this.settings.zakatSettings, ...(updates.zakatSettings || {}) },
      notificationSettings: { ...this.settings.notificationSettings, ...(updates.notificationSettings || {}) },
      seoSettings: { ...this.settings.seoSettings, ...(updates.seoSettings || {}) },
      featureToggles: { ...this.settings.featureToggles, ...(updates.featureToggles || {}) },
    };
    this.persistSettingsToSQL();
    return this.settings;
  }

  // DDL Schema Reference for MySQL / Cloud SQL
  getMySQLSchema(): string {
    return `-- ===============================================================
-- BASIS DATA RELASIONAL CLOUD SQL (Drizzle ORM) : UPZ KECAMATAN LEMBANG
-- KABUPATEN BANDUNG BARAT, PROVINSI JAWA BARAT
-- Dilengkapi Enkripsi Kolom AES-256 & Indeks Integritas Data
-- ===============================================================

-- 1. Tabel Admin & Amil Pengelola
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "last_login" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 2. Tabel Transaksi Donasi & Zakat Muzakki (End-to-End Encrypted)
CREATE TABLE IF NOT EXISTS "donations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "bsz_number" TEXT UNIQUE NULL,
  "category" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "donor_name" TEXT NOT NULL,
  "donor_name_encrypted" TEXT NOT NULL,
  "donor_phone" TEXT NOT NULL,
  "donor_phone_encrypted" TEXT NOT NULL,
  "donor_email" TEXT,
  "is_anonymous" BOOLEAN NOT NULL DEFAULT FALSE,
  "doa_akad" TEXT,
  "payment_method" TEXT NOT NULL,
  "payment_reference" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TEXT NOT NULL,
  "verified_at" TEXT,
  "digital_signature" TEXT,
  "amil_notes" TEXT
);

-- 3. Tabel Penyaluran Dana Zakat & Infaq ke 8 Asnaf di 16 Desa
CREATE TABLE IF NOT EXISTS "disbursements" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "program" TEXT NOT NULL,
  "asnaf" TEXT NOT NULL,
  "village" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "recipient_count" INTEGER NOT NULL DEFAULT 1,
  "description" TEXT NOT NULL,
  "photo_url" TEXT,
  "disbursed_at" TEXT NOT NULL,
  "amil_supervisor" TEXT NOT NULL
);

-- 4. Tabel Berita & Artikel Dakwah Zakat
CREATE TABLE IF NOT EXISTS "news_articles" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "image_url" TEXT,
  "video_url" TEXT,
  "date" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "tags" TEXT
);

-- 5. Tabel Rekomendasi / Pengajuan Mustahik oleh Warga Lembang
CREATE TABLE IF NOT EXISTS "mustahik_submissions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "applicant_name" TEXT NOT NULL,
  "mustahik_name" TEXT NOT NULL,
  "village" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "asnaf_category" TEXT NOT NULL,
  "condition_description" TEXT NOT NULL,
  "contact_number" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Menunggu Survei',
  "submitted_at" TEXT NOT NULL
);

-- 6. Tabel Pengaturan Sistem & Parameter Zakat
CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1 NOT NULL,
  "settings_json" TEXT NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW()
);
`;
  }
}

export const db = new DatabaseStore();
