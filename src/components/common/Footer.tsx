import React from 'react';
import { GraduationCap, Phone, MapPin, Mail, ShieldCheck, Clock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-white block">مدرسه نمونه دولتی شهید منانی</span>
                <span className="text-xs text-slate-400">سامانه جامع مدیریت آموزشی دوره اول متوسطه</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed text-justify">
              مدرسه نمونه دولتی شهید منانی با بهره‌گیری از کادر آموزشی و دبیران مجرب، امکانات هوشمند و سامانه جامع کارنامه و ارزیابی مستمر، بستری ایده‌آل برای ارتقای علمی و پرورشی دانش‌آموزان فراهم ساخته است.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>تحت نظارت آموزش و پرورش جمهوری اسلامی ایران</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider border-b border-slate-800 pb-2">
              بخش‌های اصلی پرتال
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  صفحه اصلی مؤسسه
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('announcements')} className="hover:text-white transition-colors cursor-pointer">
                  اخبار و اطلاعیه‌های آزمون‌ها
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  دبیران و کادر آموزشی شهید منانی
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                  نشانی و راه‌های ارتباطی
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors cursor-pointer">
                  ورود به پنل کاربری اختصاصی
                </button>
              </li>
            </ul>
          </div>

          {/* Institute Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider border-b border-slate-800 pb-2">
              خدمات آموزشی و مشاوره‌ای
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>کلاس‌های تخصصی پایه‌های هفتم، هشتم و نهم</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>آزمون‌های دوره‌ای و هماهنگ کشوری</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>اتاق مشاوره و هدایت تحصیلی فردی چندگانه</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>کارنامه تحلیلی مقایسه‌ای و رتبه‌بندی کلاسی</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>نسخه قابل نصب موبایل و تبلت (PWA)</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider border-b border-slate-800 pb-2">
              دبیرخانه و روابط عمومی
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>تهران، منطقه ۱۴، میدان شهدا، خیابان پیروزی، مدرسه نمونه دولتی شهید منانی</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-mono tabular-nums text-slate-200">۰۲۱-۳۳۴۴۵۵۶۶</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-mono text-slate-300">info@shahidmanani.sch.ir</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>شنبه تا چهارشنبه: ۷:۳۰ الی ۱۴:۳۰</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© کلیه حقوق مادی و معنوی این سامانه متعلق به مدرسه نمونه دولتی شهید منانی می‌باشد.</p>
          <div className="flex items-center gap-4">
            <span>نسخه هوشمند v2.5.0</span>
            <span aria-hidden="true">·</span>
            <span>طراحی هوشمند مبتنی بر استاندارد ملی</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
