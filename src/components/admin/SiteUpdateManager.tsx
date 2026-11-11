import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SiteUpdatePackage } from '../../types';
import {
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  FileCode,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  Server,
  Zap,
} from 'lucide-react';

export const SiteUpdateManager: React.FC = () => {
  const { apiFetch } = useAuth();
  const [updates, setUpdates] = useState<SiteUpdatePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New update modal form
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('v2.5.1');
  const [description, setDescription] = useState('');
  const [changelogText, setChangelogText] = useState('بهبود رابط کاربری\nارتقای پایداری و امنیت سامانه\nبهینه‌سازی کارایی در گوشی‌های هوشمند');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/admin/site-updates');
      setUpdates(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleApplyUpdate = async (id: string) => {
    try {
      setApplyingId(id);
      await apiFetch(`/api/admin/site-updates/${id}/apply`, { method: 'POST' });
      setFeedback({ type: 'success', text: 'به‌روزرسانی با موفقیت بر روی سامانه اعمال گردید.' });
      fetchUpdates();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطا در اعمال به‌روزرسانی' });
    } finally {
      setApplyingId(null);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !version) return;

    try {
      setLoading(true);
      const changelog = changelogText.split('\n').map(s => s.trim()).filter(Boolean);
      await apiFetch('/api/admin/site-updates', {
        method: 'POST',
        body: JSON.stringify({
          title,
          version,
          description,
          changelog,
          fileSize: '3.2 MB',
        }),
      });
      setFeedback({ type: 'success', text: 'بسته به‌روزرسانی با موفقیت به سامانه افزوده شد.' });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchUpdates();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطا در ثبت بسته به‌روزرسانی' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      setLoading(true);
      const backupData = await apiFetch('/api/admin/backup/export');
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shahid_manani_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', text: 'نسخه پشتیبان پایگاه داده با موفقیت دانلود شد.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'خطا در استخراج نسخه پشتیبان.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await apiFetch('/api/admin/backup/restore', {
          method: 'POST',
          body: JSON.stringify({ backupData: json }),
        });
        setFeedback({ type: 'success', text: 'اطلاعات سامانه با موفقیت از فایل پشتیبان بازگردانی شد.' });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setFeedback({ type: 'error', text: 'فایل پشتیبان انتخاب شده نامعتبر یا خراب است.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 text-right font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>پنل اختصاصی مدیریت ارشد مدرسه</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">مرکز به‌روزرسانی سامانه و مدیریت نسخه‌ها</h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            از این بخش می‌توانید نسخه‌های جدید نرم‌افزار مدرسه نمونه دولتی شهید منانی را بارگذاری نموده، گزارش تغییرات را بررسی کنید و از کلیه داده‌های سامانه نسخه پشتیبان تهیه نمایید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportBackup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer shadow-sm"
          >
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>تهیه فایل پشتیبان (Backup)</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Upload className="w-4 h-4" />
            <span>بارگذاری بسته جدید</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline cursor-pointer">
            بستن
          </button>
        </div>
      )}

      {/* Backup and Restore Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">پشتیبان‌گیری اضطراری از داده‌ها</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">شامل کلیه نمرات، کاربران، کلاس‌ها و کارنامه‌ها</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            قبل از اعمال هرگونه بسته به‌روزرسانی بزرگ، توصیه می‌شود یک کپی کامل از داده‌های مؤسسه را در حافظه محلی رایانه خود ذخیره فرمایید.
          </p>
          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>دانلود فوری فایل پایگاه داده (JSON)</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">بازیابی اطلاعات سامانه</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">بازگردانی سیستم از فایل پشتیبان ذخیره‌شده</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            با انتخاب فایل پشتیبان قبلی، ساختار داده‌ها و آخرین نمرات ثبت‌شده بلافاصله بازنشانی خواهد شد.
          </p>
          <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/30 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>انتخاب فایل پشتیبان جهت بازیابی</span>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Update Packages Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">تاریخچه بسته‌های به‌روزرسانی سامانه</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">لیست تغییرات فنی و ارتقاهای نرم‌افزاری</p>
            </div>
          </div>
          <button
            onClick={fetchUpdates}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg cursor-pointer"
            title="بازخوانی لیست"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {updates.map((pkg) => (
            <div key={pkg.id} className="p-5 sm:p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                      {pkg.version}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{pkg.title}</h4>
                    {pkg.status === 'applied' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>اعمال شده</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>آماده نصب</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{pkg.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500 font-mono">{pkg.releaseDate}</span>
                  {pkg.status !== 'applied' && (
                    <button
                      onClick={() => handleApplyUpdate(pkg.id)}
                      disabled={applyingId === pkg.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {applyingId === pkg.id ? 'در حال اعمال...' : 'نصب و اعمال به‌روزرسانی'}
                    </button>
                  )}
                </div>
              </div>

              {/* Changelog items */}
              {pkg.changelog && pkg.changelog.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                    تغییرات این نسخه:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    {pkg.changelog.map((c, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create/Upload Update Package */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">بارگذاری بسته به‌روزرسانی سامانه</h3>
            <form onSubmit={handleCreateUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  شماره نسخه (Version)
                </label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="مثال: v2.5.1"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان به‌روزرسانی
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: ارتقای کارایی و بهینه‌سازی بارگذاری کارنامه‌ها"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  شرح مختصر
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح کلی درباره بهبودها"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  گزارش تغییرات (هر خط یک مورد)
                </label>
                <textarea
                  rows={4}
                  value={changelogText}
                  onChange={(e) => setChangelogText(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  ثبت و بارگذاری بسته
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
