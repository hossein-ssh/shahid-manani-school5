import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { GraduationCap, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound, Sparkles, RotateCw, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchRole } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Anti-bot Captcha state
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);

  const loadCaptcha = useCallback(async () => {
    try {
      setIsCaptchaLoading(true);
      const res = await fetch('/api/auth/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaId(data.captchaId);
        setCaptchaSvg(data.svg);
        setCaptchaAnswer('');
      }
    } catch (err) {
      console.error('Failed to load captcha', err);
    } finally {
      setIsCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و کلمه عبور را وارد نمایید.');
      return;
    }

    if (!captchaAnswer.trim()) {
      setError('لطفاً کد امنیتی (کپچا) موجود در تصویر را وارد فرمایید.');
      return;
    }

    setIsLoading(true);
    const res = await login(username.trim(), password, captchaId, captchaAnswer.trim());
    setIsLoading(false);

    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.error || 'ورود ناموفق بود.');
      loadCaptcha(); // Automatically refresh captcha on invalid attempt
    }
  };

  const handleQuickRoleLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    const success = await switchRole(role);
    setIsLoading(false);
    if (success) {
      onNavigate('dashboard');
    } else {
      setError('خطا در ورود سریع');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) return;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrUsername: recoveryIdentifier }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryResult(data.message);
      } else {
        setRecoveryResult(data.error || 'خطا در بازیابی');
      }
    } catch {
      setRecoveryResult('خطای ارتباط با سرور.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 text-right">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header Emblem */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            ورود به پرتال هوشمند مدرسه نمونه دولتی شهید منانی
          </h1>
          <p className="text-xs text-slate-500">
            دسترسی به کارنامه، تکالیف، برنامه هفتگی، آزمون‌ها و مشاوره
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              نام کاربری یا شماره همراه
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="مثال: student_ali یا ۰۹۱۱۰۰۰۰۰۰۴"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                کلمه عبور
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
              >
                فراموشی رمز عبور؟
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Anti-Bot Captcha Security Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>کد امنیتی ضد ربات (کپچا)</span>
              </label>
              <span className="text-[10px] text-slate-400">حفاظت در برابر اسپم</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Captcha Image */}
              <div
                className="relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center min-w-[150px] h-[46px] shadow-xs cursor-pointer select-none"
                onClick={loadCaptcha}
                title="جهت بارگذاری مجدد کد کلیک نمایید"
              >
                {isCaptchaLoading ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>در حال دریافت...</span>
                  </div>
                ) : captchaSvg ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                    className="w-[150px] h-[46px] flex items-center justify-center"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">خطا در بارگذاری</span>
                )}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={isCaptchaLoading}
                title="بارگذاری کد امنیتی جدید"
                className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <RotateCw className={`w-4 h-4 ${isCaptchaLoading ? 'animate-spin text-indigo-500' : ''}`} />
              </button>

              {/* Captcha Answer Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  required
                  maxLength={6}
                  dir="ltr"
                  autoComplete="off"
                  placeholder="کد تصویر"
                  value={captchaAnswer}
                  onChange={e => setCaptchaAnswer(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs text-center font-mono font-extrabold tracking-widest uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'در حال بررسی...' : 'ورود به حساب کاربری'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher inside Login */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>ورود سریع آزمایشی به عنوان:</span>
            </span>
            <span className="text-[10px] text-slate-400">بدون نیاز به تایپ رمز</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('super_admin')}
              className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg transition-colors cursor-pointer text-center"
            >
              مدیر ارشد (مدیریت کلان)
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('manager')}
              className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg transition-colors cursor-pointer text-center"
            >
              معاون آموزشی (ثبت و مدیریت)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('teacher')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg transition-colors cursor-pointer text-center"
            >
              دبیر (استاد حسینی)
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('counselor')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg transition-colors cursor-pointer text-center"
            >
              مشاور (دکتر ساداتی)
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleQuickRoleLogin('student')}
            className="w-full py-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer text-center mt-1"
          >
            دانش‌آموز نمونه: ابوالفضل رضائی (پایه نهم - کلاس ۹۰۱)
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="font-semibold text-slate-700 mb-0.5">ثبت‌نام مستقیم توسط دانش‌آموز مسدود است</p>
          <p className="text-[11px] leading-relaxed text-slate-500">
            نام کاربری و رمز ورود منحصراً توسط معاونت آموزشی مدرسه نمونه دولتی شهید منانی صادر می‌شود. در صورت عدم دریافت با دفتر آموزش تماس بگیرید.
          </p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-right space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>بازیابی کلمه عبور</span>
              </h3>
              <button
                onClick={() => {
                  setForgotModalOpen(false);
                  setRecoveryResult(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              شماره تلفن همراه یا نام کاربری ثبت‌شده خود را وارد کنید تا پیامک بازیابی برای شما ارسال گردد.
            </p>

            {recoveryResult ? (
              <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-800 border border-indigo-200">
                {recoveryResult}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="شماره تماس یا نام کاربری"
                  value={recoveryIdentifier}
                  onChange={e => setRecoveryIdentifier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  ارسال کد تأیید بازیابی
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
