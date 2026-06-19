/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Facility } from '../types';
import { Plus, Trash2, Edit2, ShieldAlert, FileCheck, Building2, Anchor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const appLogo = '/logo.jpg';

interface SplashProps {
  facilities: Facility[];
  onSelectFacility: (id: string) => void;
  onAddFacility: (name: string) => void;
  onDeleteFacility: (id: string) => void;
  onUpdateFacility: (id: string, newName: string) => void;
}

export default function Splash({
  facilities,
  onSelectFacility,
  onAddFacility,
  onDeleteFacility,
  onUpdateFacility,
}: SplashProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddFacility(newName.trim());
      setNewName('');
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (fac: Facility, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(fac.id);
    setEditingName(fac.name);
  };

  const handleSaveEdit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      onUpdateFacility(id, editingName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between p-6 rtl" dir="rtl">
      {/* Wave / Ship Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d36b3c_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Header with App Logo */}
      <div className="w-full max-w-md mx-auto text-center pt-8 z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative inline-block mb-4"
        >
          {/* Logo container inspired by Al-Bahera ship */}
          <div className="w-28 h-28 bg-white rounded-full border-2 border-[#d36b3c] flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden">
            <img
              src={appLogo}
              alt="تطبيق الباخرة"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Decorative Anchors / Waves */}
          <div className="absolute -bottom-2 -right-2 bg-[#d36b3c] text-white p-1.5 rounded-full shadow-lg">
            <Anchor size={16} />
          </div>
        </motion.div>

        <motion.h1 
          className="text-3xl font-extrabold tracking-tight text-white mb-1 font-sans"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          تطبيق الباخرة
        </motion.h1>
        <motion.p 
          className="text-slate-400 text-sm font-medium"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          مؤسسة عبد العزيز محمد الحسني للموارد البشرية والوثائق
        </motion.p>
      </div>

      {/* Main Content: Selection of Facility */}
      <div className="w-full max-w-md mx-auto my-auto z-10 pt-4 pb-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/90 border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-xs">مرحباً بك، يرجى اختيار</p>
              <h2 className="text-xl font-bold text-[#d36b3c]">المنشأة المستهدفة</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 bg-[#d36b3c] text-white py-1.5 px-3 rounded-full text-xs font-semibold hover:bg-opacity-90 transition-all cursor-pointer"
            >
              <Plus size={14} />
              إضافة منشأة
            </motion.button>
          </div>

          {/* Add Facility Drawer/Inline Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleSubmit}
                className="overflow-hidden mb-6 bg-slate-900/60 border border-slate-700 rounded-2xl p-4"
              >
                <h3 className="text-xs font-bold text-slate-300 mb-2">تسجيل منشأة جديدة:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="اسم المنشأة أو المؤسسة..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d36b3c] placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    حفظ
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Facilities List */}
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {facilities.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Building2 size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا يوجد منشآت مضافة بعد.</p>
                <p className="text-xs">اضغط على زر (إضافة منشأة) للبدء.</p>
              </div>
            ) : (
              facilities.map((fac) => (
                <motion.div
                  key={fac.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectFacility(fac.id)}
                  className="group relative bg-slate-900/40 border border-slate-800 hover:border-[#d36b3c]/60 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-800 group-hover:bg-[#1b325f]/40 border border-slate-700 group-hover:border-[#d36b3c]/40 rounded-xl flex items-center justify-center text-[#d36b3c] transition-colors shrink-0">
                      <Building2 size={20} />
                    </div>
                    {editingId === fac.id ? (
                      <form
                        onSubmit={(e) => handleSaveEdit(fac.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex gap-1.5"
                      >
                        <input
                          type="text"
                          required
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-[#d36b3c] text-white text-xs px-2.5 py-1 rounded-lg"
                        >
                          تعديل
                        </button>
                      </form>
                    ) : (
                      <div className="truncate text-right">
                        <p className="font-bold text-slate-100 text-sm group-hover:text-white transition-colors truncate">
                          {fac.name}
                        </p>
                        <p className="text-slate-500 text-[10px]">اضغط للدخول والتحكم</p>
                      </div>
                    )}
                  </div>

                  {editingId !== fac.id && (
                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartEdit(fac, e)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                        title="تعديل الاسم"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`هل أنت متأكد من حذف منشأة (${fac.name}) وجميع سجلاتها بالكامل؟ لا يمكن التراجع!`)) {
                            onDeleteFacility(fac.id);
                          }
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="حذف المنشأة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-md mx-auto text-center border-t border-slate-800/80 pt-4 pb-2 z-10">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldAlert size={12} className="text-[#d36b3c]" />
          <span>تطبيق آمن لحفظ ومراقبة الوثائق الرسمية والمؤسسية</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-1">تطبيق الباخرة © ٢٠٢٦ - جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
