/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Facility, CommercialRecord, Attachment } from '../types';
import { calculateDaysLeft, getAlertColor, fileToBase64, formatArabicDate } from '../utils';
import { 
  FileText, Plus, Trash2, Edit, Calendar, 
  FilePlus, Paperclip, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CRListProps {
  facility: Facility;
  records: CommercialRecord[];
  onSaveRecord: (rec: CommercialRecord) => void;
  onDeleteRecord: (id: string) => void;
  onViewAttachment: (attachment: Attachment, title: string) => void;
}

export default function CRList({
  facility,
  records,
  onSaveRecord,
  onDeleteRecord,
  onViewAttachment,
}: CRListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CommercialRecord | null>(null);

  // Form states
  const [crNumber, setCrNumber] = useState('');
  const [crName, setCrName] = useState('');
  const [crExpiryDate, setCrExpiryDate] = useState('');
  const [crAttachment, setCrAttachment] = useState<Attachment | undefined>(undefined);

  const [licenseName, setLicenseName] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [licenseAttachment, setLicenseAttachment] = useState<Attachment | undefined>(undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cr' | 'license') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const attach = await fileToBase64(file);
        if (type === 'cr') {
          setCrAttachment(attach);
        } else {
          setLicenseAttachment(attach);
        }
      } catch (err) {
        alert('حدث خطأ أثناء تحميل الملف، يرجى المحاولة بصورة أصغر أو ملف آخر.');
      }
    }
  };

  const handleEdit = (rec: CommercialRecord) => {
    setEditingRecord(rec);
    setCrNumber(rec.crNumber);
    setCrName(rec.crName);
    setCrExpiryDate(rec.crExpiryDate);
    setCrAttachment(rec.crAttachment);
    setLicenseName(rec.licenseName);
    setLicenseExpiryDate(rec.licenseExpiryDate);
    setLicenseAttachment(rec.licenseAttachment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setCrNumber('');
    setCrName('');
    setCrExpiryDate('');
    setCrAttachment(undefined);
    setLicenseName('');
    setLicenseExpiryDate('');
    setLicenseAttachment(undefined);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: CommercialRecord = {
      id: editingRecord ? editingRecord.id : 'cr-' + Math.random().toString(36).substr(2, 9),
      facilityId: facility.id,
      crNumber,
      crName,
      crExpiryDate,
      crAttachment,
      licenseName,
      licenseExpiryDate,
      licenseAttachment,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
    };

    onSaveRecord(newRecord);
    handleCancel();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">رصد السجلات والرخص التجارية</h2>
          <p className="text-xs text-slate-400 mt-1">إشراف وتنبؤ لتواريخ انتهاء رخص مكتب ومستندات: {facility.name}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="py-2.5 px-4 bg-[#d36b3c] hover:bg-opacity-90 text-white font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-700/10"
        >
          <Plus size={16} />
          {showForm ? 'إخفاء الاستمارة' : 'تسجيل وثيقة جديدة'}
        </motion.button>
      </div>

      {/* Form Slideover or Container */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-900 border border-slate-700/60 rounded-3xl p-6 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-sm font-extrabold text-[#d36b3c] border-b border-slate-800 pb-2">
                {editingRecord ? 'تحديث السجل التجاري والرخصة' : 'تعبئة وثيقة السجل التجاري والرخصة الحكومية'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section A: Commercial Record (السجل الاجتماعي) */}
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-[#d36b3c] rounded-full" />
                    البيانات الأساسية للسجل التجاري
                  </h4>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-xs font-medium">اسم السجل (مثال: الفرع الرئيسي، مستودع جدة)</label>
                    <input
                      type="text"
                      required
                      value={crName}
                      onChange={(e) => setCrName(e.target.value)}
                      placeholder="اسم السجل التجاري..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-right">
                      <label className="text-slate-400 text-xs font-medium">رقم السجل التجاري</label>
                      <input
                        type="text"
                        required
                        value={crNumber}
                        onChange={(e) => setCrNumber(e.target.value)}
                        placeholder="40300XXXXX"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                      />
                    </div>

                    <div className="space-y-1 text-right">
                      <label className="text-slate-400 text-xs font-medium">تاريخ انتهاء السجل</label>
                      <input
                        type="date"
                        required
                        value={crExpiryDate}
                        onChange={(e) => setCrExpiryDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                      />
                    </div>
                  </div>

                  {/* CR file attacher */}
                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-xs font-medium block">صورة أو ملف السجل التجاري 📷📄</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 border-dashed rounded-xl cursor-pointer text-slate-300 hover:text-[#d36b3c] hover:border-[#d36b3c] transition-all text-xs">
                        <Paperclip size={14} />
                        إرفاق السجل التجاري
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(e, 'cr')}
                          className="hidden"
                        />
                      </label>
                      {crAttachment && (
                        <div className="flex items-center gap-2 bg-[#d36b3c]/10 px-2.5 py-1 rounded-lg text-xs text-[#d36b3c]">
                          <span className="truncate max-w-[120px] font-mono">{crAttachment.name}</span>
                          <button
                            type="button"
                            onClick={() => setCrAttachment(undefined)}
                            className="text-red-400 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section B: Accompanying License (الرخصة التجارية) */}
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-[#d36b3c] rounded-full" />
                    بيانات الرخصة المصاحبة (بلدي، دفاع مدني...)
                  </h4>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-xs font-medium">اسم الرخصة (مثال: رخصة بلدي، دفاع مدني)</label>
                    <input
                      type="text"
                      required
                      value={licenseName}
                      onChange={(e) => setLicenseName(e.target.value)}
                      placeholder="رخصة بلدي للفرع..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-xs font-medium">تاريخ انتهاء الرخصة</label>
                    <input
                      type="date"
                      required
                      value={licenseExpiryDate}
                      onChange={(e) => setLicenseExpiryDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                    />
                  </div>

                  {/* License file attacher */}
                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-xs font-medium block">صورة أو ملف الرخصة 📷📄</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 border-dashed rounded-xl cursor-pointer text-slate-300 hover:text-[#d36b3c] hover:border-[#d36b3c] transition-all text-xs">
                        <Paperclip size={14} />
                        إرفاق مستند الرخصة
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(e, 'license')}
                          className="hidden"
                        />
                      </label>
                      {licenseAttachment && (
                        <div className="flex items-center gap-2 bg-[#d36b3c]/10 px-2.5 py-1 rounded-lg text-xs text-[#d36b3c]">
                          <span className="truncate max-w-[120px] font-mono">{licenseAttachment.name}</span>
                          <button
                            type="button"
                            onClick={() => setLicenseAttachment(undefined)}
                            className="text-red-400 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#d36b3c] hover:bg-opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {editingRecord ? 'حفظ التعديلات' : 'تسجيل البيانات الآن'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {records.length === 0 ? (
          <div className="lg:col-span-2 text-center py-16 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl">
            <FileText size={48} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-bold text-slate-400">لا يوجد سجلات ببلدي ومستندات تجارية مضافة.</p>
            <p className="text-xs text-slate-500 mt-1">يمكنك البدء بإضافتها لمتابعة حالة صلاحيتها والتنويه بالأيام المتبقية.</p>
          </div>
        ) : (
          records.map((rec) => {
            const crDays = calculateDaysLeft(rec.crExpiryDate);
            const crAlert = getAlertColor(crDays);
            
            const licenseDays = calculateDaysLeft(rec.licenseExpiryDate);
            const licenseAlert = getAlertColor(licenseDays);

            return (
              <motion.div
                key={rec.id}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                {/* Card Title Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-right">
                    <div className="w-10 h-10 bg-[#1b325f]/40 text-[#d36b3c] rounded-xl flex items-center justify-center border border-[#d36b3c]/10 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">{rec.crName}</h4>
                      <p className="text-[10px] text-slate-500">رقم السجل: {rec.crNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-[#d36b3c] transition-all cursor-pointer"
                      title="تعديل السجل ورخصته"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل تود بالتأكيد حذف ملف (${rec.crName}) بأكمله؟`)) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                      title="حذف المستند"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Main Body - Split into CR and License columns or panels */}
                <div className="p-5 space-y-4 flex-1">
                  {/* CR Row details */}
                  <div className={`p-3.5 rounded-2xl border ${
                    crAlert === 'red' ? 'border-red-500/20 bg-red-950/10' :
                    crAlert === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/10' :
                    'border-emerald-500/10 bg-emerald-950/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">السجل التجاري الرئيسي</span>
                      
                      {/* Badge and Dynamic Days Calculations */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        crAlert === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                        crAlert === 'yellow' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      }`}>
                        {crDays <= 0 ? 'منتهي الصلاحية 🔴' : `متبقي ${crDays} يوم ⏳`}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-slate-400">ينتهي في: {formatArabicDate(rec.crExpiryDate)}</p>
                      
                      {rec.crAttachment ? (
                        <button
                          onClick={() => onViewAttachment(rec.crAttachment!, `سجل ${rec.crName}`)}
                          className="flex items-center gap-1 text-[11px] text-[#d36b3c] hover:underline font-bold cursor-pointer"
                        >
                          <Paperclip size={12} />
                          استعراض السجل المرفق
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600">لا يوجد مرفق</span>
                      )}
                    </div>
                  </div>

                  {/* License Row details */}
                  <div className={`p-3.5 rounded-2xl border ${
                    licenseAlert === 'red' ? 'border-red-500/20 bg-red-950/10' :
                    licenseAlert === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/10' :
                    'border-emerald-500/10 bg-emerald-950/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-300">الرخصة المصاحبة:</span>
                        <span className="text-xs text-slate-400 font-bold mr-1">{rec.licenseName}</span>
                      </div>

                      {/* Badge and Dynamic Days Calculations */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        licenseAlert === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                        licenseAlert === 'yellow' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      }`}>
                        {licenseDays <= 0 ? 'منتهي الصلاحية 🔴' : `متبقي ${licenseDays} يوم ⏳`}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-slate-400">ينتهي في: {formatArabicDate(rec.licenseExpiryDate)}</p>
                      
                      {rec.licenseAttachment ? (
                        <button
                          onClick={() => onViewAttachment(rec.licenseAttachment!, `رخصة ${rec.licenseName}`)}
                          className="flex items-center gap-1 text-[11px] text-[#d36b3c] hover:underline font-bold cursor-pointer"
                        >
                          <Paperclip size={12} />
                          استعراض الرخصة المرفقة
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600">لا يوجد مرفق</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-950/20 text-center text-[10px] text-slate-500 border-t border-slate-800">
                  سجل تجاري مركب لمؤسسة الباخرة
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
