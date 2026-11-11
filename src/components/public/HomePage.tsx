import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Announcement, SystemSettings } from '../../types';
import { formatPersianDate, toPersianDigits } from '../../utils/persianDate';
import {
  GraduationCap,
  BookOpen,
  Users,
  Video,
  HeartHandshake,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Award,
  Sparkles,
  PhoneCall,
  Clock,
  MapPin,
  ChevronLeft,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user, apiFetch } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    apiFetch('/api/announcements')
      .then(res => setAnnouncements(res.slice(0, 3)))
      .catch(() => {});
    apiFetch('/api/settings')
      .then(res => setSettings(res))
      .catch(() => {});
  }, [apiFetch]);

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-right">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>دبیرستان دوره اول متوسطه پیشرو در آموزش هوشمند و ارتقای علمی</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
                سامانه هوشمند <span className="text-indigo-600">مدرسه نمونه دولتی شهید منانی</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-justify">
                پورتال یکپارچه مدیریت آموزش، کارنامه تحلیلی الکترونیکی، مقایسه رتبه در کلاس و پایه، برنامه هفتگی، و ارزیابی پیشرفت تحصیلی دانش‌آموزان در محیطی پیشرفته و نظام‌مند.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    <span>ورود به پنل کاربری شما</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('login')}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
                    >
                      <span>ورود به پرتال هوشمند مدرسه</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-500 font-medium px-2">
                      (نام کاربری و رمز توسط معاونت آموزشی صادر می‌شود)
                    </span>
                  </>
                )}
                <button
                  onClick={() => onNavigate('about')}
                  className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  معرفی کادر علمی
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-right">
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {toPersianDigits(15)}+
                  </span>
                  <p className="text-xs text-slate-500 mt-1">سال سابقه آموزشی در ساری</p>
                </div>
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
                    {toPersianDigits(85)}+
                  </span>
                  <p className="text-xs text-slate-500 mt-1">رتبه زیر ۱۰۰۰ در کنکور</p>
                </div>
                <div>
                  <span className="text-2xl lg:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                    {toPersianDigits(100)}٪
                  </span>
                  <p className="text-xs text-slate-500 mt-1">سامانه برخط و بدون قطعی</p>
                </div>
              </div>

            </div>

            {/* Right Visual Architecture Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-2xl overflow-hidden border border-slate-800">
                
                {/* Persian Architectural Geometric Motif */}
                <div className="absolute -top-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600/60 flex items-center justify-center text-white">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">مدرسه نمونه دولتی شهید منانی</h3>
                        <p className="text-xs text-indigo-200">سال تحصیلی ۱۴۰۴-۱۴۰۵</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>نیم‌سال فعال</span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">کارنامه تحلیلی و ثبت دقیق نمرات</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          ارزیابی مستمر، کوئیزهای هفتگی، امتحانات میان‌ترم و گزارش پیشرفت اختصاصی
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <Video className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">کلاس‌های آنلاین با سوئیچ سراسری</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          مدیریت متمرکز جلسات وبیناری با قابلیت فعال/غیرفعال‌سازی توسط مدیریت
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <HeartHandshake className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">اتاق مشاوره و هدایت تحصیلی</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          رزرو زمان مشاوره، گفتگوی مستقیم دانش‌آموز با مشاور و یادداشت‌های محرمانه
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>مازندران، ساری، خیابان فرهنگ</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-300">۰۱۱-۳۳۱۱۰۰۹۸</span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Educational Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            امکانات و ماژول‌های سامانه مدرسه نمونه دولتی شهید منانی
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            طراحی شده بر اساس آخرین استانداردهای آموزشی و تجارب مدارس هوشمند کشور
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all text-right">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">مدیریت نمرات و ارزیابی</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ثبت نمرات توسط دبیران، ثبت پیش‌نویس، تایید نهایی، محاسبه میانگین کلاسی و دسترسی اختصاصی اولیا و دانش‌آموزان به کارنامه.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all text-right">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">برنامه هفتگی هوشمند</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تقویم زمان‌بندی هفتگی شنبه تا پنج‌شنبه با سیستم پیشرفته جلوگیری از تداخل کلاس‌ها و اتاق‌ها برای اساتید و دانش‌آموزان.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all text-right">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">مشاوره و هدایت تحصیلی</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تقویم روزهای حضور مشاور، گفتگوی مستقیم، دسته‌بندی موضوعی (درسی، انگیزشی، کنکور) با حفظ حریم خصوصی کامل پرونده دانش‌آموز.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all text-right">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">کلاس‌های آنلاین با سوئیچ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              سامانه جلسات برخط و وبینارها که در هر زمان با کلید مدیریتی قابل فعال/غیرفعال‌سازی بدون از بین رفتن داده‌ها می‌باشد.
            </p>
          </div>

        </div>
      </section>

      {/* Latest Announcements */}
      <section className="bg-slate-100/70 py-12 lg:py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                آخرین اخبار و اطلاعیه‌های مؤسسه
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                اطلاعیه‌های رسمی امتحانات، همایش‌ها و برنامه‌های آموزشی
              </p>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between text-right"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatPersianDate(ann.publishedAt)}</span>
                    <span className="text-indigo-600 font-medium">
                      {ann.targetAudience === 'all' ? 'عمومی' : ann.targetAudience === 'students' ? 'ویژه دانش‌آموزان' : 'ویژه دبیران'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">منتشر شده توسط: {ann.authorName || 'روابط عمومی'}</span>
                  <button
                    onClick={() => onNavigate('announcements')}
                    className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    مطالعه کامل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-right flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              آماده مشاهده کارنامه و پیشرفت تحصیلی خود هستید؟
            </h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              دانش‌آموزان پایه‌های هفتم، هشتم و نهم مدرسه نمونه دولتی شهید منانی می‌توانند با مشخصات دریافتی از مدرسه، کارنامه تحصیلی، ریزنمرات مقایسه‌ای و رتبه‌های کلاسی و پایه‌ای خود را مشاهده نمایند.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3 text-sm font-bold text-indigo-700 bg-white hover:bg-indigo-50 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              ورود به کارنامه و پرتال
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-3 text-sm font-semibold text-white bg-indigo-800/80 hover:bg-indigo-900/90 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              اطلاعات تماس و نشانی
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
