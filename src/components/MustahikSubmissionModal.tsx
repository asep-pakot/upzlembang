import React, { useState } from 'react';
import {
  Send,
  X,
  MapPin,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { LEMBANG_VILLAGES } from '../utils/constants';

interface MustahikSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MustahikSubmissionModal: React.FC<MustahikSubmissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [applicantName, setApplicantName] = useState('');
  const [mustahikName, setMustahikName] = useState('');
  const [village, setVillage] = useState(LEMBANG_VILLAGES[0]);
  const [address, setAddress] = useState('');
  const [asnafCategory, setAsnafCategory] = useState('Fakir');
  const [conditionDescription, setConditionDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/mustahik/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          mustahikName,
          village,
          address,
          asnafCategory,
          conditionDescription,
          contactNumber,
        }),
      });

      const res = await response.json();
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 2500);
      } else {
        setErrorMsg(res.error || 'Terjadi kesalahan saat menyimpan usulan.');
      }
    } catch (err) {
      setErrorMsg('Gagal mengirim formulir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Formulir Rekomendasi Mustahik</h3>
              <p className="text-xs text-emerald-200">
                Penyaluran Zakat Tepat Sasaran se-Kecamatan Lembang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-700/60 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successMsg ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Usulan Berhasil Dikirim!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
              Setiap laporan yang masuk akan ditindaklanjuti dengan <strong>verifikasi dan survei langsung</strong> oleh tim Amil Desa UPZ Lembang guna memastikan kelayakan sesuai ketentuan syariat.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Anda (Pengusul / RT / Warga) *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Contoh: Bpk. Dadang (Ketua RT 03)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Pengusul *
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contoh: 08122334455"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Calon Mustahik (Warga yang Membutuhkan) *
                </label>
                <input
                  type="text"
                  required
                  value={mustahikName}
                  onChange={(e) => setMustahikName(e.target.value)}
                  placeholder="Contoh: Ibu Mak Emi (Lansia Dhuafa)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Desa di Kecamatan Lembang *
                </label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {LEMBANG_VILLAGES.map((v) => (
                    <option key={v} value={v}>
                      Desa {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Asnaf yang Sesuai
                </label>
                <select
                  value={asnafCategory}
                  onChange={(e) => setAsnafCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Fakir">Fakir (Tidak memiliki penghasilan sama sekali)</option>
                  <option value="Miskin">Miskin (Penghasilan sangat kurang untuk makan)</option>
                  <option value="Gharimin">Gharimin (Terlilit hutang darurat medis/kebutuhan)</option>
                  <option value="Fisabilillah">Fisabilillah (Guru ngaji sukarela/madrasah)</option>
                  <option value="Ibnu Sabil">Ibnu Sabil (Musafir kehabisan bekal)</option>
                  <option value="Muallaf">Muallaf (Mualaf yang membutuhkan penguatan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap / Patokan Rumah
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kp. Pasir Ipis RT 02/08 dekat masjid"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kondisi Ekonomi & Alasan Membutuhkan Bantuan Mendesak *
              </label>
              <textarea
                required
                rows={3}
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                placeholder="Ceritakan kondisi rumah, tanggungan keluarga, kondisi kesehatan, atau kebutuhan pendidikan anak..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Usulan Rekomendasi'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
