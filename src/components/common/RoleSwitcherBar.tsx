import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, UserCheck, BookOpen, User, HeartHandshake, KeyRound, ChevronUp, ChevronDown, Scan } from 'lucide-react';

interface RoleSwitcherBarProps {
  onRoleSwitched?: () => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ onRoleSwitched }) => {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const roles: { role: UserRole; label: string; icon: React.ReactNode; userDemo: string }[] = [
    { role: 'super_admin', label: 'مدیر ارشد (Super Admin)', icon: <Shield className="w-3.5 h-3.5" />, userDemo: 'admin' },
    { role: 'manager', label: 'مدیر / معاون آموزش (Manager)', icon: <UserCheck className="w-3.5 h-3.5" />, userDemo: 'manager' },
    { role: 'teacher', label: 'دبیر (Teacher)', icon: <BookOpen className="w-3.5 h-3.5" />, userDemo: 'teacher_riazi' },
    { role: 'student', label: 'دانش‌آموز (ابوالفضل رضائی)', icon: <User className="w-3.5 h-3.5" />, userDemo: 'abolfazl' },
    { role: 'counselor', label: 'مشاور (Counselor)', icon: <HeartHandshake className="w-3.5 h-3.5" />, userDemo: 'counselor_dr' },
    { role: 'kiosk', label: 'کیوسک تردد ورودی (اسکنر)', icon: <Scan className="w-3.5 h-3.5" />, userDemo: 'kiosk' },
  ];

  const handleSwitch = async (targetRole: UserRole) => {
    setIsSwitching(true);
    await switchRole(targetRole);
    setIsSwitching(false);
    if (onRoleSwitched) onRoleSwitched();
  };

  return (
    <aside aria-label="تغییر نقش کاربری آزمایشی" className="fixed bottom-4 left-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="تغییر سریع نقش برای ارزیابی سامانه"
          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>تغییر سریع نقش برای ارزیابی سامانه</span>
            {user && (
              <span className="text-[11px] text-indigo-300 font-normal">
                (نقش فعلی: {user.role})
              </span>
            )}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {isOpen && (
          <div className="p-3 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400 leading-tight">
              جهت تست آسان و بی‌درنگ ۵ سطح دسترسی در سامانه اندیشه ساری، نقش مورد نظر را انتخاب نمایید:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {roles.map(item => {
                const isActive = user?.role === item.role;
                return (
                  <button
                    key={item.role}
                    disabled={isSwitching}
                    onClick={() => handleSwitch(item.role)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-right ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-slate-500" />
                <span>رمز حساب‌ها:</span>
                <code className="text-amber-300 font-mono">Role@123456</code>
              </span>
              <a
                href="/AndishehSari_Complete_Project.zip"
                download="AndishehSari_Complete_Project.zip"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded text-[11px] font-medium transition-all shadow-sm"
                title="دانلود کامل سورس پروژه به صورت فایل فشرده ZIP"
              >
                <span>📦 دانلود سورس کامل (ZIP)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
