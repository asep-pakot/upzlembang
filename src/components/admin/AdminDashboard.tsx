import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Coins,
  Send,
  Users,
  Newspaper,
  BellRing,
  Globe,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ExternalLink,
  Save,
  Check,
  ShieldCheck,
  Building,
  Key,
  X,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { LEMBANG_VILLAGES } from '../../utils/constants';
import { formatRupiah } from '../../utils/zakatCalculator';

interface AdminDashboardProps {
  adminUser: any;
  onLogout: () => void;
  onExitToPublic: () => void;
  onOpenBSZ: (donation: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onExitToPublic,
  onOpenBSZ,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'donations' | 'disbursements' | 'mustahik' | 'news' | 'notifications' | 'seo' | 'users' | 'settings'
  >('overview');

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [mustahikList, setMustahikList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals for CRUD
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any | null>(null);

  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [editingDisbursement, setEditingDisbursement] = useState<any | null>(null);

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Fetch all administrative data
  const loadAllData = () => {
    fetch('/api/stats').then((r) => r.json()).then((d) => d.success && setStats(d.data));
    fetch('/api/donations').then((r) => r.json()).then((d) => d.success && setDonations(d.data));
    fetch('/api/disbursements').then((r) => r.json()).then((d) => d.success && setDisbursements(d.data));
    fetch('/api/mustahik/list').then((r) => r.json()).then((d) => d.success && setMustahikList(d.data));
    fetch('/api/news').then((r) => r.json()).then((d) => d.success && setNewsList(d.data));
    fetch('/api/admin/users').then((r) => r.json()).then((d) => d.success && setUsersList(d.data));
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => d.success && setSiteSettings(d.data));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ==========================================
  // DONATION CRUD HANDLERS
  // ==========================================
  const handleSaveDonation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      category: formData.get('category'),
      amount: Number(formData.get('amount')),
      donorName: formData.get('donorName'),
      donorPhone: formData.get('donorPhone'),
      paymentMethod: formData.get('paymentMethod'),
      status: formData.get('status'),
      amilNotes: formData.get('amilNotes'),
    };

    try {
      const url = editingDonation ? `/api/admin/donations/${editingDonation.id}` : '/api/admin/donations';
      const method = editingDonation ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingDonation ? 'Transaksi berhasil diperbarui!' : 'Transaksi manual berhasil dicatat!');
        setIsDonationModalOpen(false);
        setEditingDonation(null);
        loadAllData();
      } else {
        showToast(data.error || 'Gagal menyimpan transaksi', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi ${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/donations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Transaksi berhasil dihapus');
        loadAllData();
      } else {
        showToast(data.error || 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  const handleVerifyDonation = async (id: string) => {
    try {
      const res = await fetch(`/api/donations/${id}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Transaksi ${id} berhasil diverifikasi otomatis & BSZ diterbitkan!`);
        loadAllData();
        if (data.data) onOpenBSZ(data.data);
      } else {
        showToast(data.error || 'Gagal verifikasi', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // ==========================================
  // DISBURSEMENT CRUD HANDLERS
  // ==========================================
  const handleSaveDisbursement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      program: formData.get('program'),
      asnaf: formData.get('asnaf'),
      village: formData.get('village'),
      amount: Number(formData.get('amount')),
      recipientCount: Number(formData.get('recipientCount')),
      description: formData.get('description'),
      photoUrl: formData.get('photoUrl'),
      amilSupervisor: formData.get('amilSupervisor'),
    };

    try {
      const url = editingDisbursement ? `/api/admin/disbursements/${editingDisbursement.id}` : '/api/admin/disbursements';
      const method = editingDisbursement ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingDisbursement ? 'Data penyaluran diperbarui!' : 'Penyaluran baru berhasil dicatat!');
        setIsDisbursementModalOpen(false);
        setEditingDisbursement(null);
        loadAllData();
      } else {
        showToast(data.error || 'Gagal menyimpan penyaluran', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  const handleDeleteDisbursement = async (id: string) => {
    if (!window.confirm('Hapus pencatatan penyaluran ini? Saldo kas akan otomatis disesuaikan.')) return;
    try {
      const res = await fetch(`/api/admin/disbursements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Data penyaluran berhasil dihapus');
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // ==========================================
  // NEWS CRUD HANDLERS
  // ==========================================
  const handleSaveNews = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      summary: formData.get('summary'),
      content: formData.get('content'),
      imageUrl: formData.get('imageUrl'),
      videoUrl: formData.get('videoUrl'),
      author: formData.get('author'),
      tags: String(formData.get('tags') || '').split(',').map((t) => t.trim()),
    };

    try {
      const url = editingNews ? `/api/admin/news/${editingNews.id}` : '/api/admin/news';
      const method = editingNews ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Berita berhasil disimpan!');
        setIsNewsModalOpen(false);
        setEditingNews(null);
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Hapus berita ini dari portal?')) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Berita berhasil dihapus');
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menghapus berita', 'error');
    }
  };

  // ==========================================
  // MUSTAHIK STATUS HANDLER
  // ==========================================
  const handleUpdateMustahikStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/mustahik/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status pengajuan diubah menjadi: ${newStatus}`);
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal memperbarui status mustahik', 'error');
    }
  };

  const handleDeleteMustahik = async (id: string) => {
    if (!window.confirm('Hapus usulan mustahik ini?')) return;
    try {
      const res = await fetch(`/api/admin/mustahik/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Usulan mustahik berhasil dihapus');
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menghapus pengajuan', 'error');
    }
  };

  // ==========================================
  // SETTINGS HANDLER (SEO, WA, TG, ZAKAT, TOGGLES)
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Seluruh konfigurasi & parameter berhasil diperbarui!');
        loadAllData();
      } else {
        showToast(data.error || 'Gagal menyimpan pengaturan', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // Test Notification Dispatch
  const handleTestNotification = async (channel: 'WHATSAPP' | 'TELEGRAM') => {
    try {
      const res = await fetch('/api/admin/test-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
      }
    } catch (err) {
      showToast('Gagal mengirim uji coba notifikasi', 'error');
    }
  };

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.bszNumber && d.bszNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-600'
              : 'bg-red-800 text-white border-red-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-2 flex items-center justify-center text-amber-300 shadow-xs border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  PANEL KENDALI ADMIN UPZ LEMBANG
                </span>
                <span className="text-[10px] bg-emerald-600/40 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                  {adminUser?.role || 'Super Admin'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Login sebagai: <strong>{adminUser?.name || 'Amil Pengurus'}</strong> ({adminUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExitToPublic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lihat Web Publik</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-semibold text-red-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 shadow-2xs overflow-x-auto">
        <div className="max-w-7xl mx-auto flex space-x-1 py-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ringkasan</span>
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Donasi & Zakat ({donations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('disbursements')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'disbursements'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Penyaluran 16 Desa ({disbursements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mustahik')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'mustahik'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usulan Mustahik ({mustahikList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'news'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Berita & Galeri ({newsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Integrasi WA & Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SEO & Tag</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pengguna / Admin ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Parameter & Fitur</span>
          </button>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW / RINGKASAN */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Ringkasan Eksekutif UPZ Lembang
                </h2>
                <p className="text-xs text-slate-500">
                  Data real-time penerimaan zakat, penyaluran 16 desa, dan status server.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingDonation(null);
                    setIsDonationModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Catat Donasi Manual</span>
                </button>

                <button
                  onClick={() => {
                    setEditingDisbursement(null);
                    setIsDisbursementModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Catat Penyaluran Baru</span>
                </button>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">Total ZIS Masuk:</span>
                <span className="text-2xl font-black text-emerald-800 block">
                  Rp {(stats?.totalTerkumpul || 750000000).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  {stats?.persentaseCapaian || 63}% dari target tahunan Rp 1,2 M
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">Telah Disalurkan:</span>
                <span className="text-2xl font-black text-slate-900 block">
                  Rp {(stats?.totalDisalurkan || 648000000).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold block">
                  Ke 8 Asnaf di 16 Desa Lembang
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">Saldo Kas Tersedia:</span>
                <span className="text-2xl font-black text-amber-600 block">
                  Rp {(stats?.saldoKas || 102000000).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Bank Syariah Indonesia & Muamalat
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">Penerima & Muzakki:</span>
                <span className="text-2xl font-black text-purple-900 block">
                  {(stats?.totalMustahik || 3420).toLocaleString('id-ID')} Jiwa
                </span>
                <span className="text-[11px] text-purple-700 font-semibold block">
                  Dari {(stats?.totalMuzakki || 1840).toLocaleString('id-ID')} Muzakki
                </span>
              </div>
            </div>

            {/* Quick Status Toggles & Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
                  <span>Parameter Kurs Zakat Aktif</span>
                  <button onClick={() => setActiveTab('settings')} className="text-xs text-emerald-700 hover:underline">
                    Ubah
                  </button>
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Harga Emas Patokan:</span>
                    <strong className="text-slate-900">Rp {siteSettings?.zakatSettings?.goldPricePerGram?.toLocaleString('id-ID')} / gr</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nisab Tahunan (85g):</span>
                    <strong className="text-slate-900">Rp {((siteSettings?.zakatSettings?.goldPricePerGram || 1450000) * 85).toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Zakat Fitrah Per Jiwa:</span>
                    <strong className="text-slate-900">Rp {siteSettings?.zakatSettings?.fitrahRatePerPerson?.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Fidyah Per Hari:</span>
                    <strong className="text-slate-900">Rp {siteSettings?.zakatSettings?.fidyahRatePerDay?.toLocaleString('id-ID')}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
                  <span>Status Integrasi Notifikasi</span>
                  <button onClick={() => setActiveTab('notifications')} className="text-xs text-emerald-700 hover:underline">
                    Kelola API
                  </button>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span>WhatsApp Gateway:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      AKTIF ({siteSettings?.notificationSettings?.waOfficialNumber})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telegram Bot Amil:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      AKTIF ({siteSettings?.notificationSettings?.telegramChatId})
                    </span>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleTestNotification('WHATSAPP')}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-semibold text-center"
                    >
                      Tes Kirim WA
                    </button>
                    <button
                      onClick={() => handleTestNotification('TELEGRAM')}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-semibold text-center"
                    >
                      Tes Kirim TG
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
                  <span>Usulan Mustahik Butuh Survei</span>
                  <button onClick={() => setActiveTab('mustahik')} className="text-xs text-emerald-700 hover:underline">
                    Lihat Semua
                  </button>
                </h3>
                <div className="space-y-2 text-xs">
                  {mustahikList.slice(0, 3).map((m) => (
                    <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="block text-slate-900">{m.mustahikName}</strong>
                        <span className="text-[10px] text-slate-500">Desa {m.village} • {m.asnafCategory}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: KELOLA DONASI & ZAKAT (CRUD) */}
        {/* ======================================================== */}
        {activeTab === 'donations' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900">Daftar Donasi & Zakat Muzakki</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {filteredDonations.length} Transaksi
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/api/admin/export/csv"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </a>

                <button
                  onClick={() => {
                    setEditingDonation(null);
                    setIsDonationModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>+ Catat Donasi Manual</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan ID Transaksi, No. BSZ, atau Nama Muzakki..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                >
                  <option value="all">Semua Status (Pending & Verified)</option>
                  <option value="verified">Terverifikasi (Verified)</option>
                  <option value="pending">Menunggu Pembayaran (Pending)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase text-[11px] font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID & Waktu</th>
                      <th className="px-4 py-3">Muzakki</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                      <th className="px-4 py-3">Metode & Status</th>
                      <th className="px-4 py-3">No. BSZ</th>
                      <th className="px-4 py-3 text-center">Aksi (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 block">{d.id}</span>
                          <span className="text-[10px] text-slate-400">{d.createdAt}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-semibold block ${d.isAnonymous ? 'italic text-amber-800' : 'text-slate-800'}`}>
                            {d.donorName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{d.donorPhoneMasked || d.donorPhone}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                          {d.category}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-black text-emerald-800">
                          {formatRupiah(d.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="block text-[10px] text-slate-500 font-mono">{d.paymentMethod}</span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status === 'verified' ? 'TERVERIFIKASI' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[10px] text-emerald-700 font-bold">
                          {d.bszNumber || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {d.status !== 'verified' && (
                              <button
                                onClick={() => handleVerifyDonation(d.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition"
                                title="Verifikasi Sekarang & Terbitkan BSZ"
                              >
                                Verifikasi
                              </button>
                            )}

                            {d.status === 'verified' && (
                              <button
                                onClick={() => onOpenBSZ(d)}
                                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                title="Lihat Bukti Setor Zakat"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingDonation(d);
                                setIsDonationModalOpen(true);
                              }}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                              title="Edit Data Donasi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteDonation(d.id)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: KELOLA PENYALURAN 16 DESA (CRUD) */}
        {/* ======================================================== */}
        {activeTab === 'disbursements' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-black text-base text-slate-900">Kelola Penyaluran Zakat ke 16 Desa</h3>
                <p className="text-xs text-slate-500">
                  Pencatatan real-time penyaluran bantuan mustahik, bedah rutilahu, dan pemberdayaan ekonomi.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingDisbursement(null);
                  setIsDisbursementModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Tambah Penyaluran Baru</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase text-[11px] font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Tanggal & ID</th>
                      <th className="px-4 py-3">Program</th>
                      <th className="px-4 py-3">Desa Tujuan</th>
                      <th className="px-4 py-3">Asnaf & Penerima</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                      <th className="px-4 py-3">Amil Pendamping</th>
                      <th className="px-4 py-3 text-center">Aksi (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {disbursements.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900 block">{item.disbursedAt?.split(' ')[0]}</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-emerald-800">
                          {item.program}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                          Desa {item.village}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[10px] block w-max">
                            Asnaf: {item.asnaf}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.recipientCount} Penerima Manfaat</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-black text-slate-900">
                          {formatRupiah(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {item.amilSupervisor}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingDisbursement(item);
                                setIsDisbursementModalOpen(true);
                              }}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                              title="Edit Penyaluran"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDisbursement(item.id)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                              title="Hapus Penyaluran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: KELOLA USULAN MUSTAHIK (CRUD) */}
        {/* ======================================================== */}
        {activeTab === 'mustahik' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">Rekomendasi Mustahik dari Warga</h3>
                <p className="text-xs text-slate-500">
                  Tinjau dan ubah status survei lapangan untuk keluarga dhuafa di 16 desa Lembang.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                {mustahikList.length} Pengajuan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mustahikList.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                        Desa {m.village} • Asnaf {m.asnafCategory}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1">{m.mustahikName}</h4>
                      <p className="text-[11px] text-slate-500">{m.address}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteMustahik(m.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Hapus Pengajuan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{m.conditionDescription}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pengusul:</span>
                      <strong className="text-slate-800">{m.applicantName} ({m.contactNumber})</strong>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Status:</span>
                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateMustahikStatus(m.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                          m.status === 'Tersalurkan'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : m.status === 'Disetujui'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : m.status === 'Dalam Peninjauan'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Menunggu Survei">Menunggu Survei</option>
                        <option value="Dalam Peninjauan">Dalam Peninjauan</option>
                        <option value="Disetujui">Disetujui</option>
                        <option value="Tersalurkan">Tersalurkan</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KELOLA BERITA, DAKWAH & TAG (CRUD) */}
        {/* ======================================================== */}
        {activeTab === 'news' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-black text-base text-slate-900">Kelola Berita, Artikel Dakwah & Galeri</h3>
                <p className="text-xs text-slate-500">
                  Publikasikan laporan kegiatan, dokumentasi video, dan artikel edukasi zakat.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingNews(null);
                  setIsNewsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Tulis Berita Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {newsList.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="h-36 w-full bg-slate-100 relative">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-bold">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] text-slate-400 block">{item.date} • {item.author}</span>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                      {item.tags && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.tags.map((t: string, idx: number) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingNews(item);
                        setIsNewsModalOpen(true);
                      }}
                      className="text-xs text-blue-700 font-bold hover:underline"
                    >
                      Edit Artikel
                    </button>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PENGATURAN API WA & TELEGRAM */}
        {/* ======================================================== */}
        {activeTab === 'notifications' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">Pengaturan API WhatsApp & Bot Telegram</h3>
                <p className="text-xs text-slate-500">
                  Sesuaikan nomor gateway, bot token, dan format pesan notifikasi zakat otomatis.
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Pengaturan API</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WhatsApp Config Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      WA
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Integrasi WhatsApp Muzakki</h4>
                      <p className="text-[11px] text-slate-500">Kirim BSZ & Doa ke nomor donatur</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.notificationSettings.waEnabled}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          notificationSettings: {
                            ...siteSettings.notificationSettings,
                            waEnabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700 text-xs">Aktifkan</span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp Official UPZ Lembang
                  </label>
                  <input
                    type="text"
                    value={siteSettings.notificationSettings.waOfficialNumber}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        notificationSettings: {
                          ...siteSettings.notificationSettings,
                          waOfficialNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Template Pesan WhatsApp Resmi (Gunakan variabel {'{DONOR_NAME}'}, {'{BSZ_NUMBER}'}, {'{AMOUNT}'}, {'{CATEGORY}'})
                  </label>
                  <textarea
                    rows={8}
                    value={siteSettings.notificationSettings.waNotificationTemplate}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        notificationSettings: {
                          ...siteSettings.notificationSettings,
                          waNotificationTemplate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTestNotification('WHATSAPP')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kirim Pesan Uji Coba WhatsApp</span>
                </button>
              </div>

              {/* Telegram Config Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      TG
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Integrasi Telegram Bot Amil</h4>
                      <p className="text-[11px] text-slate-500">Alert transaksi masuk ke pengurus</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.notificationSettings.telegramEnabled}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          notificationSettings: {
                            ...siteSettings.notificationSettings,
                            telegramEnabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700 text-xs">Aktifkan</span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telegram Bot Token API
                  </label>
                  <input
                    type="password"
                    value={siteSettings.notificationSettings.telegramBotToken}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        notificationSettings: {
                          ...siteSettings.notificationSettings,
                          telegramBotToken: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telegram Channel / Group Chat ID Pengurus
                  </label>
                  <input
                    type="text"
                    value={siteSettings.notificationSettings.telegramChatId}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        notificationSettings: {
                          ...siteSettings.notificationSettings,
                          telegramChatId: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Template Pesan Alert Telegram Pengurus
                  </label>
                  <textarea
                    rows={6}
                    value={siteSettings.notificationSettings.telegramTemplate}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        notificationSettings: {
                          ...siteSettings.notificationSettings,
                          telegramTemplate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTestNotification('TELEGRAM')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kirim Pesan Uji Coba Telegram</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 7: PENGATURAN SEO, TAG & METADATA */}
        {/* ======================================================== */}
        {activeTab === 'seo' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">Pengaturan Search Engine Optimization (SEO) & Tag</h3>
                <p className="text-xs text-slate-500">
                  Konfigurasikan judul web, deskripsi pencarian Google, kata kunci tag, dan OpenGraph share card.
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Pengaturan SEO</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Meta Title Tag (30 - 60 Karakter) *
                </label>
                <input
                  type="text"
                  value={siteSettings.seoSettings.metaTitle}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      seoSettings: { ...siteSettings.seoSettings, metaTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Meta Description Tag (120 - 160 Karakter) *
                </label>
                <textarea
                  rows={3}
                  value={siteSettings.seoSettings.metaDescription}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      seoSettings: { ...siteSettings.seoSettings, metaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Meta Keywords & Tag Pencarian (Pisahkan dengan tanda koma)
                </label>
                <input
                  type="text"
                  value={siteSettings.seoSettings.metaKeywords}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      seoSettings: { ...siteSettings.seoSettings, metaKeywords: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Canonical URL Resmi
                  </label>
                  <input
                    type="url"
                    value={siteSettings.seoSettings.canonicalUrl}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        seoSettings: { ...siteSettings.seoSettings, canonicalUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    OpenGraph Social Share Image URL
                  </label>
                  <input
                    type="text"
                    value={siteSettings.seoSettings.ogImage}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        seoSettings: { ...siteSettings.seoSettings, ogImage: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 8: PENGATURAN PENGGUNA / ADMIN (RBAC) */}
        {/* ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-black text-base text-slate-900">Manajemen Pengguna & Amil (RBAC)</h3>
                <p className="text-xs text-slate-500">
                  Pengaturan hak akses amil: Super Admin, Bendahara, Amil Penyaluran, dan Staf Humas.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Tambah Admin Baru</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[11px] font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama & ID</th>
                    <th className="px-4 py-3">Email Akun</th>
                    <th className="px-4 py-3">Peran (Role)</th>
                    <th className="px-4 py-3">No. Telepon / WA</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Login Terakhir</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <strong className="text-slate-900 block">{u.name}</strong>
                        <span className="font-mono text-[10px] text-slate-400">{u.id}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{u.phone}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.status === 'active' ? 'AKTIF' : 'NON-AKTIF'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[10px] text-slate-400">{u.lastLogin || 'Belum pernah'}</td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                            title="Edit Pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Hapus admin ${u.name}?`)) return;
                              const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
                              const d = await res.json();
                              if (d.success) {
                                showToast('Admin berhasil dihapus');
                                loadAllData();
                              } else {
                                showToast(d.error || 'Gagal menghapus', 'error');
                              }
                            }}
                            className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: PARAMETER KURS ZAKAT & TOGGLE FITUR */}
        {/* ======================================================== */}
        {activeTab === 'settings' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">Parameter Zakat & Kendali Fitur Website</h3>
                <p className="text-xs text-slate-500">
                  Ubah nisab emas, harga beras fitrah, tarif fidyah, serta sakelar fitur website.
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Seluruh Perubahan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Zakat Rates */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Patokan Nisab & Tarif Zakat
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Harga Emas Murni Per Gram (IDR) *
                  </label>
                  <input
                    type="number"
                    value={siteSettings.zakatSettings.goldPricePerGram}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        zakatSettings: {
                          ...siteSettings.zakatSettings,
                          goldPricePerGram: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Nisab Tahunan Otomatis: Rp {(siteSettings.zakatSettings.goldPricePerGram * 85).toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tarif Zakat Fitrah Per Jiwa (IDR) *
                  </label>
                  <input
                    type="number"
                    value={siteSettings.zakatSettings.fitrahRatePerPerson}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        zakatSettings: {
                          ...siteSettings.zakatSettings,
                          fitrahRatePerPerson: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tarif Fidyah Puasa Per Hari (IDR) *
                  </label>
                  <input
                    type="number"
                    value={siteSettings.zakatSettings.fidyahRatePerDay}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        zakatSettings: {
                          ...siteSettings.zakatSettings,
                          fidyahRatePerDay: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Tahunan Pengumpulan ZIS (IDR) *
                  </label>
                  <input
                    type="number"
                    value={siteSettings.zakatSettings.annualTarget}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        zakatSettings: {
                          ...siteSettings.zakatSettings,
                          annualTarget: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Kendali Sakelar Fitur (Feature Flags)
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <strong className="block text-slate-800">Layanan Donasi & Zakat Online</strong>
                      <span className="text-[11px] text-slate-500">Muzakki dapat bertransaksi melalui QRIS & VA</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettings.featureToggles.enableOnlineDonation}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          featureToggles: {
                            ...siteSettings.featureToggles,
                            enableOnlineDonation: e.target.checked,
                          },
                        })
                      }
                      className="accent-emerald-600 w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <strong className="block text-slate-800">Kalkulator Zakat Interaktif</strong>
                      <span className="text-[11px] text-slate-500">Tampilkan kalkulator zakat penghasilan & maal</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettings.featureToggles.enableCalculator}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          featureToggles: {
                            ...siteSettings.featureToggles,
                            enableCalculator: e.target.checked,
                          },
                        })
                      }
                      className="accent-emerald-600 w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <strong className="block text-slate-800">Formulir Rekomendasi Mustahik</strong>
                      <span className="text-[11px] text-slate-500">Izinkan masyarakat mengusulkan warga miskin</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettings.featureToggles.enableMustahikForm}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          featureToggles: {
                            ...siteSettings.featureToggles,
                            enableMustahikForm: e.target.checked,
                          },
                        })
                      }
                      className="accent-emerald-600 w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <strong className="block text-slate-800">Widget Live Konsultasi Amil</strong>
                      <span className="text-[11px] text-slate-500">Tampilkan floating chat tanya jawab zakat di pojok web</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettings.featureToggles.enableLiveChat}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          featureToggles: {
                            ...siteSettings.featureToggles,
                            enableLiveChat: e.target.checked,
                          },
                        })
                      }
                      className="accent-emerald-600 w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-200 cursor-pointer">
                    <div>
                      <strong className="block text-red-900">Mode Pemeliharaan (Maintenance)</strong>
                      <span className="text-[11px] text-red-700">Tampilkan pengumuman pemeliharaan darurat</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteSettings.featureToggles.maintenanceMode}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          featureToggles: {
                            ...siteSettings.featureToggles,
                            maintenanceMode: e.target.checked,
                          },
                        })
                      }
                      className="accent-red-600 w-5 h-5"
                    />
                  </label>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT DONATION */}
      {/* ======================================================== */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                {editingDonation ? 'Edit Data Transaksi Donasi' : 'Pencatatan Donasi / Zakat Manual (Amil)'}
              </h4>
              <button onClick={() => setIsDonationModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonation} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori ZIS *</label>
                <select name="category" defaultValue={editingDonation?.category || 'Zakat Penghasilan'} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                  <option value="Zakat Penghasilan">Zakat Penghasilan</option>
                  <option value="Zakat Maal">Zakat Maal</option>
                  <option value="Zakat Fitrah">Zakat Fitrah</option>
                  <option value="Infaq & Sedekah">Infaq & Sedekah</option>
                  <option value="Wakaf Tunai">Wakaf Tunai</option>
                  <option value="Program Bencana & Peduli">Program Bencana & Peduli</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp) *</label>
                  <input type="number" name="amount" defaultValue={editingDonation?.amount || 250000} required className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Verifikasi</label>
                  <select name="status" defaultValue={editingDonation?.status || 'verified'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold">
                    <option value="verified">Verified (Terverifikasi)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Muzakki *</label>
                  <input type="text" name="donorName" defaultValue={editingDonation?.donorName || ''} placeholder="Contoh: H. Asep Sunandar" required className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input type="text" name="donorPhone" defaultValue={editingDonation?.donorPhone || '081200000000'} required className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                <select name="paymentMethod" defaultValue={editingDonation?.paymentMethod || 'TUNAI_KANTOR'} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                  <option value="TUNAI_KANTOR">Tunai di Kantor UPZ Lembang</option>
                  <option value="QRIS">QRIS Dinamis</option>
                  <option value="VA_BSI">BSI Syariah</option>
                  <option value="VA_BJB_SYARIAH">Bank BJB Syariah</option>
                  <option value="TRANSFER_MANUAL">Transfer Rekening Amil</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Amil / Keterangan</label>
                <input type="text" name="amilNotes" defaultValue={editingDonation?.amilNotes || 'Diterima tunai di loket UPZ KUA Lembang'} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsDonationModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT DISBURSEMENT */}
      {/* ======================================================== */}
      {isDisbursementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                {editingDisbursement ? 'Edit Data Penyaluran' : 'Catat Penyaluran Zakat Baru'}
              </h4>
              <button onClick={() => setIsDisbursementModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilar Program *</label>
                  <select name="program" defaultValue={editingDisbursement?.program || 'Lembang Peduli'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold">
                    <option value="Lembang Peduli">Lembang Peduli</option>
                    <option value="Lembang Cerdas">Lembang Cerdas</option>
                    <option value="Lembang Sehat">Lembang Sehat</option>
                    <option value="Lembang Makmur">Lembang Makmur</option>
                    <option value="Lembang Taqwa">Lembang Taqwa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Desa Tujuan (16 Desa) *</label>
                  <select name="village" defaultValue={editingDisbursement?.village || 'Cikole'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold">
                    {LEMBANG_VILLAGES.map((v) => (
                      <option key={v} value={v}>Desa {v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Golongan Asnaf *</label>
                  <select name="asnaf" defaultValue={editingDisbursement?.asnaf || 'Fakir'} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Gharimin">Gharimin</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Ibnu Sabil">Ibnu Sabil</option>
                    <option value="Muallaf">Muallaf</option>
                    <option value="Amil">Amil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Penerima (Jiwa)</label>
                  <input type="number" name="recipientCount" defaultValue={editingDisbursement?.recipientCount || 20} required className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Dana Disalurkan (Rp) *</label>
                <input type="number" name="amount" defaultValue={editingDisbursement?.amount || 5000000} required className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Kegiatan Penyaluran *</label>
                <textarea rows={2} name="description" defaultValue={editingDisbursement?.description || 'Penyaluran bantuan beras dan santunan dhuafa.'} required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Foto Bukti Penyaluran (URL Gambar)</label>
                <input type="url" name="photoUrl" defaultValue={editingDisbursement?.photoUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amil Supervisor / Penanggung Jawab</label>
                <input type="text" name="amilSupervisor" defaultValue={editingDisbursement?.amilSupervisor || adminUser?.name || 'Tim Amil UPZ Lembang'} required className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsDisbursementModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Simpan Penyaluran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT NEWS */}
      {/* ======================================================== */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                {editingNews ? 'Edit Berita / Artikel' : 'Tulis Berita & Galeri Baru'}
              </h4>
              <button onClick={() => setIsNewsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Berita *</label>
                <input type="text" name="title" defaultValue={editingNews?.title || ''} required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select name="category" defaultValue={editingNews?.category || 'Penyaluran'} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="Penyaluran">Penyaluran</option>
                    <option value="Edukasi Zakat">Edukasi Zakat</option>
                    <option value="Kemanusiaan">Kemanusiaan</option>
                    <option value="Pengumuman">Pengumuman</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penulis</label>
                  <input type="text" name="author" defaultValue={editingNews?.author || 'Humas UPZ Lembang'} required className="w-full px-3 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan Singkat *</label>
                <textarea rows={2} name="summary" defaultValue={editingNews?.summary || ''} required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Konten Berita Lengkap *</label>
                <textarea rows={5} name="content" defaultValue={editingNews?.content || ''} required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Foto Dokumentasi</label>
                <input type="url" name="imageUrl" defaultValue={editingNews?.imageUrl || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags / Kata Kunci SEO (Pisahkan dengan koma)</label>
                <input type="text" name="tags" defaultValue={editingNews?.tags?.join(', ') || 'zakat lembang, penyaluran, mustahik'} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Publikasikan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT ADMIN USER */}
      {/* ======================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                {editingUser ? 'Edit Akun Pengurus' : 'Tambah Akun Admin Baru'}
              </h4>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const payload = {
                  name: fd.get('name'),
                  email: fd.get('email'),
                  password: fd.get('password'),
                  role: fd.get('role'),
                  phone: fd.get('phone'),
                  status: fd.get('status'),
                };
                const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
                const method = editingUser ? 'PUT' : 'POST';
                const res = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                const d = await res.json();
                if (d.success) {
                  showToast('Akun admin berhasil disimpan');
                  setIsUserModalOpen(false);
                  loadAllData();
                } else {
                  showToast(d.error || 'Gagal menyimpan', 'error');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input type="text" name="name" defaultValue={editingUser?.name || ''} required className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Login *</label>
                <input type="email" name="email" defaultValue={editingUser?.email || ''} required className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
                </label>
                <input type="password" name="password" required={!editingUser} placeholder="••••••••" className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran (Role)</label>
                  <select name="role" defaultValue={editingUser?.role || 'Amil Penyaluran'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold">
                    <option value="Super Admin">Super Admin</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Amil Penyaluran">Amil Penyaluran</option>
                    <option value="Staf Humas">Staf Humas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editingUser?.status || 'active'} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold">
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <input type="text" name="phone" defaultValue={editingUser?.phone || '08122334455'} required className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
