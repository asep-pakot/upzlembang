import React, { useState } from 'react';
import {
  Lock,
  User,
  Key,
  X,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any, token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('admin@upzlembang.org');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const res = await response.json();
      if (res.success) {
        onLoginSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        setErrorMsg(res.error || 'Login gagal.');
      }
    } catch (err) {
      setErrorMsg('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (role: 'super' | 'bendahara') => {
    if (role === 'super') {
      setEmail('admin@upzlembang.org');
      setPassword('admin123');
    } else {
      setEmail('bendahara@upzlembang.org');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Masuk Panel Admin UPZ</h3>
              <p className="text-xs text-emerald-200">Kecamatan Lembang Kab. Bandung Barat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Petugas / Amil *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@upzlembang.org"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 block">Akun Pengurus Tersedia:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('super')}
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-[11px] text-slate-700 font-medium text-center"
              >
                Super Admin (Ketua)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('bendahara')}
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-[11px] text-slate-700 font-medium text-center"
              >
                Bendahara Kas
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Masuk ke Panel Kendali Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
