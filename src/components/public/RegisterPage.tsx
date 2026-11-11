import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    nationalId: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.password) {
      setError('لطفاً فیلدهای الزامی را تکمیل نمایید.');
      return;
    }

    if (formData.password.length < 6) {
      setError('کلمه عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('کلمه عبور با تکرار آن یکسان نیست.');
      return;
    }

    if (!formData.consent) {
      setError('پذیرش قوانین و مقررات آموزشی دبیرستان هیأت امنایی شهید منانی الزامی است.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      nationalId: formData.nationalId.trim() || undefined,
      studentId: formData.studentId.trim() || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    setIsLoading(false);

    if (res.success) {
      if (res.requiresApproval) {
        setSuccessMessage(res.message || 'ثبت‌نام شما ثبت شد و در انتظار تأیید مدیریت مؤسسه است.');
      } else {
        onNavigate('dashboard');
      }
    } else {
      setError(res.error || 'خطا در ثبت‌نام دانش‌آموز.');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 text-right">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            ثبت‌نام دانش‌آموز جدید در دبیرستان شهید منانی
          </h1>
          <p className="text-xs text-slate-500">
            عضویت در سامانه هوشمند و تشکیل پرونده تحصیلی و مشاوره‌ای
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold">ثبت‌نام اولیه با موفقیت انجام شد</h3>
            <p className="text-xs leading-relaxed text-emerald-700">{successMessage}</p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
            >
              بازگشت به صفحه ورود
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: علی محمدی"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  شماره تلفن همراه <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  کد ملی دانش‌آموز
                </label>
                <input
                  type="text"
                  placeholder="۱۰ رقم کد ملی"
                  value={formData.nationalId}
                  onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  شماره دانش‌آموزی (در صورت وجود)
                </label>
                <input
                  type="text"
                  placeholder="مثال: AND-40301"
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                پست الکترونیکی (اختیاری)
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  کلمه عبور <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="حداقل ۶ کاراکتر"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تکرار کلمه عبور <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="تکرار کلمه عبور"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Consent & Security policy */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  صحت اطلاعات هویتی فوق را تأیید نموده و قوانین انضباطی و آموزشی دبیرستان هیأت امنایی شهید منانی را می‌پذیرم.
                </span>
              </label>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                ثبت‌نام اینترنتی تنها دسترسی نقش دانش‌آموز را ایجاد کرده و دسترسی‌های اداری، دبیران و مشاوران به صورت دستی توسط مدیریت تخصیص می‌یابد.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? 'در حال ثبت‌نام...' : 'تکمیل و ثبت‌نام در سامانه'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-600">
          <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            ورود به پرتال
          </button>
        </div>

      </div>
    </div>
  );
};
