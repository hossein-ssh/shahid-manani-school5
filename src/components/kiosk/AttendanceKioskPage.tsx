import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, AttendanceStats } from '../../types';
import { toPersianDigits } from '../../utils/persianDate';
import {
  Scan,
  Keyboard,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  GraduationCap,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Search,
  School,
  QrCode,
  BellRing
} from 'lucide-react';

interface AttendanceKioskPageProps {
  onExit: () => void;
}

export const AttendanceKioskPage: React.FC<AttendanceKioskPageProps> = ({ onExit }) => {
  const { apiFetch, user } = useAuth();

  // Clock & Date State
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [dayOfWeekName, setDayOfWeekName] = useState<string>('');

  // Scanner & Input State
  const [barcodeBuffer, setBarcodeBuffer] = useState<string>('');
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(0);
  const [manualModalOpen, setManualModalOpen] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gateDirection, setGateDirection] = useState<'auto' | 'entry' | 'exit'>('auto');

  // Result Card & Countdown State
  const [lastCheckInResult, setLastCheckInResult] = useState<{
    success: boolean;
    record?: AttendanceRecord;
    student?: any;
    message: string;
    alreadyRecorded?: boolean;
    isLate?: boolean;
    tardyMinutes?: number;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Live Stats & Recent check-ins list
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);

  // Hidden scanner focus input
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Audio Context chime synthesizer
  const playSound = useCallback((type: 'success' | 'late' | 'already' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // High-tech pleasant double chime (C6 -> G6)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.1); // E6

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.15);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.45);
      } else if (type === 'late') {
        // Tardy warning chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.15); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Error / already chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // AudioContext unavailable or restricted by browser gesture
    }
  }, [soundEnabled]);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      try {
        const pDate = new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(now);
        setCurrentDateStr(pDate);

        const dayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(now);
        setDayOfWeekName(dayName);
      } catch {
        setCurrentDateStr(now.toLocaleDateString());
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's stats & recent logs
  const loadTodayData = useCallback(async () => {
    try {
      const res = await apiFetch('/api/attendance/today');
      if (res.stats) setStats(res.stats);
      if (res.records) setRecentRecords(res.records.slice(0, 6));
    } catch {
      // Offline or initial load fallback
    }
  }, [apiFetch]);

  useEffect(() => {
    loadTodayData();
    const interval = setInterval(loadTodayData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [loadTodayData]);

  // Process check-in for a scanned or manually typed code
  const handleCheckIn = async (code: string, method: 'barcode_scanner' | 'manual_kiosk' = 'barcode_scanner') => {
    const trimmed = code.trim();
    if (!trimmed || isProcessing) return;

    setIsProcessing(true);

    try {
      const res = await apiFetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'x-kiosk-key': 'kiosk_menani_gate_2026',
        },
        body: JSON.stringify({
          code: trimmed,
          method,
          direction: gateDirection,
        }),
      });

      setLastCheckInResult({
        success: true,
        record: res.record,
        student: res.student,
        message: res.message,
        alreadyRecorded: res.alreadyRecorded,
        isLate: res.isLate,
        tardyMinutes: res.tardyMinutes,
      });

      if (res.alreadyRecorded) {
        playSound('already');
      } else if (res.isLate) {
        playSound('late');
      } else {
        playSound('success');
      }

      // Add to local recent list
      if (res.record) {
        setRecentRecords(prev => {
          const filtered = prev.filter(r => r.id !== res.record.id && r.studentId !== res.record.studentId);
          return [res.record, ...filtered].slice(0, 6);
        });
        loadTodayData();
      }

      // Start 5-second countdown to return to ready state
      setCountdown(5);
    } catch (err: any) {
      playSound('error');
      setLastCheckInResult({
        success: false,
        message: err.message || 'دانش‌آموزی با این بارکد یا کارت شناسایی یافت نشد.',
      });
      setCountdown(4);
    } finally {
      setIsProcessing(false);
      setBarcodeBuffer('');
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = '';
        hiddenInputRef.current.focus();
      }
    }
  };

  // Countdown timer for clearing success/error card
  useEffect(() => {
    if (countdown <= 0) {
      setLastCheckInResult(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Global Keydown listener for 2D Hardware Barcode Scanner (acts as rapid keyboard emulator)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in a modal input
      if (manualModalOpen) return;

      const now = Date.now();
      const char = e.key;

      // Enter key signals end of barcode scan
      if (char === 'Enter') {
        if (barcodeBuffer.trim().length >= 3) {
          e.preventDefault();
          handleCheckIn(barcodeBuffer.trim(), 'barcode_scanner');
        }
        setBarcodeBuffer('');
        return;
      }

      // Printable single characters
      if (char.length === 1) {
        // If keystroke arrived within 100ms, it is a barcode scanner typing rapidly
        const isRapid = now - lastKeystrokeTime < 100;
        setLastKeystrokeTime(now);

        if (isRapid || barcodeBuffer.length === 0) {
          setBarcodeBuffer(prev => prev + char);
        } else {
          // Reset buffer if delayed human keystroke
          setBarcodeBuffer(char);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [barcodeBuffer, lastKeystrokeTime, manualModalOpen, isProcessing]);

  // Keep hidden input focused for compatibility with virtual keyboards
  useEffect(() => {
    const keepFocus = () => {
      if (!manualModalOpen && hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    };
    keepFocus();
    const interval = setInterval(keepFocus, 3000);
    return () => clearInterval(interval);
  }, [manualModalOpen]);

  // Handle manual modal submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const target = manualCode.trim();
    setManualModalOpen(false);
    setManualCode('');
    handleCheckIn(target, 'manual_kiosk');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-indigo-600 select-none overflow-x-hidden relative">
      
      {/* Hidden input for scanner focus */}
      <input
        ref={hiddenInputRef}
        type="text"
        aria-hidden="true"
        className="opacity-0 absolute -top-10 left-0 w-1 h-1 pointer-events-none"
        onChange={e => {
          if (e.target.value.includes('\n')) {
            handleCheckIn(e.target.value.trim(), 'barcode_scanner');
            e.target.value = '';
          }
        }}
      />

      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP BAR: School Emblem, Clock & Kiosk Status */}
      <header className="relative z-10 px-6 sm:px-10 py-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        
        {/* Right side: School Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                مدرسه نمونه دولتی شهید منانی
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>گیت هوشمند ورودی فعال</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              سامانه حضور و غیاب الکترونیک · اسکنر ۲بعدی بارکد و QR کد
            </p>
          </div>
        </div>

        {/* Center: Live Digital Clock & Gate Direction Mode */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="hidden md:flex flex-col items-center justify-center px-6 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-indigo-400 drop-shadow-sm">
              {toPersianDigits(currentTime)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
              <span>{dayOfWeekName}</span>
              <span>·</span>
              <span>{currentDateStr}</span>
            </div>
          </div>

          {/* Direction Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setGateDirection('entry')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                gateDirection === 'entry'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ثبت ورود
            </button>
            <button
              type="button"
              onClick={() => setGateDirection('exit')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                gateDirection === 'exit'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ثبت خروج
            </button>
            <button
              type="button"
              onClick={() => setGateDirection('auto')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                gateDirection === 'auto'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="تشخیص خودکار بر اساس بازه شیفت کاری مدرسه"
            >
              هوشمند (خودکار)
            </button>
          </div>
        </div>

        {/* Left side: Controls & Exit Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'قطع صدای بیپ' : 'فعال‌سازی صدای بیپ'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-800/90 hover:bg-slate-800 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <span>بازگشت به پرتال</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN SCANNING & ATTENDANCE DISPLAY AREA */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center relative z-10">
        
        {/* CHECK-IN RESULT CARD (SHOWS UPON SCAN) */}
        {lastCheckInResult ? (
          <div className="w-full max-w-xl transition-all duration-300 animate-in fade-in zoom-in-95">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden text-right ${
                lastCheckInResult.success
                  ? lastCheckInResult.alreadyRecorded
                    ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-600/50 shadow-blue-900/30'
                    : lastCheckInResult.isLate || lastCheckInResult.record?.flag === 'LATE_ENTRY' || lastCheckInResult.record?.flag === 'EARLY_EXIT'
                    ? 'bg-gradient-to-b from-amber-950/80 to-slate-900 border-amber-600/50 shadow-amber-900/30'
                    : 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-600/50 shadow-emerald-900/30'
                  : 'bg-gradient-to-b from-rose-950/80 to-slate-900 border-rose-600/50 shadow-rose-900/30'
              }`}
            >
              {/* Top Countdown Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    lastCheckInResult.success
                      ? lastCheckInResult.isLate || lastCheckInResult.record?.flag === 'LATE_ENTRY' || lastCheckInResult.record?.flag === 'EARLY_EXIT'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${(countdown / 5) * 100}%` }}
                ></div>
              </div>

              {lastCheckInResult.success && lastCheckInResult.record ? (
                <div className="space-y-6">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-2xl ${
                          lastCheckInResult.alreadyRecorded
                            ? 'bg-blue-500/20 text-blue-300'
                            : lastCheckInResult.isLate || lastCheckInResult.record.flag === 'LATE_ENTRY' || lastCheckInResult.record.flag === 'EARLY_EXIT'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {lastCheckInResult.isLate || lastCheckInResult.record.flag === 'LATE_ENTRY' || lastCheckInResult.record.flag === 'EARLY_EXIT' ? (
                          <AlertTriangle className="w-6 h-6" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black block ${
                              lastCheckInResult.alreadyRecorded
                                ? 'text-blue-300'
                                : lastCheckInResult.isLate || lastCheckInResult.record.flag === 'LATE_ENTRY' || lastCheckInResult.record.flag === 'EARLY_EXIT'
                                ? 'text-amber-300'
                                : 'text-emerald-300'
                            }`}
                          >
                            {lastCheckInResult.alreadyRecorded
                              ? 'تردد قبلاً ثبت شده است'
                              : lastCheckInResult.record.statusLabel}
                          </span>
                          {lastCheckInResult.record.flag && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {lastCheckInResult.record.flag === 'ON_TIME_ENTRY' && 'ورود سر وقت'}
                              {lastCheckInResult.record.flag === 'LATE_ENTRY' && 'ورود با تاخیر'}
                              {lastCheckInResult.record.flag === 'ON_TIME_EXIT' && 'خروج عادی'}
                              {lastCheckInResult.record.flag === 'EARLY_EXIT' && 'خروج پیش از موعد'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ثبت زمان {lastCheckInResult.record.direction === 'exit' ? 'خروج' : 'ورود'}: ساعت {toPersianDigits(lastCheckInResult.record.time)}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono text-sm text-slate-400">
                      <span>{toPersianDigits(countdown)} ثانیه تا اسکن بعدی</span>
                    </div>
                  </div>

                  {/* Student Details Card */}
                  <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <div className="w-18 h-18 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center font-bold text-2xl text-indigo-200 shrink-0 shadow-md">
                      {lastCheckInResult.record.studentName.slice(0, 1)}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h2 className="text-lg sm:text-xl font-extrabold text-white">
                        {lastCheckInResult.record.studentName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="font-semibold text-indigo-300">
                          {lastCheckInResult.record.className}
                        </span>
                        <span>·</span>
                        <span>پایه {lastCheckInResult.record.gradeLevel}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">
                          کد: {toPersianDigits(lastCheckInResult.record.studentCode)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SMS Notification Banner */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Send className="w-4 h-4 shrink-0" />
                      <span>
                        {lastCheckInResult.record.direction === 'exit'
                          ? 'پیامک خروج به ولی دانش‌آموز ارسال شد'
                          : 'پیامک ورود به ولی دانش‌آموز ارسال شد'}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {toPersianDigits(lastCheckInResult.record.guardianPhone)}
                    </span>
                  </div>

                  {/* Quick Reset Button */}
                  <button
                    onClick={() => setLastCheckInResult(null)}
                    className="w-full py-2.5 text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    آماده‌سازی برای اسکن دانش‌آموز بعدی (Enter)
                  </button>
                </div>
              ) : (
                /* Error state */
                <div className="space-y-5 text-center p-2">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                    <X className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">شناسایی ناموفق</h3>
                    <p className="text-xs text-rose-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                      {lastCheckInResult.message}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLastCheckInResult(null);
                      setManualModalOpen(true);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
                  >
                    ورود دستی کد ملی دانش‌آموز
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SCANNER READY ZONE (DEFAULT VIEW) */
          <div className="w-full max-w-xl text-center space-y-6">
            
            {/* Visual Scanner Radar / Laser Target */}
            <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-dashed border-indigo-500/50 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 shadow-2xl overflow-hidden group hover:border-indigo-400 transition-colors">
              
              {/* Laser Line Scanning Animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse top-1/2 -translate-y-1/2"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg"></div>
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-indigo-400 rounded-br-lg"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg"></div>

              <div className="relative z-10 space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                  <QrCode className="w-10 h-10 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    کارت هوشمند یا بارکد را مقابل اسکنر بگیرید
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    اسکنر رومیزی ۲بعدی پیوسته آماده دریافت بارکد است
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setManualModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
                <span>ورود دستی / فراموشی کارت هوشمند</span>
              </button>

              <button
                onClick={() => handleCheckIn('2081111111', 'barcode_scanner')}
                className="w-full sm:w-auto px-4 py-3 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="تست اسکن سریع دانش‌آموز نمونه (ابوالفضل رضائی)"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>اسکن تست (کارت ابوالفضل)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM FOOTER: TODAY ATTENDANCE METRICS & RECENT CHECK-INS */}
      <footer className="relative z-10 px-6 sm:px-10 py-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Quick Metrics */}
          {stats && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">حاضرین امروز:</span>
                <span className="font-extrabold text-white font-mono text-sm">
                  {toPersianDigits(stats.presentCount)} نفر
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">تاخیرها:</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">
                  {toPersianDigits(stats.lateCount)} نفر
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">ورود به‌موقع:</span>
                <span className="font-extrabold text-indigo-300 font-mono text-sm">
                  ٪{toPersianDigits(stats.onTimeRate)}
                </span>
              </div>
            </div>
          )}

          {/* Recent 4 check-in chips */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            <span className="text-[11px] text-slate-500 shrink-0 font-medium ml-1">آخرین ورودها:</span>
            {recentRecords.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">هنوز رکوردی ثبت نشده است.</span>
            ) : (
              recentRecords.slice(0, 4).map(rec => (
                <div
                  key={rec.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] shrink-0"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      rec.status === 'present' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span className="font-bold text-slate-200">{rec.studentName}</span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    {toPersianDigits(rec.time.slice(0, 5))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL: MANUAL ENTRY / FORGOT SMART CARD (ورود دستی کد ملی) */}
      {/* ======================================================== */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 text-right shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ورود دستی / فراموشی کارت</h3>
                  <p className="text-[11px] text-slate-400">ثبت تردد با درج کد ملی یا شماره دانش‌آموزی</p>
                </div>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  کد ملی یا کد دانش‌آموزی:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="مثال: 2081111111 یا 901001"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  className="w-full px-4 py-3 text-base text-center font-mono rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* On-screen touch virtual numpad for kiosk touchscreens */}
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => setManualCode(prev => prev + digit)}
                    className="py-2.5 bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 text-white text-base font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    {toPersianDigits(digit)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setManualCode('')}
                  className="py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/60 transition-colors cursor-pointer"
                >
                  پاک کردن
                </button>
                <button
                  type="button"
                  onClick={() => setManualCode(prev => prev + '0')}
                  className="py-2.5 bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 text-white text-base font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  {toPersianDigits(0)}
                </button>
                <button
                  type="button"
                  onClick={() => setManualCode(prev => prev.slice(0, -1))}
                  className="py-2.5 bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  ← حذف
                </button>
              </div>

              {/* Quick sample chips for instant test */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 block">دانش‌آموزان نمونه جهت تست:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setManualCode('2081111111')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg cursor-pointer"
                  >
                    ابوالفضل رضائی (2081111111)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualCode('2080000022')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg cursor-pointer"
                  >
                    علی پوراحمدی (2080000022)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualCode('2080000020')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg cursor-pointer"
                  >
                    سارا احمدی (2080000020)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!manualCode.trim() || isProcessing}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  {isProcessing ? 'در حال ثبت...' : 'ثبت ورود دانش‌آموز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
