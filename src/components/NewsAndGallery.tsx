import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Image as ImageIcon,
  Video,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  Play,
  Share2,
} from 'lucide-react';

export const NewsAndGallery: React.FC = () => {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [activeMediaTab, setActiveMediaTab] = useState<'berita' | 'galeri' | 'video'>('berita');
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNewsList(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const galleryItems = [
    {
      title: 'Penyaluran Santunan Sembako Lansia Dhuafa Cikole',
      village: 'Desa Cikole',
      date: '24 Oktober 2026',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      category: 'Lansia & Dhuafa',
    },
    {
      title: 'Penyerahan Bantuan Pakan & Modal Peternak Sapi Perah',
      village: 'Desa Cibodas',
      date: '22 Oktober 2026',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
      category: 'Ekonomi Produktif',
    },
    {
      title: 'Beasiswa Pendidikan Santri Dhuafa Penghafal Quran',
      village: 'Desa Suntenjaya',
      date: '20 Oktober 2026',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      category: 'Pendidikan',
    },
    {
      title: 'Bisyarah Kehormatan Guru Ngaji & Marbot Masjid Jami',
      village: 'Desa Kayuambang',
      date: '18 Oktober 2026',
      imageUrl: 'https://images.unsplash.com/photo-1584281722573-b3c9594f83b6?auto=format&fit=crop&w=800&q=80',
      category: 'Dakwah & Taqwa',
    },
    {
      title: 'Pemberangkatan Tim Tanggap Bencana & Sembako',
      village: 'Desa Jayagiri',
      date: '15 Oktober 2026',
      imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
      category: 'Peduli Kemanusiaan',
    },
    {
      title: 'Layanan Pemeriksaan Kesehatan & Tensi Keliling Dhuafa',
      village: 'Desa Cikahuripan',
      date: '12 Oktober 2026',
      imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
      category: 'Kesehatan',
    },
  ];

  const videoItems = [
    {
      id: 'vid-1',
      title: 'Liputan Bedah Rutilahu & Penyaluran Beras Petani Dhuafa Lembang',
      duration: '4 Menit',
      date: '22 Oktober 2026',
      embedId: 'dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
      description: 'Dokumentasi penyaluran dana zakat fitrah dan maal bagi keluarga tidak mampu di lereng perbukitan Lembang.',
    },
    {
      id: 'vid-2',
      title: 'Video Edukasi Fiqih: Ketentuan Nisab Zakat Penghasilan & Peternakan Sapi Lembang',
      duration: '7 Menit',
      date: '19 Oktober 2026',
      embedId: 'dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
      description: 'Penjelasan fiqih praktis oleh Dewan Syariah UPZ Kecamatan Lembang mengenai haul dan nisab zakat profesi.',
    },
  ];

  return (
    <section id="berita" className="py-16 bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
              Kabar Zakat & Dokumentasi Lapangan
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Berita, Galeri & Video Penyaluran Bantuan
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              Dokumentasi nyata kegiatan para amil menjemput dan mengantarkan zakat dari para muzakki kepada mustahik yang berhak di seluruh penjuru Kecamatan Lembang.
            </p>
          </div>

          {/* Media Switcher */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveMediaTab('berita')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeMediaTab === 'berita'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Berita & Dakwah</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('galeri')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeMediaTab === 'galeri'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Galeri Foto</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('video')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeMediaTab === 'video'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Dokumenter</span>
            </button>
          </div>
        </div>

        {/* 1. BERITA TAB */}
        {activeMediaTab === 'berita' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {item.author}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 hover:text-emerald-700 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => setSelectedNews(item)}
                    className="w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. GALERI TAB */}
        {activeMediaTab === 'galeri' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((g, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-200"
              >
                <div className="h-64 w-full overflow-hidden">
                  <img
                    src={g.imageUrl}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold mb-1">
                    <span>{g.village}</span>
                    <span>{g.date}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{g.title}</h4>
                  <span className="text-[10px] bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-full mt-2 w-max font-medium">
                    {g.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. VIDEO TAB */}
        {activeMediaTab === 'video' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videoItems.map((vid) => (
              <div
                key={vid.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition space-y-4 p-5"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition cursor-pointer">
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {vid.duration}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] text-slate-400 font-semibold block">{vid.date}</span>
                  <h3 className="font-extrabold text-base text-slate-900">{vid.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{vid.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News Detail Reader Modal */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {selectedNews.category} • UPZ Lembang
                </span>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {selectedNews.title}
                </h2>
                <div className="text-xs text-slate-400">
                  Dipublikasikan pada {selectedNews.date} oleh {selectedNews.author}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden h-64 w-full">
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
                <p>{selectedNews.content}</p>
                <p>
                  Unit Pengumpul Zakat (UPZ) Kecamatan Lembang mengajak seluruh kaum muslimin dan agniya untuk senantiasa membersihkan harta melalui zakat, infaq, dan sedekah resmi BAZNAS guna mengangkat harkat martabat mustahik di Kabupaten Bandung Barat.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="py-2 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Tutup Bacaan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
