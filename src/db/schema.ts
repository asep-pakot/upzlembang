import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp } from 'drizzle-orm/pg-core';

// Mandatory Firebase Auth user linkage table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// UPZ Admin & Amil Users
export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  phone: text('phone').notNull(),
  status: text('status').notNull().default('active'),
  lastLogin: text('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
});

// UPZ Donations & Zakat Records (with End-to-End Encryption fields)
export const donations = pgTable('donations', {
  id: text('id').primaryKey(),
  bszNumber: text('bsz_number').unique(),
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  donorName: text('donor_name').notNull(),
  donorNameEncrypted: text('donor_name_encrypted').notNull(),
  donorPhone: text('donor_phone').notNull(),
  donorPhoneEncrypted: text('donor_phone_encrypted').notNull(),
  donorEmail: text('donor_email'),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  doaAkad: text('doa_akad'),
  paymentMethod: text('payment_method').notNull(),
  paymentReference: text('payment_reference').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  verifiedAt: text('verified_at'),
  digitalSignature: text('digital_signature'),
  amilNotes: text('amil_notes'),
});

// UPZ Real-time Disbursements across 16 villages in Lembang
export const disbursements = pgTable('disbursements', {
  id: text('id').primaryKey(),
  program: text('program').notNull(),
  asnaf: text('asnaf').notNull(),
  village: text('village').notNull(),
  amount: doublePrecision('amount').notNull(),
  recipientCount: integer('recipient_count').notNull().default(1),
  description: text('description').notNull(),
  photoUrl: text('photo_url'),
  disbursedAt: text('disbursed_at').notNull(),
  amilSupervisor: text('amil_supervisor').notNull(),
});

// UPZ News & Fiqih Education Articles
export const newsArticles = pgTable('news_articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  date: text('date').notNull(),
  author: text('author').notNull(),
  tags: text('tags'),
});

// UPZ Mustahik Recommendations from Lembang citizens
export const mustahikSubmissions = pgTable('mustahik_submissions', {
  id: text('id').primaryKey(),
  applicantName: text('applicant_name').notNull(),
  mustahikName: text('mustahik_name').notNull(),
  village: text('village').notNull(),
  address: text('address').notNull(),
  asnafCategory: text('asnaf_category').notNull(),
  conditionDescription: text('condition_description').notNull(),
  contactNumber: text('contact_number').notNull(),
  status: text('status').notNull().default('Menunggu Survei'),
  submittedAt: text('submitted_at').notNull(),
});

// UPZ System Settings & Zakat Parameters
export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().default(1),
  settingsJson: text('settings_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
