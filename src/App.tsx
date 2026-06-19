/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Facility, CommercialRecord, EmployeeRecord, 
  GovSubscription, Attachment 
} from './types';
import { 
  getFacilities, saveFacility, removeFacility,
  getCommercialRecords, saveCommercialRecord, removeCommercialRecord,
  getEmployeeRecords, saveEmployeeRecord, removeEmployeeRecord,
  getGovSubscriptions, saveGovSubscription, removeGovSubscription,
  seedDefaultDataIfEmpty 
} from './db';
import { getExpiringDocsForFacility, formatArabicDate } from './utils';

// Import custom screens
import Splash from './components/Splash';
const appLogo = '/logo.jpg';
import Dashboard from './components/Dashboard';
import CRList from './components/CRList';
import EmployeeList from './components/EmployeeList';
import SubscriptionList from './components/SubscriptionList';
import FileViewer from './components/FileViewer';
import BackupRestore from './components/BackupRestore';

import { 
  Anchor, Building, Bell, LayoutDashboard, 
  FolderOpen, Users, Globe, Database, Moon, Sun, 
  LogOut, ShieldCheck, Mail, ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Global states
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  
  const [commercialRecords, setCommercialRecords] = useState<CommercialRecord[]>([]);
  const [employeeRecords, setEmployeeRecords] = useState<EmployeeRecord[]>([]);
  const [govSubscriptions, setGovSubscriptions] = useState<GovSubscription[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cr' | 'employees' | 'subscriptions' | 'backup'>('dashboard');
  const [loading, setLoading] = useState(true);

  // File viewing state
  const [activeAttachment, setActiveAttachment] = useState<Attachment | undefined>(undefined);
  const [activeAttachmentTitle, setActiveAttachmentTitle] = useState('');

  // Notification Modal toggle state
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Fetch all core data from IndexedDB
  const refreshAllData = async () => {
    try {
      const facs = await getFacilities();
      setFacilities(facs);

      const crs = await getCommercialRecords();
      setCommercialRecords(crs);

      const emps = await getEmployeeRecords();
      setEmployeeRecords(emps);

      const subs = await getGovSubscriptions();
      setGovSubscriptions(subs);
    } catch (e) {
      console.error('Error fetching data from IndexedDB:', e);
    }
  };

  // Seed default data if DB is empty on first boot
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await seedDefaultDataIfEmpty();
      await refreshAllData();
      setLoading(false);
    };
    bootstrap();
  }, []);

  // Selected Facility Object
  const activeFacility = facilities.find((f) => f.id === selectedFacilityId);

  // Count notifications/expired for the active facility
  const activeExpiringDocs = activeFacility 
    ? getExpiringDocsForFacility(activeFacility, commercialRecords, employeeRecords, govSubscriptions)
    : [];
  const activeAlertCount = activeExpiringDocs.filter(d => d.color === 'red' || d.color === 'yellow').length;

  // Handlers for Facility adjustments
  const handleSelectFacility = (id: string) => {
    setSelectedFacilityId(id);
    setActiveTab('dashboard'); // Default tab when selecting any facility
  };

  const handleAddFacility = async (name: string) => {
    const newFac: Facility = {
      id: 'fac-' + Math.random().toString(36).substr(2, 9),
      name,
      createdAt: new Date().toISOString()
    };
    await saveFacility(newFac);
    await refreshAllData();
  };

  const handleDeleteFacility = async (id: string) => {
    await removeFacility(id);
    if (selectedFacilityId === id) {
      setSelectedFacilityId(null);
    }
    await refreshAllData();
  };

  const handleUpdateFacility = async (id: string, newName: string) => {
    const target = facilities.find((f) => f.id === id);
    if (target) {
      const updated = { ...target, name: newName };
      await saveFacility(updated);
      await refreshAllData();
    }
  };

  // Handlers for CR / Licenses records
  const handleSaveCR = async (rec: CommercialRecord) => {
    await saveCommercialRecord(rec);
    await refreshAllData();
  };

  const handleDeleteCR = async (id: string) => {
    await removeCommercialRecord(id);
    await refreshAllData();
  };

  // Handlers for Employee records
  const handleSaveEmployee = async (rec: EmployeeRecord) => {
    await saveEmployeeRecord(rec);
    await refreshAllData();
  };

  const handleDeleteEmployee = async (id: string) => {
    await removeEmployeeRecord(id);
    await refreshAllData();
  };

  // Handlers for Gov Subscriptions
  const handleSaveSubscription = async (rec: GovSubscription) => {
    await saveGovSubscription(rec);
    await refreshAllData();
  };

  const handleDeleteSubscription = async (id: string) => {
    await removeGovSubscription(id);
    await refreshAllData();
  };

  const handleViewAttachment = (attach: Attachment, title: string) => {
    setActiveAttachment(attach);
    setActiveAttachmentTitle(title);
  };

  // Loading Splash state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-16 h-16 border-4 border-t-[#d36b3c] border-[#1b325f] rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold font-sans">تطبيق الباخرة للموارد البشرية...</h2>
        <p className="text-slate-500 text-xs mt-1">يتم تهيئة مستودع الأرشفة وقواعد البيانات المدمجة</p>
      </div>
    );
  }

  // View Splash Screen (Facility chooser) if none selected
  if (!selectedFacilityId || !activeFacility) {
    return (
      <Splash
        facilities={facilities}
        onSelectFacility={handleSelectFacility}
        onAddFacility={handleAddFacility}
        onDeleteFacility={handleDeleteFacility}
        onUpdateFacility={handleUpdateFacility}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative pb-24 md:pb-6" dir="rtl" id="albahera-app-root">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 z-30 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo with Back to Facility selection */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedFacilityId(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs font-bold"
              title="تغيير المنشأة الحالية"
            >
              <ArrowLeftRight size={15} className="text-[#d36b3c]" />
              <span className="hidden sm:inline">المنشآت</span>
            </button>

            {/* Small Elegant Ship Vector */}
            <div className="w-10 h-10 rounded-xl border border-[#d36b3c]/60 flex items-center justify-center shrink-0 overflow-hidden bg-white">
              <img
                src={appLogo}
                alt="شعار الباخرة"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="text-right">
              <h1 className="font-extrabold text-xs md:text-sm text-slate-100">تطبيق الباخرة</h1>
              <span className="text-[9px] text-[#d36b3c] block font-mono">عبد العزيز محمد الحسني</span>
            </div>
          </div>

          {/* Active Title Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-full">
            <Building size={14} className="text-[#d36b3c]" />
            <span className="text-xs font-bold text-slate-300 truncate max-w-xs">{activeFacility.name}</span>
          </div>

          {/* Top Actions: Alerts Badge & Exit */}
          <div className="flex items-center gap-2">
            
            {/* Active alerts trigger badge */}
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="relative p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="مركز مراقبة الوثائق"
            >
              <Bell size={18} className={activeAlertCount > 0 ? 'animate-swing' : ''} />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Exit Facility Button */}
            <button
              onClick={() => setSelectedFacilityId(null)}
              className="p-2.5 bg-red-950/40 hover:bg-red-950/60 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
              title="تسجيل الخروج من المنشأة الحالية"
            >
              <LogOut size={16} />
            </button>

          </div>
        </div>
      </header>

      {/* 2. Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                facility={activeFacility}
                crRecords={commercialRecords}
                employeeRecords={employeeRecords}
                govSubs={govSubscriptions}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onViewAttachment={handleViewAttachment}
              />
            )}

            {activeTab === 'cr' && (
              <CRList
                facility={activeFacility}
                records={commercialRecords.filter((r) => r.facilityId === activeFacility.id)}
                onSaveRecord={handleSaveCR}
                onDeleteRecord={handleDeleteCR}
                onViewAttachment={handleViewAttachment}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeList
                facility={activeFacility}
                records={employeeRecords.filter((e) => e.facilityId === activeFacility.id)}
                onSaveRecord={handleSaveEmployee}
                onDeleteRecord={handleDeleteEmployee}
                onViewAttachment={handleViewAttachment}
              />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionList
                facility={activeFacility}
                records={govSubscriptions.filter((s) => s.facilityId === activeFacility.id)}
                onSaveRecord={handleSaveSubscription}
                onDeleteRecord={handleDeleteSubscription}
                onViewAttachment={handleViewAttachment}
              />
            )}

            {activeTab === 'backup' && (
              <BackupRestore
                onRefreshData={refreshAllData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Bottom Mobile/Tablet Tab Bar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 py-3 px-2 z-40 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.5)] md:sticky md:bottom-auto">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'dashboard' ? 'text-[#d36b3c] font-black scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px]">لوحة التحكم</span>
          </button>

          <button
            onClick={() => setActiveTab('cr')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'cr' ? 'text-[#d36b3c] font-black scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen size={18} />
            <span className="text-[10px]">السجلات والرخص</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'employees' ? 'text-[#d36b3c] font-black scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={18} />
            <span className="text-[10px]">الملفات والعمالة</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'subscriptions' ? 'text-[#d36b3c] font-black scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe size={18} />
            <span className="text-[10px]">الاشتراكات</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'backup' ? 'text-[#d36b3c] font-black scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database size={18} />
            <span className="text-[10px]">النسخة والضبط</span>
          </button>

        </div>
      </nav>

      {/* 4. Document Viewer Modals */}
      <AnimatePresence>
        {activeAttachment && (
          <FileViewer
            attachment={activeAttachment}
            title={activeAttachmentTitle}
            onClose={() => setActiveAttachment(undefined)}
          />
        )}
      </AnimatePresence>

      {/* 5. Right slide-over or Modal for Notification Center (مركز الرصد العام) */}
      <AnimatePresence>
        {showNotificationCenter && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2 text-red-400">
                  <Bell size={20} className="animate-pulse" />
                  <span className="font-extrabold text-sm md:text-base text-slate-100">مركز رصد الصلاحية الموحد</span>
                </div>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 mb-2">الوثائق التي تقترب من تاريخ الانتهاء (أقل من ٦٠ يوماً):</h3>
                
                {activeExpiringDocs.filter(d => d.color === 'red' || d.color === 'yellow').length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ShieldCheck size={48} className="mx-auto mb-3 text-emerald-500 opacity-60" />
                    <p className="text-sm font-bold text-slate-300">جميع الوثائق بحالة سارية سليمة! 🟢</p>
                    <p className="text-xs text-slate-500 mt-1">لا توجد أي بطاقات أو سجلات منتهية أو قاربت على الانتهاء.</p>
                  </div>
                ) : (
                  activeExpiringDocs
                    .filter((d) => d.color === 'red' || d.color === 'yellow')
                    .map((d) => (
                      <div
                        key={d.id}
                        className={`p-3.5 border rounded-2xl text-right flex flex-col justify-between gap-2.5 ${
                          d.color === 'red' 
                            ? 'bg-red-950/10 border-red-500/20' 
                            : 'bg-yellow-950/10 border-yellow-500/20'
                        }`}
                      >
                        <div>
                          <p className="text-xs text-slate-300 font-extrabold">{d.title}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">تاريخ الانتهاء: {formatArabicDate(d.expiryDate)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-850 pt-2 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-extrabold ${
                            d.color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {d.daysLeft <= 0 ? 'منتهي الصلاحية 🔴' : `متبقي ${d.daysLeft} يوم ⏳`}
                          </span>
                          <button
                            onClick={() => {
                              setShowNotificationCenter(false);
                              if (d.type === 'cr' || d.type === 'license') setActiveTab('cr');
                              else if (d.type === 'iqama' || d.type === 'passport' || d.type === 'health') setActiveTab('employees');
                              else setActiveTab('subscriptions');
                            }}
                            className="text-[#d36b3c] font-extrabold hover:underline"
                          >
                            اذهب للبطاقة
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950/30 text-center text-[10px] text-slate-500 border-t border-slate-800">
                مؤسسة عبد العزيز محمد الحسني للخدمات الرقمية
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
