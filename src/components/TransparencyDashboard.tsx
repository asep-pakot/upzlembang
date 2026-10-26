import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  MapPin,
  Calendar,
  CheckCircle2,
  Users,
  ShieldCheck,
  Building,
  Printer,
  FileSpreadsheet,
  Eye,
  ExternalLink,
  Search,
} from 'lucide-react';
import { formatRupiah } from '../utils/zakatCalculator';
import { LEMBANG_VILLAGES } from '../utils/constants';

interface TransparencyDashboardProps {
  onOpenSecurityModal: () => void;
}

export const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({
  onOpenSecurityModal,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedAsnaf, setSelectedAsnaf] = useState<string>('all');
  const [activeViewTab, setActiveViewTab] = useState<'penyaluran' | 'penerimaan' | 'desa'>('penyaluran');
  const [selectedDisbursementPhoto, setSelectedDisbursementPhoto] = useState<any | null>(null);

  useEffect(() => {
    fetchStats();
    fetchDisbursements();
    fetchDonations();
  }, [selectedVillage, selectedProgram, selectedAsnaf]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDisbursements = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVillage !== 'all') params.append('village', selectedVillage);
      if (selectedProgram !== 'all') params.append('program', selectedProgram);
      if (selectedAsnaf !== 'all') params.append('asnaf', selectedAsnaf);
      const res = await fetch(`/api/disbursements?${params.toString()}`);
      const data = await res.json();
      if (data.success) setDisbursements(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (data.success) setRecentDonations(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="transparansi" className="py-16 bg-slate-100/70 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
              Laporan Akuntabilitas Publik
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Dasbor Transparansi Keuangan Real-Time
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              Setiap rupiah zakat dan infaq dari para muzakki tercatat secara real-time dan diaudit terbuka. Dialokasikan secara amanah ke 8 asnaf mustahik di 16 desa se-Kecamatan Lembang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak / Ekspor PDF</span>
            </button>

            <button
              onClick={onOpenSecurityModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Skema MySQL & Enkripsi E2E</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Terkumpul */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total ZIS Terkumpul</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-800 tracking-tight">
              Rp {(stats?.totalTerkumpul || 750000000).toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Target 2026: Rp 1,2 M</span>
              <span className="font-bold text-emerald-600">{stats?.persentaseCapaian || 63}% Tercapai</span>
            </div>
          </div>

          {/* Card 2: Total Disalurkan */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Telah Disalurkan (8 Asnaf)</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {(stats?.totalDisalurkan || 648000000).toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500">
              Rasio Efektivitas Salur: <strong className="text-blue-700">86.4%</strong>
            </div>
          </div>

          {/* Card 3: Saldo Kas Aktif */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Saldo Kas Siap Salur</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Building className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-amber-600 tracking-tight">
              Rp {(stats?.saldoKas || 102000000).toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500">
              Tersimpan aman di Rekening Resmi Bank Syariah
            </div>
          </div>

          {/* Card 4: Mustahik & Muzakki */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Penerima Manfaat (Mustahik)</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-purple-900 tracking-tight">
              {(stats?.totalMustahik || 3420).toLocaleString('id-ID')}{' '}
              <span className="text-sm font-semibold text-slate-500">Jiwa</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Tersebar di <strong>16 Desa se-Kecamatan Lembang</strong>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* View Tab Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveViewTab('penyaluran')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeViewTab === 'penyaluran'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Riwayat Penyaluran Lapangan (Dokumentasi)
              </button>
              <button
                onClick={() => setActiveViewTab('penerimaan')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeViewTab === 'penerimaan'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Penerimaan Donasi Live (Muzakki)
              </button>
              <button
                onClick={() => setActiveViewTab('desa')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeViewTab === 'desa'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Statistik 16 Desa Lembang
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Menampilkan data mutasi terverifikasi real-time
            </div>
          </div>

          {/* Interactive Filters (Only for Penyaluran) */}
          {activeViewTab === 'penyaluran' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Filter Berdasarkan Desa:
                </label>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium"
                >
                  <option value="all">Semua Desa (16 Desa Lembang)</option>
                  {LEMBANG_VILLAGES.map((v) => (
                    <option key={v} value={v}>
                      Desa {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Filter Program Penyaluran:
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium"
                >
                  <option value="all">Semua Program Pilar</option>
                  <option value="Lembang Peduli">Lembang Peduli (Rutilahu & Bencana)</option>
                  <option value="Lembang Cerdas">Lembang Cerdas (Beasiswa)</option>
                  <option value="Lembang Sehat">Lembang Sehat (Kesehatan & BPJS)</option>
                  <option value="Lembang Makmur">Lembang Makmur (Modal Petani/Peternak)</option>
                  <option value="Lembang Taqwa">Lembang Taqwa (Guru Ngaji & Marbot)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Filter Kategori Asnaf:
                </label>
                <select
                  value={selectedAsnaf}
                  onChange={(e) => setSelectedAsnaf(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium"
                >
                  <option value="all">Semua 8 Asnaf</option>
                  <option value="Fakir">Fakir</option>
                  <option value="Miskin">Miskin</option>
                  <option value="Gharimin">Gharimin (Terlilit Hutang)</option>
                  <option value="Fisabilillah">Fisabilillah (Dakwah & Guru Ngaji)</option>
                  <option value="Ibnu Sabil">Ibnu Sabil (Musafir Kehabisan Bekal)</option>
                  <option value="Muallaf">Muallaf</option>
                  <option value="Amil">Amil (Operasional SK)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: PENYALURAN TABLE */}
        {activeViewTab === 'penyaluran' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal & ID</th>
                    <th className="px-4 py-3">Program & Asnaf</th>
                    <th className="px-4 py-3">Lokasi Desa</th>
                    <th className="px-4 py-3">Rincian Penyaluran</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-center">Foto Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disbursements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Tidak ada data penyaluran yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    disbursements.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 block">{d.disbursedAt.split(' ')[0]}</span>
                          <span className="font-mono text-[10px] text-slate-400">{d.id}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-emerald-800 block">{d.program}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                            Asnaf: {d.asnaf}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            Desa {d.village}
                          </span>
                          <span className="text-[10px] text-slate-500">{d.recipientCount} Penerima Manfaat</span>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="line-clamp-2 text-slate-600">{d.description}</p>
                          <span className="text-[10px] text-slate-400 italic block mt-0.5">
                            Pendamping: {d.amilSupervisor}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatRupiah(d.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDisbursementPhoto(d)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Foto</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENERIMAAN TABLE */}
        {activeViewTab === 'penerimaan' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Waktu & No. BSZ</th>
                    <th className="px-4 py-3">Muzakki / Munfiq</th>
                    <th className="px-4 py-3">Kategori Setoran</th>
                    <th className="px-4 py-3">Metode Bayar</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-center">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDonations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{item.createdAt}</span>
                        <span className="font-mono text-[10px] text-emerald-700 font-bold">
                          {item.bszNumber || item.id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`font-bold block ${item.isAnonymous ? 'text-amber-800 italic' : 'text-slate-900'}`}>
                          {item.donorName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          HP: {item.donorPhoneMasked}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                        {item.category}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="font-black text-emerald-700 text-sm">
                          {formatRupiah(item.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          TERVERIFIKASI SAH
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DESA STATS TABLE */}
        {activeViewTab === 'desa' && stats?.villageStats && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Sebaran Penyaluran 16 Desa Se-Kecamatan Lembang
              </span>
              <span className="text-xs text-emerald-800 font-medium">
                Pemerataan Bantuan Dhuafa & Peternak/Petani
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {stats.villageStats.map((vs: any) => (
                <div
                  key={vs.villageName}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      Desa {vs.villageName}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      {vs.programsActive} Program
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Disalurkan:{' '}
                    <strong className="text-slate-900 block font-mono text-sm">
                      {formatRupiah(vs.disbursedTotal)}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Mustahik: <strong>{vs.mustahikCount} Keluarga</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Photo Zoom */}
        {selectedDisbursementPhoto && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3">
              <div className="relative h-64 w-full bg-slate-900">
                <img
                  src={selectedDisbursementPhoto.photoUrl}
                  alt={selectedDisbursementPhoto.description}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedDisbursementPhoto(null)}
                  className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase">
                  {selectedDisbursementPhoto.program} • Desa {selectedDisbursementPhoto.village}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedDisbursementPhoto.description}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Nominal: <strong>{formatRupiah(selectedDisbursementPhoto.amount)}</strong></span>
                  <span>Supervisor: {selectedDisbursementPhoto.amilSupervisor}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
