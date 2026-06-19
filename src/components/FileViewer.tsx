/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Download, Eye, FileText, AlertCircle } from 'lucide-react';
import { Attachment } from '../types';
import { motion } from 'motion/react';

interface FileViewerProps {
  attachment: Attachment | undefined;
  title: string;
  onClose: () => void;
}

export default function FileViewer({ attachment, title, onClose }: FileViewerProps) {
  if (!attachment) return null;

  const isImage = attachment.type.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2 text-[#d36b3c]">
            <Eye size={20} />
            <span className="font-bold text-slate-100 text-sm md:text-base truncate max-w-xs md:max-w-md">
              {title} - {attachment.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-[#d36b3c] rounded-xl transition-all cursor-pointer"
              title="تحميل الملف"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              title="إغلاق التبويب"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img
              src={attachment.data}
              alt={attachment.name}
              className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg border border-slate-800"
              referrerPolicy="no-referrer"
            />
          ) : isPdf ? (
            <div className="text-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl max-w-sm">
              <FileText size={54} className="text-[#d36b3c] mx-auto mb-4" />
              <p className="text-sm text-slate-200 font-bold mb-2">مستند PDF رقمي مدمج</p>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                لحمايتكم وملاءمة معايير تصفح الجوال، يرجى تجميل الملف مباشرة أو استعراض نسخته على هاتفك.
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 bg-[#d36b3c] hover:bg-opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download size={16} />
                تحميل واستعراض المستند
              </button>
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-800/50 rounded-2xl">
              <AlertCircle size={48} className="text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-200">صيغة ملف غير مدعومة للمعاينة المباشرة</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">إنما يمكنك تحميله محلياً على جهازك</p>
              <button
                onClick={handleDownload}
                className="py-2 px-4 bg-[#d36b3c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Download size={16} />
                تحميل المف
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/40 text-center text-[10px] text-slate-500 border-t border-slate-800">
          نوع المرفق: {attachment.type} | تطبيق الباخرة الفوري للأرشفة
        </div>
      </motion.div>
    </div>
  );
}
