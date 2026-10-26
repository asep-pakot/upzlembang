import React from 'react';
import {
  HeartHandshake,
  GraduationCap,
  HeartPulse,
  Sprout,
  BookOpenCheck,
  Send,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DisbursementProgramsProps {
  onOpenMustahikModal: () => void;
  onDonateToProgram: (programName: string) => void;
}

export const DisbursementPrograms: React.FC<DisbursementProgramsProps> = ({
  onOpenMustahikModal,
  onDonateToProgram,
}) => {
  const programs = [
    {
      id: 'Lembang Peduli',
      title: 'Lembang Peduli (Kemanusiaan & Bencana)',
      icon: HeartHandshake,
      color: 'from-rose-600 to-red-700',
      badgeColor: 'bg-rose-100 text-rose-800',
      description:
        'Bedah Rumah Tidak Layak Huni (Rutilahu) keluarga miskin, santunan lansia dhuafa sebatang kara, serta kesiapsiagaan darurat bencana (mitigasi Sesar Lembang & lereng Tangkuban Parahu).',
      target: '50 Unit Rutilahu & 500 Lansia',
      currentDisbursed: 'Rp 185.000.000',
    },
    {
      id: 'Lembang Cerdas',
      title: 'Lembang Cerdas (Pendidikan Santri)',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-100 text-blue-800',
      description:
        'Beasiswa santri dhuafa penghafal Al-Qur’an di pesantren Lembang, bantuan seragam & alat tulis sekolah dasar, dan pencegahan putus sekolah di wilayah perbukitan.',
      target: '250 Anak Sekolah & Santri',
      currentDisbursed: 'Rp 142.500.000',
    },
    {
      id: 'Lembang Sehat',
      title: 'Lembang Sehat (Kesehatan Masyarakat)',
      icon: HeartPulse,
      color: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Layanan ambulans tanggap darurat, bantuan tebus obat resep dhuafa, pembiayaan iuran BPJS Kesehatan keluarga prasejahtera, serta pencegahan stunting balita pedesaan.',
      target: '400 Warga Membutuhkan',
      currentDisbursed: 'Rp 98.200.000',
    },
    {
      id: 'Lembang Makmur',
      title: 'Lembang Makmur (Ekonomi Produktif)',
      icon: Sprout,
      color: 'from-amber-600 to-yellow-700',
      badgeColor: 'bg-amber-100 text-amber-800',
      description:
        'Pemberdayaan mustahik menjadi muzakki lewat modal usaha syariah bergulir bagi peternak sapi perah rakyat, petani sayuran organik, dan pedagang keliling Lembang tanpa bunga/riba.',
      target: '65 Kelompok Peternak & Petani',
      currentDisbursed: 'Rp 160.000.000',
    },
    {
      id: 'Lembang Taqwa',
      title: 'Lembang Taqwa (Dakwah & Advokasi)',
      icon: BookOpenCheck,
      color: 'from-purple-600 to-violet-700',
      badgeColor: 'bg-purple-100 text-purple-800',
      description:
        'Bisyarah dan apresiasi kehormatan guru ngaji tradisional pedesaan, ustadzah majelis taklim pelosok Lembang, pembinaan muallaf, serta insentif marbot masjid jami\'.',
      target: '120 Guru Ngaji & Marbot',
      currentDisbursed: 'Rp 62.300.000',
    },
  ];

  return (
    <section id="penyaluran" className="py-16 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
            5 Pilar Program Penyaluran
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Penyaluran Bantuan Amanah & Tepat Sasaran
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Mengacu pada UU No. 23 Tahun 2011 dan regulasi BAZNAS, dana zakat disalurkan secara profesional kepada 8 asnaf prioritas di 16 desa se-Kecamatan Lembang.
          </p>
        </div>

        {/* 5 Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xl transition-all p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.badgeColor}`}>
                      Tersalurkan: {p.currentDisbursed}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Target Penerima:</span>
                    <strong className="text-slate-800">{p.target}</strong>
                  </div>

                  <button
                    onClick={() => onDonateToProgram(p.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Dukung Program Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Action Card: Usulkan Warga Miskin / Mustahik */}
          <div className="rounded-3xl border-2 border-dashed border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-6 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-3">
              <span className="text-[11px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                Partisipasi Warga
              </span>
              <h3 className="text-xl font-extrabold text-emerald-950">
                Ketahui Tetangga yang Butuh Bantuan?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jangan biarkan ada warga dhuafa, janda tua, atau anak yatim di pelosok Lembang yang kelaparan atau putus sekolah. Rekomendasikan kepada tim Amil UPZ Kecamatan Lembang untuk kami survei lapangan.
              </p>
            </div>

            <button
              onClick={onOpenMustahikModal}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>Ajukan Rekomendasi Mustahik Online</span>
            </button>
          </div>
        </div>

        {/* 8 Asnaf Explanation Accordion / Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Ketentuan Syar'i (QS. At-Taubah: 60)
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                8 Golongan Penerima Zakat (Asnaf) di Kecamatan Lembang
              </h3>
            </div>
            <span className="text-xs text-slate-400">Distribusi Adil & Objektif</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">1. Fakir</strong>
              <p className="text-slate-300 text-[11px]">Warga yang tidak memiliki penghasilan dan tidak mencukupi kebutuhan makan harian.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">2. Miskin</strong>
              <p className="text-slate-300 text-[11px]">Memiliki mata pencaharian tetapi tidak mencukupi kebutuhan pokok keluarga.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">3. Amil</strong>
              <p className="text-slate-300 text-[11px]">Petugas resmi yang mengumpulkan, mencatat, dan menyalurkan zakat berdasarkan SK BAZNAS.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">4. Muallaf</strong>
              <p className="text-slate-300 text-[11px]">Orang yang baru masuk Islam untuk menguatkan iman dan kehidupan sosialnya.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">5. Riqab</strong>
              <p className="text-slate-300 text-[11px]">Pembebasan dari jeratan perbudakan modern atau perdagangan manusia.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">6. Gharimin</strong>
              <p className="text-slate-300 text-[11px]">Orang yang terjerat hutang untuk kebutuhan darurat hidup atau kemaslahatan umat.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">7. Fisabilillah</strong>
              <p className="text-slate-300 text-[11px]">Aktivitas dakwah, pengajar ngaji, dan perjuangan di jalan Allah di daerah perbukitan.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">8. Ibnu Sabil</strong>
              <p className="text-slate-300 text-[11px]">Musafir atau perantau yang kehabisan bekal dalam perjalanan ketaatan.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
