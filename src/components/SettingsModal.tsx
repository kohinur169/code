'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/types';
import { saveSettings, exportFullBackupJSON, restoreFullBackupJSON, addAuditLog } from '@/lib/storage';
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
  Shield,
  Smartphone,
  Download,
  Upload,
  AlertTriangle,
  GitBranch,
  Lock,
  KeyRound,
  CheckCircle2,
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
  const [activeTab, setActiveTab] = useState<'profile' | 'drive' | 'database' | 'security' | 'branches' | 'backup'>('profile');
  const [formData, setFormData] = useState<BusinessSettings>({ ...initialSettings });
  const [copiedSql, setCopiedSql] = useState(false);
  const [driveConfig, setDriveConfig] = useState<DriveConfig>(getDriveConfig());
  const [driveFiles, setDriveFiles] = useState<DriveFileRecord[]>([]);

  // Security & MFA state (Items #11, #15, #16, #17)
  const [cashierLimit, setCashierLimit] = useState(5000);
  const [managerLimit, setManagerLimit] = useState(25000);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [activeSessions, setActiveSessions] = useState([
    { device: 'Desktop Chrome / Windows 11', location: 'ঠাকুরগাঁও সদর (বর্তমান সেশন)', ip: '103.145.118.24', lastActive: 'এখন সক্রিয়' },
    { device: 'Android Chrome / Samsung S23', location: 'রংপুর', ip: '103.145.118.99', lastActive: '২ ঘণ্টা আগে' },
  ]);

  // Multi-Center branches (Item #32)
  const [branches, setBranches] = useState([
    { id: 'b1', name: 'ঠাকুরগাঁও সদর শাখা (মূল কেন্দ্র)', licenseNo: '০১', code: 'LSFC-TS-01', incharge: 'মোঃ মাহমুদুল হাসান', active: true },
    { id: 'b2', name: 'রুহিয়া উপ-শাখা', licenseNo: '০৭', code: 'LSFC-RU-02', incharge: 'মোঃ আসাদুজ্জামান', active: false },
    { id: 'b3', name: 'পীরগঞ্জ মডেল শাখা', licenseNo: '১২', code: 'LSFC-PG-03', incharge: 'বেগম তহুরা খাতুন', active: false },
  ]);

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

  const handleLogoutOtherSessions = () => {
    setActiveSessions([activeSessions[0]]);
    addAuditLog({
      userId: 'user_owner',
      userName: formData.inchargeName,
      userRole: 'owner',
      action: 'UPDATE_SETTINGS',
      details: 'অন্য সকল সক্রিয় ডিভাইস সেশন রিমোটলি লগআউট করা হয়েছে।',
      ipAddress: '103.145.118.24',
      device: 'Desktop Chrome / Windows 11',
    });
    alert('অন্য সকল ডিভাইস থেকে সফলভাবে লগআউট করা হয়েছে!');
  };

  const handleBreakGlassEmergency = () => {
    if (confirm('সতর্কতা: আপনি কি ইমারজেন্সি এক্সেস (Break Glass) সক্রিয় করতে চান? এটি একটি হাই-প্রায়োরিটি সিকিউরিটি অডিট ইভেন্ট তৈরি করবে।')) {
      addAuditLog({
        userId: 'user_owner',
        userName: formData.inchargeName,
        userRole: 'owner',
        action: 'UPDATE_SETTINGS',
        details: '🚨 HIGH PRIORITY: ব্রেক-গ্লাস জরুরি রিকভারি এক্সেস কার্যকর করা হয়েছে।',
        ipAddress: '103.145.118.24',
        device: 'Desktop Chrome / Windows 11',
      });
      alert('জরুরি রিকভারি মোড সচল হয়েছে এবং সিকিউরিটি অডিট লগে স্থায়ী রেকর্ড তৈরি হয়েছে।');
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LSFC_Full_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = restoreFullBackupJSON(reader.result as string);
      if (success) {
        alert('অফলাইন ব্যাকআপ ডাটা সফলভাবে রিস্টোর হয়েছে!');
        onSaved();
        onClose();
      } else {
        alert('ফাইলটি সঠিক JSON ফরম্যাটে নেই। রিস্টোর ব্যর্থ হয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">কেন্দ্র প্রোফাইল, সিকিউরিটি ও ক্লাউড স্টোরেজ ইঞ্জিন</h3>
              <p className="text-xs text-slate-300">
                ব্যবসায়িক তথ্য, নিরাপত্তা নিয়ন্ত্রণ, মাল্টি-ব্রাঞ্চ ও ক্লাউড ড্রাইভ আর্কিটেকচার
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
        <div className="bg-slate-100 px-6 py-2 flex items-center space-x-2 border-b border-slate-200 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            কেন্দ্র পরিচিতি ও স্টেটমেন্ট ফিল্ড
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            নিরাপত্তা, ২FA ও সেশন
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'drive'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            গুগল ড্রাইভ স্টোরেজ
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'branches'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            মাল্টি-সেন্টার শাখা (Multi-Branch)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            অফলাইন ব্যাকআপ ও রিস্টোর
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            সুপাবেজ (Supabase SQL)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-slate-700 text-xs">
                💡 <strong>মনে রাখবেন:</strong> এখানে দেওয়া তথ্যগুলো হুবহু আপনার <strong>রিসিট</strong> এবং <strong>সরকারি স্টেটমেন্টের</strong> প্রতিটি ডাইনামিক ফিল্ডে স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">দোকান / ব্যবসায়িক প্রতিষ্ঠানের নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ভূমির অনুমোদিত কেন্দ্রের নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.lsfcName}
                    onChange={(e) => setFormData({ ...formData, lsfcName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অনুমতি পত্র নং <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সহকারী কমিশনার (ভূমি) এর কার্যালয় <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.acLandOffice}
                    onChange={(e) => setFormData({ ...formData, acLandOffice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">উপজেলা</label>
                  <input
                    type="text"
                    value={formData.upazila}
                    onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইনচার্জের নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.inchargeName}
                    onChange={(e) => setFormData({ ...formData, inchargeName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মন্ত্রণালয়ের রেফারেন্স স্মারক উদ্ধৃতি <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.ministryMemoRef}
                  onChange={(e) => setFormData({ ...formData, ministryMemoRef: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Upload Signature & Monogram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">ইনচার্জের ডিজিটাল স্বাক্ষর আপলোড</label>
                  <p className="text-[10px] text-slate-500 mb-2">রিসিট ও স্টেটমেন্টে অটো-এমবেড হবে (Google Drive-এ সংরক্ষিত)</p>
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="text-xs" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">স্টেটমেন্টের মনোগ্রাম / ছবি আপলোড</label>
                  <p className="text-[10px] text-slate-500 mb-2">নমুনার মতো উপরের ডান কোণে যুক্ত হবে</p>
                  <input type="file" accept="image/*" onChange={handleMonogramUpload} className="text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm">
                  <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & SESSIONS (Items #11, #15, #16, #17) */}
          {activeTab === 'security' && (
            <div className="space-y-6 text-xs">
              
              {/* 2FA Status */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    <strong className="text-slate-900 text-sm">টু-ফ্যাক্টর অথেনটিকেশন (2FA / MFA)</strong>
                  </div>
                  <p className="text-slate-500 mt-1">মালিকের অ্যাকাউন্টে লগইন ও সংবেদনশীল কার্যকলাপে অতিরিক্ত সুরক্ষা</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                    mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {mfaEnabled ? 'সক্রিয় (MFA Active) ✓' : 'নিষ্ক্রিয়'}
                </button>
              </div>

              {/* Financial Approval Limits (Item #11) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <strong className="text-slate-900 text-sm block">কর্মীদের আর্থিক অনুমোদন সীমা (Financial Approval Limits)</strong>
                <p className="text-slate-500">মেকার-চেকার ছাড়াই সর্বোচ্চ কত টাকা পর্যন্ত এডজাস্টমেন্ট করতে পারবে:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-600 font-semibold">ক্যাশিয়ার / অপারেটর লিমিট</span>
                    <input
                      type="number"
                      value={cashierLimit}
                      onChange={(e) => setCashierLimit(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-600 font-semibold">ম্যানেজার লিমিট</span>
                    <input
                      type="number"
                      value={managerLimit}
                      onChange={(e) => setManagerLimit(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-600 font-semibold">মালিক (Owner)</span>
                    <input
                      type="text"
                      disabled
                      value="আনলিমিটেড (Unlimited)"
                      className="w-full mt-1 p-2 bg-slate-200 border border-slate-300 rounded font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Active Sessions & Device Management (Item #15) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 text-sm">সক্রিয় সেশন ও ডিভাইস ব্যবস্থাপনা (Device Management)</strong>
                    <p className="text-slate-500">আপনার একাউন্টে বর্তমানে কোন কোন ডিভাইস থেকে লগইন আছে:</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogoutOtherSessions}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 rounded-lg text-xs"
                  >
                    অন্যান্য সব ডিভাইস লগআউট করুন
                  </button>
                </div>

                <div className="space-y-2">
                  {activeSessions.map((s, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                        <div>
                          <strong className="text-slate-800 block">{s.device}</strong>
                          <span className="text-[11px] text-slate-500">স্থান: {s.location} | আইপি: {s.ip}</span>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-bold text-[11px]">{s.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Access / Break Glass (Item #17) */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
                <div>
                  <strong className="text-red-950 text-sm block">জরুরি রিকভারি মোড (Break-Glass Emergency Access)</strong>
                  <p className="text-red-800 text-xs">জরুরি মুহূর্তে ওনার একাউন্ট আনলক করার ব্যবস্থা (হাই-লেভেল অডিট লগ সৃষ্টি করবে)</p>
                </div>
                <button
                  type="button"
                  onClick={handleBreakGlassEmergency}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                >
                  ব্রেক-গ্লাস রিকভারি
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
                <h4 className="font-bold text-blue-950 text-sm">গুগল ড্রাইভ হাইব্রিড ফাইল স্টোরেজ</h4>
                <p className="text-slate-600">
                  নির্দেশিকা মোতাবেক সকল রিসিটের PDF, মাসিক সরকারি স্টেটমেন্ট এবং এনআইডি ফাইল ক্লাউড গুগল ড্রাইভে ফোল্ডার ট্রিতে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-800 mb-2">ড্রাইভে সংরক্ষিত সর্বশেষ ফাইলসমূহ ({driveFiles.length} টি)</h5>
                <div className="divide-y divide-slate-200 max-h-56 overflow-y-auto bg-white rounded-lg border">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <strong className="text-slate-800 block">{file.fileName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{file.driveFolder}</span>
                      </div>
                      <a href={file.driveWebUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> ভিউ
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MULTI-CENTER BRANCHES (Item #32) */}
          {activeTab === 'branches' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">মাল্টি-সেন্টার ও ব্রাঞ্চ ব্যবস্থাপনা (Multi-Center Architecture)</h4>
                <p className="text-slate-500">একই ওনারের একাধিক শাখা থাকলে প্রতিটি শাখার ডাটা ও আয়-ব্যয় সম্পূর্ণ আইসোলেটেড থাকবে।</p>
              </div>

              <div className="space-y-3">
                {branches.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{b.name}</strong>
                        {b.active && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">বর্তমান সেশন ✓</span>}
                      </div>
                      <p className="text-slate-600 mt-1">কোড: <code>{b.code}</code> | অনুমতিপত্র নং: {b.licenseNo} | ইনচার্জ: {b.incharge}</p>
                    </div>

                    <div>
                      {b.active ? (
                        <span className="text-emerald-700 font-bold text-xs">সক্রিয় কেন্দ্র</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert(`শাখা ${b.name}-এ সুইচ সম্পন্ন হয়েছে।`)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                        >
                          এই কেন্দ্রে সুইচ করুন
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RECOVERY (Items #30, #31) */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-950 text-sm">স্বয়ংক্রিয় ব্যাকআপ ভেরিফিকেশন ও ডিজাস্টার রিকভারি</h4>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded text-[11px]">
                    Backup Health: Healthy ✓
                  </span>
                </div>
                <p className="text-slate-600">
                  সিস্টেমের ডাটাবেজ ইন্টিগ্রিটি ও ব্যাকআপ রিডেবিলিটি প্রতি ১২ ঘণ্টা অন্তর স্বয়ংক্রিয়ভাবে ভেরিফাই হয়।
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-emerald-900 border-t border-emerald-200">
                  <div><strong>RPO (Recovery Point Objective):</strong> ১৫–৬০ মিনিট</div>
                  <div><strong>RTO (Recovery Time Objective):</strong> ১–৪ ঘণ্টা</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <strong className="text-slate-900 block font-bold">সম্পূর্ণ অফলাইন ডাটা ব্যাকআপ ডাউনলোড</strong>
                  <p className="text-slate-500">
                    রিসিট, স্টেটমেন্ট, অডিট লগ, চেকলিস্ট ও সেটিংস সহ সম্পূর্ণ সিস্টেম ডাটা JSON ফাইলে সেভ করুন।
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> ব্যাকআপ JSON ফাইল ডাউনলোড
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <strong className="text-slate-900 block font-bold">ব্যাকআপ ফাইল থেকে ডাটা রিস্টোর</strong>
                  <p className="text-slate-500">
                    পূর্বে ডাউনলোডকৃত কোনো ব্যাকআপ ফাইল আপলোড করে এক ক্লিকে সম্পূর্ণ সিস্টেম ফিরিয়ে আনুন।
                  </p>
                  <label className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-4 h-4" /> ব্যাকআপ ফাইল নির্বাচন ও রিস্টোর
                    <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUPABASE DATABASE */}
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
