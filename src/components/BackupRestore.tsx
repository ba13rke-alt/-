/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { exportFullBackup, importFullBackup, FullBackup } from '../db';
import { motion } from 'motion/react';

interface BackupRestoreProps {
  onRefreshData: () => void;
}

export default function BackupRestore({ onRefreshData }: BackupRestoreProps) {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const backup = await exportFullBackup();
      const text = JSON.stringify(backup, null, 2);
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `Albahera_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus({
        type: 'success',
        message: 'تم تصدير نسخة احتياطية كاملة بنجاح! تحتوي على جميع المنشآت والملفات المرفقة والصور.',
      });
    } catch (e: any) {
      setStatus({
        type: 'error',
        message: `حدث خطأ أثناء التصدير: ${e.message}`,
      });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const backupObj = JSON.parse(text) as FullBackup;

        if (backupObj.appName !== 'AlbaheraHR') {
          throw new Error('الملف المرفق غير صالح لمؤسسة الباخرة للخدمات الرقمية.');
        }

        if (confirm('تنبيه: استيراد النسخة الاحتياطية سيقوم باستبدال جميع البيانات الحالية بالكامل. هل تود المتابعة؟')) {
          await importFullBackup(backupObj);
          setStatus({
            type: 'success',
            message: 'تم استيراد النسخة الاحتياطية بنجاح وتحديث كافة قواعد البيانات والواجهات!',
          });
          onRefreshData();
        }
      } catch (err: any) {
        setStatus({
          type: 'error',
          message: `خطأ في قراءة ملف الاحتياطي: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow uploading same file again if needed
    e.target.value = '';
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#1b325f]/50 text-[#d36b3c] rounded-xl flex items-center justify-center border border-[#d36b3c]/20">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-base">الاحتفاظ بالبيانات والنسخ الاحتياطي</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            لضمان عدم فقدان بيانات المنشآت والمستندات عند استخدام التطبيق أو ترقية الهاتف.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Export Card */}
        <div className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/60 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-1">حفظ نسخة احتياطية (تصدير)</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              يقوم بتوليد ملف تكنولوجي محمي يحتوي على كافة المنشآت والعمال والاشتراكات وصور المرفقات التي قمت برفعها، لحفظه بأمان.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 w-full py-2.5 px-4 bg-[#1b325f]/80 hover:bg-[#1b325f] text-white border border-[#d36b3c]/30 hover:border-[#d36b3c]/60 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} className="text-[#d36b3c]" />
            تنزيل ملف الاحتياطي المدمج (.json)
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/60 p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-1">استرجاع البيانات من ملف (استيراد)</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              لتحميل البيانات وصور المستندات السابقة من ملف احتياطي مخزن من قبل في هاتفك أو حاسوبك لاستعادة حالتك السابقة فورياً.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 w-full py-2.5 px-4 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload size={14} className="text-emerald-400" />
            اختر ملف الاحتياطي المحفوظ لاستيراده
          </button>
        </div>
      </div>

      {status.type && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl flex items-start gap-2.5 ${
            status.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-200'
              : 'bg-red-950/40 border border-red-800/40 text-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="text-xs leading-relaxed font-medium">{status.message}</span>
        </motion.div>
      )}
    </div>
  );
}
