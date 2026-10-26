import React, { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  Send,
  MessageSquare,
  Bot,
  ExternalLink,
  CheckCircle2,
  Phone,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface WhatsAppTelegramNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentTransaction?: any;
}

export const WhatsAppTelegramNotificationModal: React.FC<WhatsAppTelegramNotificationModalProps> = ({
  isOpen,
  onClose,
  recentTransaction,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'wa' | 'telegram' | 'logs'>('wa');
  const [logs, setLogs] = useState<any[]>([]);
  const [testPhone, setTestPhone] = useState('081234567890');
  const [testSuccess, setTestSuccess] = useState('');

  const fetchLogs = () => {
    fetch('/api/notifications/logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const bszNum = recentTransaction?.bszNumber || 'UPZ-LMB-20261025-A891';
  const donorName = recentTransaction?.isAnonymous ? 'Hamba Allah' : (recentTransaction?.donorName || 'Bpk. Ahmad Fauzan');
  const amountStr = recentTransaction?.amount ? `Rp ${recentTransaction.amount.toLocaleString('id-ID')}` : 'Rp 500.000';
  const categoryStr = recentTransaction?.category || 'Zakat Penghasilan';

  const waMessageTemplate = `*BUKTI SETOR ZAKAT (BSZ) RESMI - UPZ KECAMATAN LEMBANG*\n\n` +
    `Assalamu'alaikum Wr. Wb.\n` +
    `Bapak/Ibu/Sdr: *${donorName}*\n\n` +
    `Alhamdulillah, zakat/donasi Anda telah *TERVERIFIKASI*: \n` +
    `• No. BSZ: *${bszNum}*\n` +
    `• Kategori: *${categoryStr}*\n` +
    `• Jumlah: *${amountStr}*\n` +
    `• Waktu: ${new Date().toLocaleDateString('id-ID')} WIB\n` +
    `• Status: SAH & TERCATAT (BAZNAS KBB)\n\n` +
    `*Doa Amil UPZ Lembang:*\n` +
    `_آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيْمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوْرًا_\n` +
    `"Ajarakallahu fiimaa a'thayta, wa baaraka laka fiimaa abqayta, wa ja'alahu laka thahuuraa."\n` +
    `"Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang tersisa, dan menjadikannya pembersih bagimu."\n\n` +
    `Unduh / Cetak Bukti Setor Zakat resmi Anda di tautan:\n` +
    `https://upzlembang.org/bukti/${bszNum}\n\n` +
    `_Unit Pengumpul Zakat (UPZ) Kec. Lembang - Kab. Bandung Barat_`;

  const waDirectUrl = `https://api.whatsapp.com/send?phone=${testPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(waMessageTemplate)}`;

  const tgMessageTemplate = `🔔 *NOTIFIKASI TRANSAKSI MASUK (TERVERIFIKASI)*\n\n` +
    `🏛 *UPZ Kecamatan Lembang*\n` +
    `• No. BSZ: \`${bszNum}\`\n` +
    `• Jenis: ${categoryStr}\n` +
    `• Nominal: *${amountStr}*\n` +
    `• Muzakki: ${donorName}\n` +
    `• Status: Otomatis Terverifikasi Sistem Gateway\n\n` +
    `Dana telah masuk ke kas penampungan zakat & siap dialokasikan ke 8 Asnaf di 16 Desa se-Kecamatan Lembang.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Integrasi Notifikasi WhatsApp & Telegram</h3>
              <p className="text-xs text-emerald-200">
                Pemberitahuan Otomatis Saat Transaksi ZIS Berhasil Diverifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('wa')}
            className={`flex-1 py-3 px-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'wa'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Notifikasi WhatsApp Muzakki</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-3 px-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'telegram'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-500" />
            <span>Telegram Bot Amil UPZ</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 px-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'logs'
                ? 'border-emerald-600 bg-white text-emerald-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Log Webhook Live</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* TAB 1: WHATSAPP NOTIFICATION PREVIEW */}
          {activeTab === 'wa' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
                Setiap transaksi donasi/zakat yang berhasil terverifikasi otomatis akan mengirimkan pesan WhatsApp konfirmasi resmi ke nomor HP muzakki lengkap dengan nomor BSZ dan doa berkah amil.
              </div>

              {/* Chat Simulation Bubble */}
              <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-slate-300 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    UPZ
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">UPZ Kecamatan Lembang (Official)</span>
                    <span className="text-[10px] text-emerald-800 font-semibold">Akun Resmi BAZNAS KBB ✓</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 shadow-xs max-w-lg text-slate-800 space-y-2 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                  {waMessageTemplate}
                  <div className="text-[10px] text-slate-400 text-right pt-1">
                    {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>
              </div>

              {/* Direct Open in WhatsApp */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-semibold text-slate-700">
                  Kirim / Tes Pesan ini ke Nomor WhatsApp Anda:
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                  <a
                    href={waDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEGRAM BOT PREVIEW */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                Pengurus dan Amil UPZ Kecamatan Lembang terhubung langsung melalui bot Telegram <strong>@upz_lembang_amil_bot</strong>. Setiap ada zakat masuk, bot langsung mengirimkan alert real-time ke grup koordinasi amil.
              </div>

              {/* Telegram Dark Style Chat Preview */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-slate-100">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs">UPZ Lembang Amil Bot</span>
                    <span className="text-[10px] text-blue-400 font-mono">@upz_lembang_amil_bot</span>
                  </div>
                </div>

                <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 text-xs font-mono space-y-2 whitespace-pre-wrap leading-relaxed">
                  {tgMessageTemplate}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Riwayat Pengiriman Notifikasi Otomatis:</span>
                <button
                  onClick={fetchLogs}
                  className="flex items-center gap-1 text-[11px] text-emerald-700 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Segarkan</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    Belum ada log pengiriman. Selesaikan satu donasi untuk melihat notifikasi otomatis.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 bg-white hover:bg-slate-50 transition space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${log.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {log.channel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Tujuan: <strong>{log.recipient}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {log.message.replace(/\n/g, ' ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
