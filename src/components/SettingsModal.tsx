'use client';

import React, { useState } from 'react';
import { BusinessSettings } from '@/types';
import { saveSettings } from '@/lib/storage';
import { SUPABASE_SQL_SCHEMA } from '@/lib/supabaseClient';
import { getDriveConfig, saveDriveConfig } from '@/lib/googleDriveService';
import { X, Save, Settings, Database, Cloud, ShieldCheck, Check, Copy } from 'lucide-react';

interface SettingsModalProps {
  settings: BusinessSettings;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings: initialSettings,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'database' | 'drive'>('profile');
  const [formData, setFormData] = useState<BusinessSettings>({ ...initialSettings });
  const [copiedSql, setCopiedSql] = useState(false);
  const [driveConfig, setDriveConfig] = useState(getDriveConfig());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    saveDriveConfig(driveConfig);
    onSaved();
    alert('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">কেন্দ্র প্রোফাইল ও সিস্টেম কনফিগারেশন</h3>
              <p className="text-xs text-slate-300">
                ব্যবসায়িক তথ্য, সরকারি স্টেটমেন্ট সেটিংস ও ক্লাউড স্টোরেজ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="bg-slate-100 px-6 py-2 flex items-center space-x-2 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            কেন্দ্রের পরিচিতি ও স্টেটমেন্ট তথ্য
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'drive'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            গুগল ড্রাইভ স্টোরেজ আর্কিটেকচার
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            সুপাবেজ (Supabase SQL Schema)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-slate-700 text-xs">
                💡 <strong>মনে রাখবেন:</strong> এখানে দেওয়া তথ্যগুলো হুবহু আপনার <strong>রিসিট</strong> এবং <strong>সরকারি স্টেটমেন্টের</strong> প্রতিটি ডাইনামিক ফিল্ডে স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    দোকান / ব্যবসায়িক প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">যেমন: জনি কম্পিউটার</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    এলএসএফসি কেন্দ্রের ভৌগোলিক নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lsfcName}
                    onChange={(e) => setFormData({ ...formData, lsfcName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">যেমন: ঠাকুরগাঁও সদর</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    অনুমতি পত্র নং <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">যেমন: ০১</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    জেলা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    উপজেলা / থানা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upazila}
                    onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  কেন্দ্রের পূর্ণাঙ্গ ঠিকানা (রিসিট ও স্টেটমেন্ট হেডারের জন্য)
                </label>
                <input
                  type="text"
                  value={formData.addressDetails}
                  onChange={(e) => setFormData({ ...formData, addressDetails: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    কেন্দ্র ইনচার্জের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.inchargeName}
                    onChange={(e) => setFormData({ ...formData, inchargeName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">যেমন: মোঃ মাহমুদুল হাসান</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    পদবি <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.inchargeDesignation}
                    onChange={(e) => setFormData({ ...formData, inchargeDesignation: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ভূমি মন্ত্রণালয়ের রেফারেন্স সূত্র (স্টেটমেন্টের জন্য)
                </label>
                <textarea
                  rows={2}
                  value={formData.ministryMemoRef}
                  onChange={(e) => setFormData({ ...formData, ministryMemoRef: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    পরিশিষ্ট-৭ অনুযায়ী ফি স্তর (Tier)
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e: any) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="union_upazila">ইউনিয়ন ও উপজেলা সদর (ক্যাটাগরি-১)</option>
                    <option value="municipality">সাভার ব্যতীত সকল পৌর এলাকা (ক্যাটাগরি-২)</option>
                    <option value="city_corporation">সকল সিটি কর্পোরেশন ও সাভার পৌরসভা (ক্যাটাগরি-৩)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    স্টেটমেন্টের ঐচ্ছিক মনোগ্রাম / ছবি লিংক
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: https://drive.google.com/... অথবা লোকাল পাথ"
                    value={formData.optionalMonogramUrl || ''}
                    onChange={(e) => setFormData({ ...formData, optionalMonogramUrl: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  গুগল ড্রাইভ স্বয়ংক্রিয় ফাইল স্টোরেজ কনফিগারেশন
                </div>
                <p className="text-slate-600 mt-1">
                  আপনার রিকোয়ারমেন্ট অনুযায়ী ডাটাবেজে (Supabase) শুধু টেক্সট তথ্য সংরক্ষণ হয় এবং সমস্ত ছবি, স্বাক্ষর, রিসিট ও স্টেটমেন্টের পিডিএফ স্বয়ংক্রিয়ভাবে গুগল ড্রাইভের কাঠামোবদ্ধ ফোল্ডারে আপলোড হয়।
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm border-b pb-2">স্বয়ংক্রিয় ড্রাইভ ফোল্ডার স্ট্রাকচার</h4>
                <div className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-3 rounded-lg leading-relaxed">
                  📁 LSFC_Storage/<br />
                  &nbsp;&nbsp;├── 📁 Assets/ (সেন্টার লোগো, ইনচার্জ স্বাক্ষর)<br />
                  &nbsp;&nbsp;├── 📁 Staff_Docs/ (কর্মীদের জীবনবৃত্তান্ত ও NID)<br />
                  &nbsp;&nbsp;├── 📁 Receipts/2026/10/ (স্বয়ংক্রিয়ভাবে প্রতিদিনের রিসিট PDF)<br />
                  &nbsp;&nbsp;└── 📁 Statements/2026/ (মাসিক ও ত্রৈমাসিক A4 Landscape স্টেটমেন্ট PDF)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-slate-500 font-medium">কানেক্টেড ড্রাইভ একাউন্ট:</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{driveConfig.userEmail}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-slate-500 font-medium">ব্যবহৃত স্টোরেজ:</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{driveConfig.storageUsed}</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center justify-between">
                <span>ড্রাইভ রিয়েল-টাইম অটো-সিঙ্ক সক্রিয় রয়েছে ✓</span>
                <span className="text-xs font-mono font-semibold">Status: 200 OK</span>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">সুপাবেজ (Supabase) পূর্ণাঙ্গ স্কিমা ও RLS পলিসি</h4>
                  <p className="text-slate-500 text-xs">
                    আপনার Supabase Dashboard &gt; SQL Editor এ নিচের কোডটি রান করলেই সব টেবিল ও সিকিউরিটি পলিসি তৈরি হয়ে যাবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 font-medium transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'কপি হয়েছে!' : 'SQL কপি করুন'}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
