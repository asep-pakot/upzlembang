import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  User,
  Bot,
  Phone,
  ExternalLink,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const CustomerServiceWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string; link?: string }>>([
    {
      sender: 'bot',
      text: "Assalamu'alaikum Wr. Wb. Selamat datang di Layanan Konsultasi & Layanan Muzakki UPZ Kecamatan Lembang. Ada yang dapat kami bantu terkait perhitungan zakat, infaq, atau rekomendasi mustahik?",
      time: 'Baru saja',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [userName, setUserName] = useState('');
  const [isSending, setIsSending] = useState(false);

  const quickQuestions = [
    'Berapa nisab zakat penghasilan bulan ini?',
    'Bagaimana cara mendaftar jadi mustahik?',
    'Apakah zakat di UPZ Lembang resmi BAZNAS?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim()) return;

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMsgList = [...messages, { sender: 'user' as const, text: q, time: timeStr }];
    setMessages(newMsgList);
    setInputQuestion('');
    setIsSending(true);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || 'Muzakki/Warga Lembang',
          phone: '081200000000',
          question: q,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages([
          ...newMsgList,
          {
            sender: 'bot' as const,
            text: data.data.answer,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            link: data.data.whatsappHotline,
          },
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMsgList,
        {
          sender: 'bot' as const,
          text: 'Terima kasih atas pertanyaan Anda. Untuk konsultasi fardhu kifayah dan zakat yang lebih spesifik, silakan langsung hubungi Amil UPZ Lembang via WhatsApp di bawah.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          link: 'https://wa.me/6281223344556',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-bold text-xs shadow-xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-500/30"
          title="Tanya Amil / Layanan Konsultasi Zakat"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
          </div>
          <span className="hidden sm:inline">Konsultasi Zakat & Amil</span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="w-[90vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col h-[520px] animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                UPZ
              </div>
              <div>
                <h4 className="font-bold text-sm">Layanan Amil UPZ Lembang</h4>
                <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Online • Siap Melayani Konsultasi
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-emerald-700/60 text-emerald-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 shadow-xs border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.link && (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline mt-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Chat WhatsApp Langsung dengan Amil</span>
                    </a>
                  )}
                  <span
                    className={`text-[9px] block text-right ${
                      m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] italic">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Amil sedang mengetik jawaban...</span>
              </div>
            )}
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex gap-1.5 text-[11px]">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tulis pertanyaan zakat Anda..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={isSending || !inputQuestion.trim()}
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400">
              Hotline KUA & UPZ Lembang: (022) 2786012 • Jam Layanan 08.00 - 16.00 WIB
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
