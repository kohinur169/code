'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/types';
import { saveSettings } from '@/lib/storage';
import { SUPABASE_SQL_SCHEMA } from '@/lib/supabaseClient';
import {
  getDriveConfig,
  saveDriveConfig,
  getDriveFiles,
  uploadFileToDrive,
  DriveFileRecord,
  DriveConfig,
} from '@/lib/googleDriveService';
import {
  X,
  Save,
  Settings,
  Database,
  Cloud,
  Check,
  Copy,
  FileCheck,
  ExternalLink,
  FolderTree,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'drive' | 'database'>('profile');
  const [formData, setFormData] = useState<BusinessSettings>({ ...initialSettings });
  const [copiedSql, setCopiedSql] = useState(false);
  const [driveConfig, setDriveConfig] = useState<DriveConfig>(getDriveConfig());
  const [driveFiles, setDriveFiles] = useState<DriveFileRecord[]>([]);

  useEffect(() => {
    setDriveFiles(getDriveFiles());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    saveDriveConfig(driveConfig);
    onSaved();
    alert('কেন্দ্র প্রোফাইল ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await uploadFileToDrive('Incharge_Signature.png', 'signature_png', base64);
      setFormData({
        ...formData,
        signatureUrl: base64,
      });
      setDriveFiles(getDriveFiles());
      alert('ইনচার্জের স্বাক্ষর গুগল ড্রাইভে আপলোড ও সেভ সম্পন্ন!');
    };
    reader.readAsDataURL(file);
  };

  const handleMonogramUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await uploadFileToDrive('Statement_Monogram.png', 'monogram_img', base64);
      setFormData({
        ...formData,
        optionalMonogramUrl: base64,
      });
      setDriveFiles(getDriveFiles());
      alert('স্টেটমেন্টের মনোগ্রাম ছবি ড্রাইভে আপলোড সম্পন্ন!');
    };
    reader.readAsDataURL(file);
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
              <h3 className="font-bold text-base">কেন্দ্র প্রোফাইল ও ক্লাউড স্টোরেজ ইঞ্জিন</h3>
              <p className="text-xs text-slate-300">
                ব্যবসায়িক তথ্য, সরকারি স্টেটমেন্ট সেটিংস ও গুগল ড্রাইভ আর্কিটেকচার
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
            কেন্দ্রের পরিচিতি ও স্টেটমেন্ট ফিল্ড
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
            গুগল ড্রাইভ স্টোরেজ ও ফাইল ম্যানেজার
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

              {/* Upload Signature & Monogram directly to Drive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">
                    ইনচার্জের ডিজিটাল স্বাক্ষর আপলোড (PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  {formData.signatureUrl && (
                    <div className="mt-2 p-1.5 bg-white rounded border flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-semibold">স্বাক্ষর যুক্ত আছে ✓</span>
                      <img src={formData.signatureUrl} alt="Sign" className="h-6 object-contain" />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">
                    স্টেটমেন্টের ঐচ্ছিক মনোগ্রাম/ছবি আপলোড
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMonogramUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  {formData.optionalMonogramUrl && (
                    <div className="mt-2 p-1.5 bg-white rounded border flex items-center justify-between">
                      <span className="text-[11px] text-blue-700 font-semibold">মনোগ্রাম যুক্ত আছে ✓</span>
                      <img src={formData.optionalMonogramUrl} alt="Monogram" className="h-6 object-contain" />
                    </div>
                  )}
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
                  গুগল ড্রাইভ হাইব্রিড স্টোরেজ আর্কিটেকচার
                </div>
                <p className="text-slate-600 mt-1">
                  আপনার সুনির্দিষ্ট নির্দেশনা অনুযায়ী ডাটাবেজে শুধুমাত্র টেক্সট ডাটা সংরক্ষিত থাকে এবং সব ধরনের ছবি, স্বাক্ষর ও জেনারেটকৃত পিডিএফ স্বয়ংক্রিয়ভাবে গুগল ড্রাইভের ফোল্ডারে সংরক্ষিত হয়।
                </p>
              </div>

              {/* Drive Folder Tree Visualizer */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-emerald-600" />
                  স্বয়ংক্রিয় ড্রাইভ ফোল্ডার কাঠামো
                </h4>
                <div className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-3.5 rounded-xl leading-relaxed">
                  📁 LSFC_Storage/<br />
                  &nbsp;&nbsp;├── 📁 Assets/ (লোগো, ইনচার্জ স্বাক্ষর, মনোগ্রাম)<br />
                  &nbsp;&nbsp;├── 📁 Staff_Docs/ (কর্মীদের জীবনবৃত্তান্ত ও NID কপি)<br />
                  &nbsp;&nbsp;├── 📁 Receipts/2026/10/ (স্বয়ংক্রিয়ভাবে প্রতিদিনের রিসিট PDF)<br />
                  &nbsp;&nbsp;└── 📁 Statements/2026/ (মাসিক ও ত্রৈমাসিক সরকারি স্টেটমেন্ট PDF)
                </div>
              </div>

              {/* Uploaded Files Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b font-bold text-slate-700 flex justify-between items-center">
                  <span>ড্রাইভে সংরক্ষিত ফাইলের তালিকা ({driveFiles.length} টি)</span>
                  <span className="text-[10px] text-emerald-700 font-normal">অটো-সিঙ্ক সক্রিয় ✓</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="text-slate-800 block">{file.fileName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{file.driveFolder}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {Math.round(file.sizeBytes / 1024)} KB
                        </span>
                        <a
                          href={file.driveWebUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          ভিউ
                        </a>
                      </div>
                    </div>
                  ))}
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
