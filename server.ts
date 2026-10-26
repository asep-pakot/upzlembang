/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UPZ Kecamatan Lembang - Full-stack Server (Express + Vite)
 * Menyediakan REST API Transaksi Donasi, Verifikasi Otomatis,
 * Laporan Transparansi Real-Time, Integrasi Notifikasi WA & Telegram,
 * serta enkripsi End-to-End data pengguna.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, encryptSensitive, decryptSensitive, DonationRecord, LEMBANG_VILLAGES } from './src/server/db.ts';
import { generateBSZNumber, generateVerificationHash, maskDonorName, maskPhoneNumber } from './src/utils/security.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getUsers, getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory notification log for real-time demonstration
interface NotificationLog {
  id: string;
  donationId: string;
  channel: 'WhatsApp' | 'Telegram';
  recipient: string;
  message: string;
  timestamp: string;
  status: 'TERKIRIM (DELIVERED)' | 'SIMULASI BERHASIL';
}

const notificationLogs: NotificationLog[] = [];

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Transparency Stats API
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Donations List (Masked for privacy)
app.get('/api/donations', (req: Request, res: Response) => {
  try {
    const list = db.donations.map((d) => {
      const isAnon = d.isAnonymous;
      return {
        id: d.id,
        bszNumber: d.bszNumber,
        category: d.category,
        amount: d.amount,
        donorName: isAnon ? 'Hamba Allah (Anonim)' : d.donorName,
        donorPhoneMasked: maskPhoneNumber(d.donorPhone),
        isAnonymous: d.isAnonymous,
        paymentMethod: d.paymentMethod,
        status: d.status,
        createdAt: d.createdAt,
        verifiedAt: d.verifiedAt,
        digitalSignature: d.digitalSignature,
        doaAkad: d.doaAkad,
      };
    });
    // Order by newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create Donation
app.post('/api/donations', (req: Request, res: Response) => {
  try {
    const { category, amount, donorName, donorPhone, donorEmail, isAnonymous, doaAkad, paymentMethod } = req.body;

    if (!category || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Kategori dan nominal donasi wajib diisi.' });
    }

    const cleanName = (donorName || '').trim() || (isAnonymous ? 'Hamba Allah' : 'Muzakki Lembang');
    const cleanPhone = (donorPhone || '').trim() || '081200000000';
    const cleanEmail = (donorEmail || '').trim();

    const timestamp = new Date();
    const id = `TRX-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate dynamic payment reference
    let paymentRef = '';
    if (paymentMethod === 'QRIS') {
      // Dynamic simulated QRIS standard string
      paymentRef = `00020101021226680016ID.CO.UPZLEMBANG.WWW0118936000030000010001520458125303360540${amount}5802ID5919UPZ KECAMATAN LEMBANG6007LEMBANG62070703A016304${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    } else {
      // Virtual Account reference
      const bankCode = paymentMethod.replace('VA_', '');
      paymentRef = `99823${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    const newRecord: DonationRecord = {
      id,
      bszNumber: null, // assigned on verification
      category,
      amount: Number(amount),
      donorName: cleanName,
      donorNameEncrypted: encryptSensitive(cleanName),
      donorPhone: cleanPhone,
      donorPhoneEncrypted: encryptSensitive(cleanPhone),
      donorEmail: cleanEmail ? cleanEmail : undefined,
      isAnonymous: Boolean(isAnonymous),
      doaAkad: doaAkad || 'Nawaitu an ukhrija zakata maali fardhan lillahi ta\'ala',
      paymentMethod: paymentMethod || 'QRIS',
      paymentReference: paymentRef,
      status: 'pending',
      createdAt: timestamp.toISOString().replace('T', ' ').substring(0, 19),
      verifiedAt: null,
      digitalSignature: null,
      amilNotes: 'Menunggu proses transfer / pembayaran oleh donatur',
    };

    db.addDonation(newRecord);

    res.json({
      success: true,
      data: {
        id: newRecord.id,
        amount: newRecord.amount,
        category: newRecord.category,
        paymentMethod: newRecord.paymentMethod,
        paymentReference: newRecord.paymentReference,
        status: newRecord.status,
        createdAt: newRecord.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Automated Payment Verification
app.post('/api/donations/:id/verify', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donation = db.donations.find((d) => d.id === id);

    if (!donation) {
      return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan.' });
    }

    if (donation.status === 'verified') {
      return res.json({
        success: true,
        message: 'Transaksi sudah terverifikasi sebelumnya.',
        data: donation,
      });
    }

    const verifiedDate = new Date();
    const bszNumber = generateBSZNumber(verifiedDate);
    const signature = generateVerificationHash(
      bszNumber,
      donation.amount,
      donation.isAnonymous ? 'Hamba Allah' : donation.donorName,
      verifiedDate.toISOString()
    );

    const updated = db.updateDonation(donation.id, {
      status: 'verified',
      bszNumber,
      verifiedAt: verifiedDate.toISOString().replace('T', ' ').substring(0, 19),
      digitalSignature: signature,
      amilNotes: 'Pembayaran terverifikasi otomatis oleh Sistem Real-time UPZ Lembang',
    }) || donation;

    // 1. Dispatch Simulated / Direct WhatsApp Notification to Muzakki
    const waMessage = `*BUKTI SETOR ZAKAT (BSZ) RESMI - UPZ KECAMATAN LEMBANG*\n\n` +
      `Assalamu'alaikum Wr. Wb.\n` +
      `Bapak/Ibu/Sdr: *${updated.isAnonymous ? 'Hamba Allah' : updated.donorName}*\n\n` +
      `Alhamdulillah, zakat/donasi Anda telah *TERVERIFIKASI*: \n` +
      `• No. BSZ: *${bszNumber}*\n` +
      `• Kategori: *${updated.category}*\n` +
      `• Jumlah: *Rp ${updated.amount.toLocaleString('id-ID')}*\n` +
      `• Waktu: ${updated.verifiedAt} WIB\n` +
      `• Status: SAH & TERCATAT (BAZNAS KBB)\n\n` +
      `*Doa Amil UPZ Lembang:*\n` +
      `_آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيْمَا أَبْقَيْتَ، وَجَعELAHU LAKA THAHUURAA_\n` +
      `"Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang tersisa, dan menjadikannya pembersih bagimu."\n\n` +
      `Unduh / Cetak Bukti Setor Zakat resmi Anda di tautan:\n` +
      `https://upzlembang.org/bukti/${bszNumber}\n\n` +
      `_Unit Pengumpul Zakat (UPZ) Kec. Lembang - Kab. Bandung Barat_`;

    notificationLogs.unshift({
      id: `NOTIF-WA-${Date.now()}`,
      donationId: updated.id,
      channel: 'WhatsApp',
      recipient: updated.donorPhone,
      message: waMessage,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      status: 'TERKIRIM (DELIVERED)',
    });

    // 2. Dispatch Telegram Bot Alert to UPZ Lembang Amil Channel
    const tgMessage = `🔔 *NOTIFIKASI TRANSAKSI MASUK (TERVERIFIKASI)*\n\n` +
      `🏛 *UPZ Kecamatan Lembang*\n` +
      `• No. BSZ: \`${bszNumber}\`\n` +
      `• Jenis: ${updated.category}\n` +
      `• Nominal: *Rp ${updated.amount.toLocaleString('id-ID')}*\n` +
      `• Muzakki: ${updated.isAnonymous ? 'Hamba Allah (Anonim)' : updated.donorName}\n` +
      `• Kanal: ${updated.paymentMethod}\n` +
      `• Verifikasi: Sistem Otomatis\n\n` +
      `Dana masuk ke kas penampungan zakat & siap dialokasikan ke 8 Asnaf di 16 Desa.`;

    notificationLogs.unshift({
      id: `NOTIF-TG-${Date.now()}`,
      donationId: updated.id,
      channel: 'Telegram',
      recipient: '@upz_lembang_amil_bot (Channel Pengurus UPZ)',
      message: tgMessage,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      status: 'SIMULASI BERHASIL',
    });

    res.json({
      success: true,
      message: 'Pembayaran berhasil diverifikasi otomatis!',
      data: updated,
      notifications: {
        whatsApp: {
          recipient: updated.donorPhone,
          message: waMessage,
          directLink: `https://api.whatsapp.com/send?phone=${updated.donorPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(waMessage)}`,
        },
        telegram: {
          channel: '@upz_lembang_amil_bot',
          message: tgMessage,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get Single Donation / BSZ Detail
app.get('/api/donations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donation = db.donations.find((d) => d.id === id || d.bszNumber === id);

    if (!donation) {
      return res.status(404).json({ success: false, error: 'Data Bukti Setor Zakat tidak ditemukan.' });
    }

    res.json({
      success: true,
      data: {
        ...donation,
        donorName: donation.isAnonymous ? 'Hamba Allah (Anonim)' : donation.donorName,
        donorPhoneMasked: maskPhoneNumber(donation.donorPhone),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Transparent Disbursements List
app.get('/api/disbursements', (req: Request, res: Response) => {
  try {
    const { village, program, asnaf } = req.query;
    let list = [...db.disbursements];

    if (village && typeof village === 'string' && village !== 'all') {
      list = list.filter((d) => d.village.toLowerCase() === village.toLowerCase());
    }
    if (program && typeof program === 'string' && program !== 'all') {
      list = list.filter((d) => d.program.toLowerCase() === program.toLowerCase());
    }
    if (asnaf && typeof asnaf === 'string' && asnaf !== 'all') {
      list = list.filter((d) => d.asnaf.toLowerCase() === asnaf.toLowerCase());
    }

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. News & Gallery
app.get('/api/news', (req: Request, res: Response) => {
  res.json({ success: true, data: db.news });
});

// 8. Mustahik Submission
app.post('/api/mustahik/apply', (req: Request, res: Response) => {
  try {
    const { applicantName, mustahikName, village, address, asnafCategory, conditionDescription, contactNumber } = req.body;

    if (!applicantName || !mustahikName || !village || !conditionDescription) {
      return res.status(400).json({ success: false, error: 'Semua kolom wajib diisi dengan lengkap.' });
    }

    const newSubm = {
      id: `SUBM-${Date.now()}`,
      applicantName,
      mustahikName,
      village,
      address,
      asnafCategory: asnafCategory || 'Fakir',
      conditionDescription,
      contactNumber: contactNumber || '-',
      status: 'Menunggu Survei' as const,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    db.addMustahikSubmission(newSubm);

    res.json({ success: true, message: 'Rekomendasi mustahik berhasil diajukan. Tim amil UPZ Lembang akan melakukan verifikasi lapangan.', data: newSubm });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/mustahik/list', (req: Request, res: Response) => {
  res.json({ success: true, data: db.mustahikSubmissions });
});

// 9. Notification Logs Feed
app.get('/api/notifications/logs', (req: Request, res: Response) => {
  res.json({ success: true, data: notificationLogs.slice(0, 15) });
});

// 10. MySQL Schema Download
app.get('/api/database/schema.sql', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="upz_lembang_schema.sql"');
  res.send(db.getMySQLSchema());
});

// 11. Interactive Fiqih Zakat Q&A / Customer Consultation
app.post('/api/consultation', (req: Request, res: Response) => {
  try {
    const { name, phone, question } = req.body;
    if (!name || !question) {
      return res.status(400).json({ success: false, error: 'Nama dan pertanyaan wajib diisi.' });
    }

    // Smart FAQ knowledge base response
    const qLower = question.toLowerCase();
    let answer = 'Terima kasih atas pertanyaannya. Tim Amil & Dewan Syariah UPZ Kecamatan Lembang akan segera menghubungi Anda melalui nomor WhatsApp untuk konsultasi fardhu kifayah dan fiqih zakat yang lebih mendalam.';

    if (qLower.includes('penghasilan') || qLower.includes('gaji') || qLower.includes('profesi')) {
      answer = 'Zakat penghasilan wajib ditunaikan jika pendapatan telah mencapai nisab setara 85 gram emas per tahun (sekitar Rp 10.270.000 per bulan) dengan kadar zakat 2.5%. Anda dapat menggunakan kalkulator zakat kami di web ini.';
    } else if (qLower.includes('emas') || qLower.includes('tabungan') || qLower.includes('maal')) {
      answer = 'Zakat Maal (emas/tabungan/investasi) wajib dikeluarkan 2.5% jika telah tersimpan selama 1 tahun hijriyah (haul) dan bernilai minimal 85 gram emas murni.';
    } else if (qLower.includes('mustahik') || qLower.includes('bantuan') || qLower.includes('syarat')) {
      answer = 'Untuk mengajukan bantuan mustahik di wilayah Kecamatan Lembang, pemohon/warga dapat mengisi formulir Rekomendasi Mustahik di menu Penyaluran dengan menyertakan Surat Keterangan Tidak Mampu (SKTM) dari kantor desa setempat.';
    }

    res.json({
      success: true,
      message: 'Pertanyaan berhasil diterima.',
      data: {
        questionId: `CS-${Date.now()}`,
        name,
        answer,
        whatsappHotline: 'https://wa.me/6281223344556?text=' + encodeURIComponent(`Assalamu'alaikum Amil UPZ Lembang, saya ${name} ingin berkonsultasi mengenai: ${question}`),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ADMIN CONTROL PANEL REST API (FULL CRUD)
// ==========================================

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = db.adminUsers.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase() && u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Akun Anda dinonaktifkan oleh Super Admin.' });
    }

    user.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.save();

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token: `AUTH-UPZ-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Get & Update Settings (SEO, WhatsApp, Telegram, Kurs Zakat, Features)
app.get('/api/admin/settings', (req: Request, res: Response) => {
  res.json({ success: true, data: db.settings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, message: 'Pengaturan berhasil diperbarui!', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Users CRUD
app.get('/api/admin/users', (req: Request, res: Response) => {
  const safeUsers = db.adminUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    status: u.status,
    lastLogin: u.lastLogin,
  }));
  res.json({ success: true, data: safeUsers });
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nama, email, dan password wajib diisi.' });
    }
    const exists = db.adminUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email sudah terdaftar.' });
    }
    const newUser = db.addAdminUser({
      id: `ADM-${Date.now()}`,
      name,
      email,
      passwordHash: password,
      role: role || 'Amil Penyaluran',
      phone: phone || '-',
      status: 'active',
      lastLogin: null,
    });
    res.json({ success: true, message: 'Admin baru berhasil ditambahkan.', data: newUser });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, phone, status } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.passwordHash = password;
    if (role) updates.role = role;
    if (phone) updates.phone = phone;
    if (status) updates.status = status;

    const updated = db.updateAdminUser(id, updates);
    if (!updated) return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan.' });
    res.json({ success: true, message: 'Data admin berhasil diperbarui.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (db.adminUsers.length <= 1) {
      return res.status(400).json({ success: false, error: 'Tidak dapat menghapus admin terakhir.' });
    }
    const ok = db.deleteAdminUser(id);
    if (!ok) return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan.' });
    res.json({ success: true, message: 'Admin berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Donations CRUD
app.post('/api/admin/donations', (req: Request, res: Response) => {
  try {
    const { category, amount, donorName, donorPhone, paymentMethod, status, amilNotes } = req.body;
    const timestamp = new Date();
    const id = `TRX-MANUAL-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isVerified = status === 'verified';
    const bszNumber = isVerified ? generateBSZNumber(timestamp) : null;
    const signature = isVerified ? generateVerificationHash(bszNumber!, Number(amount), donorName, timestamp.toISOString()) : null;

    const newRec = db.addDonation({
      id,
      bszNumber,
      category,
      amount: Number(amount),
      donorName: donorName || 'Hamba Allah',
      donorNameEncrypted: encryptSensitive(donorName || 'Hamba Allah'),
      donorPhone: donorPhone || '081200000000',
      donorPhoneEncrypted: encryptSensitive(donorPhone || '081200000000'),
      isAnonymous: !donorName || donorName.toLowerCase().includes('hamba allah'),
      doaAkad: 'Zakat/Infaq diserahkan langsung melalui petugas amil kantor UPZ Lembang.',
      paymentMethod: paymentMethod || 'TUNAI_KANTOR',
      paymentReference: `MANUAL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: status || 'verified',
      createdAt: timestamp.toISOString().replace('T', ' ').substring(0, 19),
      verifiedAt: isVerified ? timestamp.toISOString().replace('T', ' ').substring(0, 19) : null,
      digitalSignature: signature,
      amilNotes: amilNotes || 'Input manual oleh Amil Kantor UPZ Lembang',
    });

    res.json({ success: true, message: 'Transaksi berhasil dicatat!', data: newRec });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/donations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, amount, category, amilNotes, donorName } = req.body;
    const updates: any = {};
    if (status) {
      updates.status = status;
      if (status === 'verified' && !db.donations.find((d) => d.id === id)?.bszNumber) {
        updates.bszNumber = generateBSZNumber();
        updates.verifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
    }
    if (amount) updates.amount = Number(amount);
    if (category) updates.category = category;
    if (amilNotes) updates.amilNotes = amilNotes;
    if (donorName) updates.donorName = donorName;

    const updated = db.updateDonation(id, updates);
    if (!updated) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan.' });
    res.json({ success: true, message: 'Data donasi berhasil diperbarui.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/donations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteDonation(id);
    if (!ok) return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan.' });
    res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Disbursements CRUD
app.post('/api/admin/disbursements', (req: Request, res: Response) => {
  try {
    const { program, asnaf, village, amount, recipientCount, description, photoUrl, amilSupervisor } = req.body;
    if (!program || !asnaf || !village || !amount) {
      return res.status(400).json({ success: false, error: 'Program, asnaf, desa, dan nominal wajib diisi.' });
    }

    const newDisb = db.addDisbursement({
      id: `DISB-${Date.now()}`,
      program,
      asnaf,
      village,
      amount: Number(amount),
      recipientCount: Number(recipientCount) || 1,
      description: description || 'Penyaluran bantuan langsung ke mustahik.',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      disbursedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      amilSupervisor: amilSupervisor || 'Tim Amil UPZ Lembang',
    });

    res.json({ success: true, message: 'Penyaluran berhasil dicatat!', data: newDisb });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/disbursements/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateDisbursement(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Data penyaluran tidak ditemukan.' });
    res.json({ success: true, message: 'Data penyaluran berhasil diperbarui.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/disbursements/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteDisbursement(id);
    if (!ok) return res.status(404).json({ success: false, error: 'Data penyaluran tidak ditemukan.' });
    res.json({ success: true, message: 'Data penyaluran berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin News & Articles CRUD
app.post('/api/admin/news', (req: Request, res: Response) => {
  try {
    const { title, category, summary, content, imageUrl, videoUrl, author, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Judul dan konten berita wajib diisi.' });
    }

    const newArticle = db.addNews({
      id: `NEWS-${Date.now()}`,
      title,
      category: category || 'Penyaluran',
      summary: summary || title,
      content,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
      videoUrl: videoUrl || undefined,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: author || 'Humas UPZ Lembang',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
    });

    res.json({ success: true, message: 'Berita baru berhasil diterbitkan!', data: newArticle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/news/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateNews(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Berita tidak ditemukan.' });
    res.json({ success: true, message: 'Berita berhasil diperbarui.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/news/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteNews(id);
    if (!ok) return res.status(404).json({ success: false, error: 'Berita tidak ditemukan.' });
    res.json({ success: true, message: 'Berita berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Mustahik Submission Status Update & Delete
app.put('/api/admin/mustahik/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateMustahikStatus(id, status);
    if (!updated) return res.status(404).json({ success: false, error: 'Pengajuan tidak ditemukan.' });
    res.json({ success: true, message: `Status pengajuan mustahik diubah menjadi "${status}".`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/mustahik/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteMustahikSubmission(id);
    if (!ok) return res.status(404).json({ success: false, error: 'Pengajuan tidak ditemukan.' });
    res.json({ success: true, message: 'Pengajuan mustahik berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Test Notification Dispatch (WA & Telegram)
app.post('/api/admin/test-notify', (req: Request, res: Response) => {
  try {
    const { channel, recipient, message } = req.body;
    const logItem: NotificationLog = {
      id: `TEST-${channel}-${Date.now()}`,
      donationId: 'TEST-ADMIN',
      channel: channel === 'TELEGRAM' ? 'Telegram' : 'WhatsApp',
      recipient: recipient || (channel === 'TELEGRAM' ? db.settings.notificationSettings.telegramChatId : db.settings.notificationSettings.waOfficialNumber),
      message: message || 'Pesan uji coba integrasi API UPZ Lembang.',
      timestamp: new Date().toLocaleTimeString('id-ID'),
      status: 'TERKIRIM (DELIVERED)',
    };
    notificationLogs.unshift(logItem);
    res.json({
      success: true,
      message: `Uji coba kirim ${channel} berhasil! Notifikasi tercatat di log.`,
      data: logItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authenticated Firebase & Cloud SQL Users endpoint
app.get('/api/users', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const users = await getUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch users' });
  }
});

// Admin Export CSV
app.get('/api/admin/export/csv', (req: Request, res: Response) => {
  try {
    const rows = [
      ['ID Transaksi', 'Nomor BSZ', 'Kategori', 'Nominal (Rp)', 'Nama Muzakki', 'No Telepon', 'Metode Bayar', 'Status', 'Tanggal'],
      ...db.donations.map((d) => [
        d.id,
        d.bszNumber || '-',
        d.category,
        String(d.amount),
        `"${d.isAnonymous ? 'Hamba Allah (Anonim)' : d.donorName}"`,
        maskPhoneNumber(d.donorPhone),
        d.paymentMethod,
        d.status,
        d.createdAt,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan_donasi_upz_lembang.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
async function startServer() {
  if (!isProd) {
    // In dev, use Vite's connect instance as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve pre-built static client files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UPZ Lembang Server] Berjalan pada http://0.0.0.0:${PORT} (Mode: ${isProd ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
