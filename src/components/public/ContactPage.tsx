import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianDate';

export const ContactPage: React.FC = () => {
  const { apiFetch } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Spam protection honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setResultMessage({ type: 'error', text: 'لطفاً نام، شماره تماس و پیام خود را وارد نمایید.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setResultMessage({ type: 'success', text: res.message || 'پیام شما با موفقیت ثبت شد.' });
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
      });
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'خطا در ارسال پیام. لطفاً دوباره تلاش نمایید.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 text-right space-y-12">
      
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">
          تماس با مدرسه نمونه دولتی شهید منانی
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          دبیرخانه و واحد مشاوره مدرسه نمونه دولتی شهید منانی آماده پاسخگویی به پرسش‌های اولیا و دانش‌آموزان گرامی در روزهای شنبه تا چهارشنبه می‌باشد.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              اطلاعات نشانی و تلفن دبیرخانه
            </h3>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 block">نشانی مدرسه:</span>
                <span className="text-xs text-slate-600 leading-relaxed block">
                  استان مازندران، شهرستان ساری، خیابان فرهنگ، مدرسه نمونه دولتی شهید منانی
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 block">تلفن‌های تماس دبیرخانه:</span>
                <span className="font-mono tabular-nums text-sm text-indigo-700 font-bold block" dir="ltr">
                  ۰۱۱-۳۳۱۱۰۰۹۸
                </span>
                <span className="text-xs text-slate-500 block">پاسخگویی سریع در ساعات اداری</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 block">پست الکترونیکی:</span>
                <span className="font-mono text-xs text-slate-700 block" dir="ltr">
                  info@andishesari.ir
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 block">ساعات کاری مجتمع:</span>
                <span className="text-xs text-slate-600 block">شنبه تا چهارشنبه: ۷:۳۰ الی ۱۹:۳۰</span>
                <span className="text-xs text-slate-600 block">پنج‌شنبه‌ها: ۸:۰۰ الی ۱۴:۰۰</span>
              </div>
            </div>

          </div>

          {/* Map Visual Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>موقعیت مکانی در شهر ساری</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              دسترسی آسان از میدان شهدا، خیابان قارن و خیابان فرهنگ. دارای فضای مناسب جهت توقف سرویس‌های مدارس.
            </p>
            <div className="h-32 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs text-slate-400">
              [نقشه ماهواره‌ای خیابان سعدی و فرهنگ ساری]
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">فرم ارسال پیام به روابط عمومی</h3>
              <p className="text-xs text-slate-500 mt-1">
                پیام‌ها مستقیماً به دست مدیریت و روابط عمومی دبیرستان هیأت امنایی شهید منانی خواهد رسید.
              </p>
            </div>

            {resultMessage && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  resultMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {resultMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{resultMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Spam Honeypot */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={e => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رضا احمدی"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    شماره تلفن همراه <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ایمیل (اختیاری)
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    موضوع پیام
                  </label>
                  <input
                    type="text"
                    placeholder="ثبت‌نام، مشاوره، ارزیابی، پیگیری"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  متن پیام یا پرسش شما <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="متن پیام خود را بنویسید..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال ارسال پیام...' : 'ارسال پیام به دبیرخانه'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
