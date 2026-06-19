/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Facility, CommercialRecord, EmployeeRecord, GovSubscription, ExpiringDoc } from '../types';
import { getExpiringDocsForFacility, formatArabicDate } from '../utils';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, 
  Clock, Search, ArrowRight, Bell, Building, 
  FileText, Users, CalendarDays, ExternalLink, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  facility: Facility;
  crRecords: CommercialRecord[];
  employeeRecords: EmployeeRecord[];
  govSubs: GovSubscription[];
  onNavigateToTab: (tab: 'cr' | 'employees' | 'subscriptions' | 'backup') => void;
  onViewAttachment: (attachment: any, title: string) => void;
}

export default function Dashboard({
  facility,
  crRecords,
  employeeRecords,
  govSubs,
  onNavigateToTab,
  onViewAttachment,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationTest, setShowNotificationTest] = useState(false);
  const [notiStatus, setNotiStatus] = useState<string>('');

  // 1. Calculate all expiring documents
  const allDocs = getExpiringDocsForFacility(facility, crRecords, employeeRecords, govSubs);

  // 2. Statistics
  const expiredCount = allDocs.filter(d => d.color === 'red').length;
  const warningCount = allDocs.filter(d => d.color === 'yellow').length;
  const activeCount = allDocs.filter(d => d.color === 'green').length;
  const totalCount = allDocs.length;

  // Filter based on search query
  const filteredDocs = allDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.expiryDate.includes(searchQuery)
  );

  // HTML5 Push Notification Simulator
  const triggerNotificationTest = () => {
    if (!('Notification' in window)) {
      setNotiStatus('المتصفح الحالي لا يدعم إشعارات سطح المكتب.');
      return;
    }

    const requestPermissionAndNotify = () => {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // Play a small default audio visual note
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(520, audioCtx.currentTime); // C5 note
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch (e) {
            console.log('AudioContext is blocked or not supported');
          }

          // Trigger beautiful native browser notification
          const urgentString = expiredCount > 0 
            ? `تنبيه عاجل: لديك عدد (${expiredCount}) وثائق منتهية بـ ${facility.name}!`
            : `تنبيه: جميع مستندات (${facility.name}) مراقبة بنجاح وبحالة جيدة.`;

          new Notification('تطبيق الباخرة للموارد البشرية ⚓', {
            body: urgentString,
            icon: 'https://cdn-icons-png.flaticon.com/512/3414/3414902.png',
            dir: 'rtl',
          });
          setNotiStatus('تم إطلاق وتجربة تنبيه الجوال بنجاح! تفقد أعلى شاشتك الدائرية.');
        } else {
          setNotiStatus('تم رفض صلاحية الإشعارات لموقع الويب.');
        }
      });
    };

    requestPermissionAndNotify();
    setShowNotificationTest(true);
    setTimeout(() => {
      setShowNotificationTest(false);
      setNotiStatus('');
    }, 5000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner: Facility Title */}
      <div className="bg-[#1b325f] text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#d36b3c]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d36b3c]/20 border border-[#d36b3c]/40 rounded-2xl flex items-center justify-center text-[#d36b3c] shrink-0">
              <Building size={24} />
            </div>
            <div>
              <p className="text-slate-300 text-xs">مستعرض لوحة منشأة:</p>
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight mt-0.5">{facility.name}</h2>
            </div>
          </div>
          
          <button
            onClick={triggerNotificationTest}
            className="self-start md:self-auto py-2 px-4 bg-[#d36b3c]/90 hover:bg-[#d36b3c] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-orange-700/20 transition-all cursor-pointer"
          >
            <Bell size={14} className="animate-bounce" />
            اختبار وتفعيل الإشعارات الرسمية
          </button>
        </div>

        {showNotificationTest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-yellow-300 text-xs flex items-center gap-2"
          >
            <Clock size={14} className="animate-spin text-[#d36b3c]" />
            <span>{notiStatus || 'يتم فحص وتفعيل قناة التنبيهات والدفع التلقائي للوثائق...'}</span>
          </motion.div>
        )}
      </div>

      {/* Statistics Panels (Red, Yellow, Green) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expired Status -> RED CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-slate-900 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between shadow-md"
        >
          <div className="space-y-1 text-right">
            <span className="text-slate-400 text-xs font-bold block">منتهية الصلاحية 🔴</span>
            <span className="text-3xl font-black text-red-500 font-mono block">{expiredCount}</span>
            <span className="text-[10px] text-red-400 font-medium block">تتطلب تجديد فوري وعام</span>
          </div>
          <div className="w-12 h-12 bg-red-950/40 text-red-400 rounded-xl flex items-center justify-center border border-red-900/55">
            <ShieldAlert size={24} />
          </div>
        </motion.div>

        {/* Warning Status -> YELLOW CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-5 flex items-center justify-between shadow-md"
        >
          <div className="space-y-1 text-right">
            <span className="text-slate-400 text-xs font-bold block">شارفت على الانتهاء 🟡</span>
            <span className="text-3xl font-black text-yellow-500 font-mono block">{warningCount}</span>
            <span className="text-[10px] text-yellow-400/80 font-medium block">متبقي ٦٠ يوم أو أقل</span>
          </div>
          <div className="w-12 h-12 bg-yellow-950/40 text-yellow-500 rounded-xl flex items-center justify-center border border-yellow-900/55">
            <AlertTriangle size={24} />
          </div>
        </motion.div>

        {/* Active Status -> GREEN CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between shadow-md"
        >
          <div className="space-y-1 text-right">
            <span className="text-slate-400 text-xs font-bold block">وثائق سارية الصلاحية 🟢</span>
            <span className="text-3xl font-black text-emerald-500 font-mono block">{activeCount}</span>
            <span className="text-[10px] text-emerald-400 font-medium block">أكثر من ٦٠ يوماً على الأقل</span>
          </div>
          <div className="w-12 h-12 bg-emerald-950/40 text-emerald-300 rounded-xl flex items-center justify-center border border-emerald-900/55">
            <CheckCircle size={24} />
          </div>
        </motion.div>
      </div>

      {/* Quick Access Grid / Categories */}
      <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl shadow-lg">
        <h3 className="font-extrabold text-slate-100 text-sm mb-4">خدمات النقل السريع للوثائق والملفات</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateToTab('cr')}
            className="p-4 bg-slate-900 hover:bg-[#1b325f]/20 border border-slate-800 hover:border-[#d36b3c]/40 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all"
          >
            <div className="w-10 h-10 bg-slate-800 group-hover:bg-[#d36b3c]/20 text-[#d36b3c] rounded-xl flex items-center justify-center transition-all">
              <FileText size={20} />
            </div>
            <span className="text-xs font-bold text-slate-300">السجلات والرخص التجارية</span>
          </button>

          <button
            onClick={() => onNavigateToTab('employees')}
            className="p-4 bg-slate-900 hover:bg-[#1b325f]/20 border border-slate-800 hover:border-[#d36b3c]/40 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all"
          >
            <div className="w-10 h-10 bg-slate-800 group-hover:bg-[#d36b3c]/20 text-[#d36b3c] rounded-xl flex items-center justify-center transition-all">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-slate-300">ملفات وإقامات العمالة</span>
          </button>

          <button
            onClick={() => onNavigateToTab('subscriptions')}
            className="p-4 bg-slate-900 hover:bg-[#1b325f]/20 border border-slate-800 hover:border-[#d36b3c]/40 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all"
          >
            <div className="w-10 h-10 bg-slate-800 group-hover:bg-[#d36b3c]/20 text-[#d36b3c] rounded-xl flex items-center justify-center transition-all">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-bold text-slate-300">الاشتراكات الحكومية</span>
          </button>

          <button
            onClick={() => onNavigateToTab('backup')}
            className="p-4 bg-slate-900 hover:bg-[#1b325f]/20 border border-slate-800 hover:border-[#d36b3c]/40 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all"
          >
            <div className="w-10 h-10 bg-slate-800 group-hover:bg-[#d36b3c]/20 text-[#d36b3c] rounded-xl flex items-center justify-center transition-all">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-slate-300">النسخ الاحتياطي والملفات</span>
          </button>
        </div>
      </div>

      {/* Monitor list / Alert list */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="text-right">
            <h3 className="font-extrabold text-slate-100 text-base">جدول رصد وثائق المنشأة وفترات صلاحيتها</h3>
            <p className="text-slate-400 text-xs mt-0.5">ترتيب تنازلي بحسب الأيام المتبقية على انتهاء الفائدة للمستند</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وثيقة أو مستند بالاسم..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c] placeholder:text-slate-500"
            />
            <Search size={14} className="absolute right-3 top-2.5 text-slate-500" />
          </div>
        </div>

        {/* Dynamic List */}
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl">
              <Clock size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400">لا توجد وثائق محفوظة حالياً في المنشأة.</p>
              <p className="text-xs text-slate-500 mt-1">تفضل بالانتقال إلى الأبواب المخصصة لإضافة وثيقتك الأولى.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const days = doc.daysLeft;
              const isExpired = days <= 0;
              const colorClass = 
                doc.color === 'red' ? 'border-red-500/20 bg-red-950/10' :
                doc.color === 'yellow' ? 'border-yellow-500/20 bg-yellow-950/10' :
                'border-slate-800 bg-slate-900/40';

              const badgeColor = 
                doc.color === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                doc.color === 'yellow' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' :
                'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';

              const docTypeName = 
                doc.type === 'cr' ? 'سجل تجاري' :
                doc.type === 'license' ? 'رخصة تجارية (بلدي/دفاع مدني)' :
                doc.type === 'iqama' ? 'إقامة عامل' :
                doc.type === 'passport' ? 'جواز سفر' :
                doc.type === 'health' ? 'كرت صحي عمالي' :
                'اشتراك حكومي';

              return (
                <div
                  key={doc.id}
                  className={`border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-800/40 ${colorClass}`}
                >
                  <div className="flex items-start gap-3 text-right">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse bg-gradient-to-r"
                      style={{
                        backgroundColor: doc.color === 'red' ? '#ef4444' : doc.color === 'yellow' ? '#eab308' : '#10b981'
                      }}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">[{docTypeName}]</span>
                        <h4 className="font-bold text-slate-100 text-xs md:text-sm">{doc.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-[#d36b3c]" />
                          تاريخ الانتهاء: {formatArabicDate(doc.expiryDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations and Color Indicator badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-800/40 pt-3 sm:pt-0 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${badgeColor}`}>
                      {isExpired ? (
                        <span>منتهي الصلاحية 🔴</span>
                      ) : (
                        <span>متبقي {days} يوم ⏳</span>
                      )}
                    </span>

                    <button
                      onClick={() => {
                        // Routing based on type
                        if (doc.type === 'cr' || doc.type === 'license') onNavigateToTab('cr');
                        else if (doc.type === 'iqama' || doc.type === 'passport' || doc.type === 'health') onNavigateToTab('employees');
                        else onNavigateToTab('subscriptions');
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="الذهاب لقسم التعديل"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
