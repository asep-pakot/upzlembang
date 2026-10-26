import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Database,
  Lock,
  Download,
  Key,
  Server,
  FileCode,
  Check,
  Copy,
} from 'lucide-react';

interface SecurityMySQLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityMySQLModal: React.FC<SecurityMySQLModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const sampleSchemaSnippet = `-- SKEMA MYSQL RESMI: upzlembang.org
CREATE TABLE \`donations\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`bsz_number\` VARCHAR(64) UNIQUE,
  \`category\` VARCHAR(64) NOT NULL,
  \`amount\` DECIMAL(15,2) NOT NULL,
  \`donor_name_encrypted\` TEXT NOT NULL COMMENT 'AES-256 CBC',
  \`donor_phone_encrypted\` TEXT NOT NULL COMMENT 'AES-256 CBC',
  \`is_anonymous\` TINYINT(1) DEFAULT 0,
  \`status\` ENUM('pending','verified','expired') DEFAULT 'pending',
  \`digital_signature\` VARCHAR(128) COMMENT 'HMAC-SHA256 Token',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Arsitektur Database MySQL & Enkripsi E2E</h3>
              <p className="text-xs text-slate-300">
                Keamanan & Kerahasiaan Data Muzakki UPZ Kecamatan Lembang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Security Assurance Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Lock className="w-4 h-4" />
                <span>AES-256 Encryption</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Data sensitif (Nama, HP, Email) dienkripsi dengan sandi simetris AES-256 tingkat militer sebelum disimpan ke database.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-800 font-bold">
                <Key className="w-4 h-4" />
                <span>HMAC Signature</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Setiap Bukti Setor Zakat (BSZ) memiliki cryptographic hash token untuk mencegah pemalsuan dan manipulasi data.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-800 font-bold">
                <Server className="w-4 h-4" />
                <span>MySQL Relasional</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Skema tabel ACID standar industri: indeks performa, integritas foreign-key, dan isolasi transaksi keuangan.
              </p>
            </div>
          </div>

          {/* MySQL DDL Snippet Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-700" />
                Preview Skema DDL Database MySQL (upz_lembang_db)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin SQL'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
              {sampleSchemaSnippet}
            </pre>
          </div>

          {/* Download Action */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <strong className="block text-slate-900 text-xs">Unduh Berkas Skema SQL Lengkap</strong>
              <span className="text-[11px] text-slate-500">
                Termasuk tabel donasi, penyaluran 16 desa, mustahik, dan log notifikasi.
              </span>
            </div>

            <a
              href="/api/database/schema.sql"
              download="upz_lembang_schema.sql"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Unduh Schema (.sql)</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
