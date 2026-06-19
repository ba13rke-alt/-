/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Facility, GovSubscription, Attachment } from '../types';
import { calculateDaysLeft, getAlertColor, fileToBase64, formatArabicDate } from '../utils';
import { 
  Plus, Trash2, Edit, CloudLightning, Calendar, 
  Paperclip, Tag, CalendarDays, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubscriptionListProps {
  facility: Facility;
  records: GovSubscription[];
  onSaveRecord: (rec: GovSubscription) => void;
  onDeleteRecord: (id: string) => void;
  onViewAttachment: (attachment: Attachment, title: string) => void;
}

export default function SubscriptionList({
  facility,
  records,
  onSaveRecord,
  onDeleteRecord,
  onViewAttachment,
}: SubscriptionListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GovSubscription | null>(null);

  // Form states
  const [platformName, setPlatformName] = useState('');
  const [ownerOrAffiliation, setOwnerOrAffiliation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const attach = await fileToBase64(file);
        setAttachment(attach);
      } catch (err) {
        alert('حدث خطأ أثناء تحميل الملف، يرجى إعادة المحاولة بملف بديل أو صورة أصغر حجماً.');
      }
    }
  };

  const handleEdit = (rec: GovSubscription) => {
    setEditingRecord(rec);
    setPlatformName(rec.platformName);
    setOwnerOrAffiliation(rec.ownerOrAffiliation);
    setExpiryDate(rec.expiryDate);
    setAttachment(rec.attachment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setPlatformName('');
    setOwnerOrAffiliation('');
    setExpiryDate('');
    setAttachment(undefined);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: GovSubscription = {
      id: editingRecord ? editingRecord.id : 'sub-' + Math.random().toString(36).substr(2, 9),
      facilityId: facility.id,
      platformName,
      ownerOrAffiliation,
      expiryDate,
      attachment,
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
          <h2 className="text-xl font-extrabold text-slate-100 font-sans">الاشتراكات الحكومية والوزارية</h2>
          <p className="text-xs text-slate-400 mt-1">الرصد والرقابة الشاملة لمنصات أبشر أعمال وقوى ومؤسسة التأمينات لـ: {facility.name}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="py-2.5 px-4 bg-[#d36b3c] hover:bg-opacity-90 text-white font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-700/10"
        >
          <Plus size={16} />
          {showForm ? 'إخفاء الاستمارة' : 'تسجيل اشتراك جديد'}
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#d36b3c] border-b border-slate-800 pb-2">
                {editingRecord ? 'تعديل وثيقة الاشتراك المحددة' : 'تسجيل اشتراك منصة حكومية جديدة'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Platform Name (e.g. أبشر، التأمينات) */}
                <div className="space-y-1 text-right">
                  <label className="text-slate-400 text-xs font-semibold">اسم المنصة الحكومية</label>
                  <input
                    type="text"
                    required
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="مثل: قوى (Qiwa)، أبشر أعمال، التأمينات..."
                    className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                  />
                </div>

                {/* 2. Owner / Affiliation (المالك / التابع) */}
                <div className="space-y-1 text-right">
                  <label className="text-slate-400 text-xs font-semibold">المالك / التابع للاشتراك</label>
                  <input
                    type="text"
                    required
                    value={ownerOrAffiliation}
                    onChange={(e) => setOwnerOrAffiliation(e.target.value)}
                    placeholder="اسم مالك الاشتراك أو التابع المسؤول..."
                    className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                  />
                </div>

                {/* 3. Expiry Date (تاريخ انتهاء الاشتراك) */}
                <div className="space-y-1 text-right">
                  <label className="text-slate-400 text-xs font-semibold">تاريخ انتهاء الاشتراك</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                  />
                </div>

              </div>

              {/* Upload field */}
              <div className="space-y-1 text-right">
                <label className="text-slate-400 text-xs font-semibold block">إثبات الاشتراك / المستند الحكومي 📷📄</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-850 border border-slate-700 border-dashed rounded-xl cursor-pointer text-slate-300 hover:text-[#d36b3c] hover:border-[#d36b3c] transition-all text-xs">
                    <Paperclip size={14} />
                    إرفاق مستند الاشتراك الملون
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {attachment && (
                    <div className="flex items-center gap-2 bg-[#d36b3c]/10 px-2.5 py-1 rounded-lg text-xs text-[#d36b3c]">
                      <span className="truncate max-w-[150px] font-mono">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachment(undefined)}
                        className="text-red-400 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2.5 px-5 bg-slate-805 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#d36b3c] hover:bg-opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {editingRecord ? 'حفظ اشتراك المنصة' : 'اضافة اشتراك المنصة الجديد'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of subscriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl">
            <CloudLightning size={48} className="mx-auto mb-3 text-slate-600 animate-pulse" />
            <p className="text-sm font-bold text-slate-400">لا يوجد منصات اشتراك مسجلة للمنشأة الحالية.</p>
            <p className="text-xs text-slate-500 mt-1">
              الرجاء إدخال المنصات الأساسية مثل أبشر وقوى والتأمينات لضمان تنبيهك التلقائي.
            </p>
          </div>
        ) : (
          records.map((rec) => {
            const days = calculateDaysLeft(rec.expiryDate);
            const alertColor = getAlertColor(days);

            return (
              <motion.div
                key={rec.id}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`bg-slate-900 border hover:border-[#d36b3c]/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden text-right ${
                  alertColor === 'red' ? 'border-red-500/25' :
                  alertColor === 'yellow' ? 'border-yellow-500/25' :
                  'border-slate-800'
                }`}
              >
                {/* Inner ambient background blur representing status */}
                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full opacity-10 pointer-events-none ${
                  alertColor === 'red' ? 'bg-red-500' :
                  alertColor === 'yellow' ? 'bg-yellow-500' :
                  'bg-emerald-500'
                }`} />

                {/* Card Header (Platform / Actions) */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#1b325f]/40 text-[#d36b3c] rounded-xl flex items-center justify-center border border-[#d36b3c]/10 shrink-0">
                        <Tag size={16} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-100 text-xs md:text-sm">{rec.platformName}</h4>
                        <p className="text-[10px] text-slate-500">مسؤول/مالك: {rec.ownerOrAffiliation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(rec)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#d36b3c] transition-colors cursor-pointer"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من رغبتك في حذف اشتراك منصة (${rec.platformName})؟`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Body Statistics & Expiry */}
                  <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl p-3 space-y-2 text-right">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">حالة الاشتراك المتبقي:</span>
                      
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        alertColor === 'red' ? 'bg-red-500/15 text-red-500 border border-red-500/10' :
                        alertColor === 'yellow' ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/10' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {days <= 0 ? 'منتهي الصلاحية 🔴' : `متبقي ${days} يوم ⏳`}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CalendarDays size={11} className="text-[#d36b3c]" />
                      تاريخ الانتهاء: {formatArabicDate(rec.expiryDate)}
                    </p>
                  </div>
                </div>

                {/* Footer Attachment trigger */}
                <div className="flex items-center justify-between border-t border-slate-800 mt-4 pt-4 text-xs font-semibold">
                  {rec.attachment ? (
                    <button
                      onClick={() => onViewAttachment(rec.attachment!, `مستند اشتراك ${rec.platformName}`)}
                      className="flex items-center gap-1 text-[11px] text-[#d36b3c] hover:underline cursor-pointer"
                    >
                      <Paperclip size={12} />
                      استعراض إثبات المرفق
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600">لا يوجد مستند مرفق</span>
                  )}

                  <span className="text-[9px] text-[#1b325f] group-hover:text-white font-mono bg-slate-800 py-0.5 px-1.5 rounded">
                    رقمي بالكامل
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
