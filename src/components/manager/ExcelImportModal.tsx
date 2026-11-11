import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persianDate';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { apiFetch } = useAuth();
  const [importType, setImportType] = useState<'teachers' | 'classes' | 'students'>('students');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      const templateData = await apiFetch(`/api/import/templates/${importType}`);
      const worksheet = XLSX.utils.json_to_sheet(templateData.sample);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الگو');
      XLSX.writeFile(workbook, `الگوی_اکسل_${importType === 'teachers' ? 'دبیران' : importType === 'classes' ? 'کلاس‌ها' : 'دانش‌آموزان'}.xlsx`);
    } catch (err: any) {
      console.error('Download template error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorText(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
          setErrorText('فایل اکسل خالی است یا اطلاعاتی در آن یافت نشد.');
          setParsedRows([]);
          return;
        }

        setParsedRows(data);
      } catch (err) {
        setErrorText('خطا در خواندن فایل اکسل. لطفاً از قالب استاندارد اکسل استفاده فرمایید.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmitImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setLoading(true);
      setErrorText(null);
      const res = await apiFetch(`/api/import/${importType}`, {
        method: 'POST',
        body: JSON.stringify({ rows: parsedRows }),
      });
      setResult(res);
      if (res.imported > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorText(err.message || 'خطا در ثبت گروهی اطلاعات.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setParsedRows([]);
    setFileName(null);
    setResult(null);
    setErrorText(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans text-right">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] flex flex-col justify-between overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ثبت گروهی اطلاعات از طریق فایل اکسل
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                بارگذاری سریع اسامی دبیران، کلاس‌ها و دانش‌آموزان با فرمت Excel یا CSV
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'students', label: 'ثبت گروهی دانش‌آموزان' },
            { id: 'teachers', label: 'ثبت گروهی دبیران' },
            { id: 'classes', label: 'ثبت گروهی کلاس‌ها' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setImportType(tab.id as any);
                resetModal();
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                importType === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Instructions & Template Download */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed">
              برای پیشگیری از خطای ستون‌ها، ابتدا فایل اکسل نمونه را دانلود کرده و سطرهای خود را در آن پر نمایید.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود فایل نمونه اکسل</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-3 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
          <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <div>
            <label className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all">
              <span>انتخاب فایل اکسل (.xlsx, .xls, .csv)</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-2">
                فایل انتخاب شده: <span className="font-mono text-indigo-600 dark:text-indigo-400">{fileName}</span> ({toPersianDigits(parsedRows.length)} ردیف آماده ثبت)
              </p>
            )}
          </div>
        </div>

        {/* Error Feedback */}
        {errorText && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Result Feedback */}
        {result && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs space-y-2 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>عملیات با موفقیت انجام شد: {toPersianDigits(result.imported)} رکورد جدید در سامانه ثبت گردید.</span>
            </div>
            {result.errors.length > 0 && (
              <div className="text-[11px] text-amber-800 dark:text-amber-300 pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="font-bold">موارد صرف‌نظر شده یا دارای خطا:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Preview of rows */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              پیش‌نمایش داده‌های خوانده‌شده ({toPersianDigits(parsedRows.length)} سطر):
            </span>
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                  <tr>
                    {Object.keys(parsedRows[0] || {}).map((col, idx) => (
                      <th key={idx} className="p-2 font-bold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.slice(0, 10).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="p-2 text-slate-600 dark:text-slate-300">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 10 && (
              <span className="text-[11px] text-slate-400 block text-center">
                و {toPersianDigits(parsedRows.length - 10)} سطر دیگر...
              </span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            بستن پنجره
          </button>

          <button
            onClick={handleSubmitImport}
            disabled={loading || parsedRows.length === 0}
            className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-md cursor-pointer ${
              loading || parsedRows.length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {loading ? 'در حال ثبت در پایگاه داده...' : `تأیید و وارد کردن ${toPersianDigits(parsedRows.length)} رکورد`}
          </button>
        </div>

      </div>
    </div>
  );
};
