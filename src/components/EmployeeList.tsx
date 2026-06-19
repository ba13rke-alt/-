/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Facility, EmployeeRecord, Attachment } from '../types';
import { calculateDaysLeft, getAlertColor, fileToBase64, formatArabicDate } from '../utils';
import { 
  Users, Plus, Trash2, Edit, User, 
  CreditCard, ShieldAlert, Paperclip, HeartPulse, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeListProps {
  facility: Facility;
  records: EmployeeRecord[];
  onSaveRecord: (rec: EmployeeRecord) => void;
  onDeleteRecord: (id: string) => void;
  onViewAttachment: (attachment: Attachment, title: string) => void;
}

export default function EmployeeList({
  facility,
  records,
  onSaveRecord,
  onDeleteRecord,
  onViewAttachment,
}: EmployeeListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmployeeRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [employeeName, setEmployeeName] = useState('');
  
  const [iqamaNumber, setIqamaNumber] = useState('');
  const [iqamaExpiryDate, setIqamaExpiryDate] = useState('');
  const [iqamaAttachment, setIqamaAttachment] = useState<Attachment | undefined>(undefined);

  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [passportAttachment, setPassportAttachment] = useState<Attachment | undefined>(undefined);

  const [healthCardNumber, setHealthCardNumber] = useState('');
  const [healthCardExpiryDate, setHealthCardExpiryDate] = useState('');
  const [healthCardAttachment, setHealthCardAttachment] = useState<Attachment | undefined>(undefined);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'iqama' | 'passport' | 'health'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const attach = await fileToBase64(file);
        if (type === 'iqama') {
          setIqamaAttachment(attach);
        } else if (type === 'passport') {
          setPassportAttachment(attach);
        } else {
          setHealthCardAttachment(attach);
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة المرفق المختار، يرجى إعادة محاولة الرفع بصورة ملائمة.');
      }
    }
  };

  const handleEdit = (rec: EmployeeRecord) => {
    setEditingRecord(rec);
    setEmployeeName(rec.employeeName);
    setIqamaNumber(rec.iqamaNumber);
    setIqamaExpiryDate(rec.iqamaExpiryDate);
    setIqamaAttachment(rec.iqamaAttachment);
    setPassportNumber(rec.passportNumber);
    setPassportExpiryDate(rec.passportExpiryDate);
    setPassportAttachment(rec.passportAttachment);
    setHealthCardNumber(rec.healthCardNumber);
    setHealthCardExpiryDate(rec.healthCardExpiryDate);
    setHealthCardAttachment(rec.healthCardAttachment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setEmployeeName('');
    setIqamaNumber('');
    setIqamaExpiryDate('');
    setIqamaAttachment(undefined);
    setPassportNumber('');
    setPassportExpiryDate('');
    setPassportAttachment(undefined);
    setHealthCardNumber('');
    setHealthCardExpiryDate('');
    setHealthCardAttachment(undefined);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: EmployeeRecord = {
      id: editingRecord ? editingRecord.id : 'emp-' + Math.random().toString(36).substr(2, 9),
      facilityId: facility.id,
      employeeName,
      iqamaNumber,
      iqamaExpiryDate,
      iqamaAttachment,
      passportNumber,
      passportExpiryDate,
      passportAttachment,
      healthCardNumber,
      healthCardExpiryDate,
      healthCardAttachment,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
    };

    onSaveRecord(newRecord);
    handleCancel();
  };

  const filteredEmployees = records.filter(emp =>
    emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.iqamaNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">إقامات ومستندات العمالة الميدانية</h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة شاملة لبطاقات الإقامة، جواز السفر والكرت الصحي لموظفي: {facility.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="py-2.5 px-4 bg-[#d36b3c] hover:bg-opacity-90 text-white font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-700/10 shrink-0"
          >
            <Plus size={16} />
            {showForm ? 'إخفاء الاستمارة' : 'تسجيل عامل جديد'}
          </motion.button>
        </div>
      </div>

      {/* Filter and search bar */}
      {!showForm && (
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم العامل أو رقم الإقامة..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
          />
          <Search size={14} className="absolute right-3.5 top-3 text-slate-500" />
        </div>
      )}

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
                {editingRecord ? 'تحديث ملف الموظف والملفات المرفقة' : 'تسجيل بيانات عامل جديد وربطه بالمنشأة'}
              </h3>

              {/* Employee Name Field */}
              <div className="space-y-1 text-right max-w-lg">
                <label className="text-slate-400 text-xs font-semibold block">اسم العامل الكامل (ثلاثي أو رباعي)</label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="اسم العامل بالكامل كما هو مسجل بالهوية..."
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c]"
                />
              </div>

              {/* Grid Layout for three documents: Iqama, Passport, Health Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. IQAMA (الإقامة) */}
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-[#d36b3c] rounded-full" />
                    أولاً: رصد بطاقة هوية الإقامة
                  </h4>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium">رقم الإقامة</label>
                    <input
                      type="text"
                      required
                      value={iqamaNumber}
                      onChange={(e) => setIqamaNumber(e.target.value)}
                      placeholder="2XXXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium">تاريخ انتهاء الإقامة</label>
                    <input
                      type="date"
                      required
                      value={iqamaExpiryDate}
                      onChange={(e) => setIqamaExpiryDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Attachment */}
                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium block">صورة الإقامة الملونة 📷</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 border-dashed rounded-lg cursor-pointer text-slate-300 hover:text-[#d36b3c]" style={{ fontSize: '10px' }}>
                        <Paperclip size={12} />
                        إرفاق هوية الإقامة
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'iqama')}
                          className="hidden"
                        />
                      </label>
                      {iqamaAttachment && (
                        <span className="text-[10px] text-emerald-400 truncate max-w-[100px] font-mono">{iqamaAttachment.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. PASSPORT (جواز السفر) */}
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-[#d36b3c] rounded-full" />
                    ثانياً: جواز السفر الخارجي
                  </h4>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium">رقم الجواز</label>
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="رقم جواز السفر الحالي..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium">تاريخ انتهاء الجواز</label>
                    <input
                      type="date"
                      required
                      value={passportExpiryDate}
                      onChange={(e) => setPassportExpiryDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Attachment */}
                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium block">صورة جواز السفر الملونة 📷</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 border-dashed rounded-lg cursor-pointer text-slate-300 hover:text-[#d36b3c]" style={{ fontSize: '10px' }}>
                        <Paperclip size={12} />
                        إرفاق صورة الجواز
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'passport')}
                          className="hidden"
                        />
                      </label>
                      {passportAttachment && (
                        <span className="text-[10px] text-emerald-400 truncate max-w-[100px] font-mono">{passportAttachment.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. HEALTH CARD (الكرت الصحي) */}
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-[#d36b3c] rounded-full" />
                    ثالثاً: الكرت الصحي (للأنشطة الميدانية)
                  </h4>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium">رقم الكرت الصحي</label>
                    <input
                      type="text"
                      required
                      value={healthCardNumber}
                      onChange={(e) => setHealthCardNumber(e.target.value)}
                      placeholder="رقم الكرت أو البطاقة الصحية..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium">تاريخ انتهاء الكرت الصحي</label>
                    <input
                      type="date"
                      required
                      value={healthCardExpiryDate}
                      onChange={(e) => setHealthCardExpiryDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Attachment */}
                  <div className="space-y-1 text-right">
                    <label className="text-slate-400 text-[11px] font-medium block">صورة الكرت الصحي 📷</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 border-dashed rounded-lg cursor-pointer text-slate-300 hover:text-[#d36b3c]" style={{ fontSize: '10px' }}>
                        <Paperclip size={12} />
                        إرفاق الكرت الصحي
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'health')}
                          className="hidden"
                        />
                      </label>
                      {healthCardAttachment && (
                        <span className="text-[10px] text-emerald-400 truncate max-w-[100px] font-mono">{healthCardAttachment.name}</span>
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
                  className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#d36b3c] hover:bg-opacity-90 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingRecord ? 'حفظ تعديلات الموظف' : 'تسجيل العامل الجديد'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid displays for Employee records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl">
            <Users size={48} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-bold text-slate-400">لا يوجد عمالة مضافة بهذا الاسم أو رقم الإقامة.</p>
            <p className="text-xs text-slate-500 mt-1">
              أضف عمالة جديدة لربطهم بـ {facility.name} ومتابعة سلامة ثبوتياتهم.
            </p>
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const iqamaDays = calculateDaysLeft(emp.iqamaExpiryDate);
            const iqamaAlert = getAlertColor(iqamaDays);

            const passportDays = calculateDaysLeft(emp.passportExpiryDate);
            const passportAlert = getAlertColor(passportDays);

            const healthDays = calculateDaysLeft(emp.healthCardExpiryDate);
            const healthAlert = getAlertColor(healthDays);

            return (
              <motion.div
                key={emp.id}
                initial={{ transform: 'scale(0.99)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between"
              >
                {/* Header (Employee Name / Actions) */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-[#d36b3c]">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">{emp.employeeName}</h4>
                      <p className="text-[10px] text-slate-500">مقر المقاولة: {facility.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#d36b3c] transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من رغبتك في حذف بطاقة العامل (${emp.employeeName}) بالكامل؟`)) {
                          onDeleteRecord(emp.id);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Sub-documents displays */}
                <div className="space-y-3 mt-4 flex-1">
                  
                  {/* Item 1: Iqama */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-right ${
                    iqamaAlert === 'red' ? 'border-red-500/20 bg-red-950/5' :
                    iqamaAlert === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/5' :
                    'border-slate-800 bg-slate-950/20'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={12} className="text-[#d36b3c]" />
                        <span className="text-[11px] font-bold text-slate-200">الإقامة: {emp.iqamaNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">ينتهي في: {formatArabicDate(emp.iqamaExpiryDate)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        iqamaAlert === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/10' :
                        iqamaAlert === 'yellow' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/10' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {iqamaDays <= 0 ? 'منتهي 🔴' : `متبقي ${iqamaDays} يوم`}
                      </span>

                      {emp.iqamaAttachment ? (
                        <button
                          onClick={() => onViewAttachment(emp.iqamaAttachment!, `إقامة العامل ${emp.employeeName}`)}
                          className="text-[#d36b3c] hover:underline"
                          style={{ fontSize: '10px' }}
                        >
                          المعاينة
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-600">لا صورة</span>
                      )}
                    </div>
                  </div>

                  {/* Item 2: Passport */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-right ${
                    passportAlert === 'red' ? 'border-red-500/20 bg-red-950/5' :
                    passportAlert === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/5' :
                    'border-slate-800 bg-slate-950/20'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert size={12} className="text-[#d36b3c]" />
                        <span className="text-[11px] font-bold text-slate-200">الجواز: {emp.passportNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">ينتهي في: {formatArabicDate(emp.passportExpiryDate)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        passportAlert === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/10' :
                        passportAlert === 'yellow' ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/10' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {passportDays <= 0 ? 'منتهي 🔴' : `متبقي ${passportDays} يوم`}
                      </span>

                      {emp.passportAttachment ? (
                        <button
                          onClick={() => onViewAttachment(emp.passportAttachment!, `جواز سفر العامل ${emp.employeeName}`)}
                          className="text-[#d36b3c] hover:underline"
                          style={{ fontSize: '10px' }}
                        >
                          المعاينة
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-600">لا صورة</span>
                      )}
                    </div>
                  </div>

                  {/* Item 3: Health Card */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-right ${
                    healthAlert === 'red' ? 'border-red-500/20 bg-red-950/5' :
                    healthAlert === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/5' :
                    'border-slate-800 bg-slate-950/20'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <HeartPulse size={12} className="text-[#d36b3c]" />
                        <span className="text-[11px] font-bold text-slate-200">الكرت الصحي: {emp.healthCardNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">ينتهي في: {formatArabicDate(emp.healthCardExpiryDate)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        healthAlert === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/10' :
                        healthAlert === 'yellow' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/10' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                      }`}>
                        {healthDays <= 0 ? 'منتهي 🔴' : `متبقي ${healthDays} يوم`}
                      </span>

                      {emp.healthCardAttachment ? (
                        <button
                          onClick={() => onViewAttachment(emp.healthCardAttachment!, `كرت صحة العامل ${emp.employeeName}`)}
                          className="text-[#d36b3c] hover:underline"
                          style={{ fontSize: '10px' }}
                        >
                          المعاينة
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-600">لا صورة</span>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
