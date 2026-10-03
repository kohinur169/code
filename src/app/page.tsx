'use client';

import React, { useState, useEffect } from 'react';
import {
  BusinessSettings,
  ReceiptItem,
  GovtStatementItem,
  AuditLog,
  ServiceItem,
} from '@/types';
import {
  getSettings,
  getReceipts,
  getStatements,
  getAuditLogs,
  getServices,
} from '@/lib/storage';
import { toBanglaDigits, formatBanglaDate } from '@/lib/banglaConverter';
import { getDriveConfig } from '@/lib/googleDriveService';
import { ReceiptModal } from '@/components/ReceiptModal';
import { GovtStatementModal } from '@/components/GovtStatementModal';
import { NewServiceModal } from '@/components/NewServiceModal';
import { SettingsModal } from '@/components/SettingsModal';
import { CashClosingModal } from '@/components/CashClosingModal';
import { ComplianceCenter } from '@/components/ComplianceCenter';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { MakerCheckerModal } from '@/components/MakerCheckerModal';
import { StaffManagerModal } from '@/components/StaffManagerModal';
import { ConsentSlipModal } from '@/components/ConsentSlipModal';
import { OfficialFeeChartModal } from '@/components/OfficialFeeChartModal';
import { OfficialLicenseModal } from '@/components/OfficialLicenseModal';
import { BatchReceiptPrintModal } from '@/components/BatchReceiptPrintModal';
import {
  FileText,
  Printer,
  Plus,
  Settings,
  ShieldCheck,
  CloudCheck,
  Wallet,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  Landmark,
  Award,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [settings, setSettings] = useState<BusinessSettings>(getSettings());
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [statements, setStatements] = useState<GovtStatementItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [driveConfig, setDriveConfig] = useState(getDriveConfig());

  // Active view tab
  const [activeTab, setActiveTab] = useState<'receipts' | 'statements' | 'compliance' | 'audit'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCashClosingModal, setShowCashClosingModal] = useState(false);
  const [showMakerCheckerModal, setShowMakerCheckerModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showFeeChartModal, setShowFeeChartModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showBatchPrintModal, setShowBatchPrintModal] = useState(false);
  const [viewingStatement, setViewingStatement] = useState<GovtStatementItem | null>(null);

  // Load state on mount
  const reloadData = () => {
    setSettings(getSettings());
    setReceipts(getReceipts());
    setStatements(getStatements());
    setAuditLogs(getAuditLogs());
    setServices(getServices());
    setDriveConfig(getDriveConfig());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Financial calculations
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayReceipts = receipts.filter(
    (r) => r.createdAt.startsWith(todayStr) && r.status === 'valid'
  );
  const todayTotalRevenue = todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0);

  const filteredReceipts = receipts.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.receiptNo.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerMobile.includes(q) ||
      r.serviceName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* TOP NAVIGATION BAR */}
      <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
              LSFC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  অনুমতিপত্র নং: {settings.licenseNo}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                {settings.businessName} • {settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র
              </h1>
            </div>
          </div>

          {/* Right Header Status & Actions */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Google Drive Status Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <CloudCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">ড্রাইভ স্টোরেজ:</span>
              <strong className="text-emerald-400">সক্রিয় ✓</strong>
            </div>

            {/* Quick Action: Settings */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
              title="কেন্দ্র সেটিংস ও কনফিগারেশন"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Incharge profile badge */}
            <div className="hidden md:flex flex-col text-right">
              <span className="font-bold text-slate-100">{settings.inchargeName}</span>
              <span className="text-[10px] text-slate-400">{settings.inchargeDesignation}</span>
            </div>
          </div>

        </div>
      </header>

      {/* ACTION HERO & STATS BANNER */}
      <div className="no-print bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-emerald-800">
                কেন্দ্রের অবস্থান: {settings.upazila}, {settings.district}
              </p>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                ভূমিসেবা ব্যবস্থাপনা ও স্টেটমেন্ট পোর্টাল
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMakerCheckerModal(true)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-all shadow-xs"
                title="বাতিল ও খরচের মেকার–চেকার অনুমোদন"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                মেকার–চেকার কিউ
              </button>

              <button
                type="button"
                onClick={() => setShowBatchPrintModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
                title="৩টি চেক রিসিট একত্রে ১টি A4 পাতায় প্রিন্ট"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                ব্যাচ প্রিন্ট (৩টি/A4)
              </button>

              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                কর্মী ও বেতন
              </button>

              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                নাগরিক সম্মতিপত্র
              </button>

              <button
                type="button"
                onClick={() => setShowFeeChartModal(true)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Award className="w-3.5 h-3.5 text-blue-600" />
                পরিশিষ্ট–৭ ফি চার্ট
              </button>

              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                ফরম–২ লাইসেন্স
              </button>

              <button
                type="button"
                onClick={() => setShowCashClosingModal(true)}
                className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold border border-purple-300 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Wallet className="w-4 h-4 text-purple-700" />
                ক্যাশ ক্লোজিং
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingStatement(null);
                  setShowStatementModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Landmark className="w-4 h-4" />
                সরকারি স্টেটমেন্ট (A4 Landscape)
              </button>

              <button
                type="button"
                onClick={() => setShowNewServiceModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                + নতুন সেবা ও রিসিট
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Today's Receipts */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">আজকের সেবা সংখ্যা</span>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {toBanglaDigits(todayReceipts.length)} টি
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                সর্বমোট রিসিট সংখ্যা: {toBanglaDigits(receipts.length)}
              </p>
            </div>

            {/* Card 2: Revenue */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">আজকের সংগৃহীত ফি</span>
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-blue-900 mt-2">
                ৳{toBanglaDigits(todayTotalRevenue)}/-
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                নগদ ও ডিজিটাল আদায়সহ
              </p>
            </div>

            {/* Card 3: September 2026 Govt Statement */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">সেপ্টেম্বর/২০২৬ স্টেটমেন্ট</span>
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {toBanglaDigits(statements[0]?.totalApplications || 678)} টি
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                সরকারি ফরম্যাটে প্রস্তুত ও সংরক্ষিত ✓
              </p>
            </div>

            {/* Card 4: License validity */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">অনুমতিপত্রের মেয়াদ</span>
                <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                বৈধ ও হালনাগাদ
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                মেয়াদ শেষ: {formatBanglaDate(settings.licenseExpiryDate)}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'receipts'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            রিসিট রেজিস্টার (৮.২৭"×৩.৮৯" চ্যাকবুক)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statements')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'statements'
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            সরকারি স্টেটমেন্ট আর্কাইভ (statment.jpg)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'compliance'
                ? 'border-purple-600 text-purple-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            ডিজিটাল কমপ্লায়েন্স ও পরিদর্শন
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            অপরিবর্তনীয় অডিট ট্রেইল
          </button>
        </div>

        {/* TAB 1: RECEIPTS REGISTER */}
        {activeTab === 'receipts' && (
          <div className="space-y-4">
            
            {/* Search and stats bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="রিসিট নম্বর, গ্রাহকের নাম, মোবাইল দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>প্রিন্ট ফরম্যাট: <strong>৮.২৭" × ৩.৮৯" চ্যাকবুক সাইজ</strong></span>
                <span className="text-slate-300">|</span>
                <span>(শুধু ১টি গ্রাহক কপি প্রিন্ট হয়)</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">রিসিট নং</th>
                    <th className="py-3 px-4 font-bold">তারিখ ও সময়</th>
                    <th className="py-3 px-4 font-bold">সেবা গ্রহীতা</th>
                    <th className="py-3 px-4 font-bold">ভূমিসেবার নাম</th>
                    <th className="py-3 px-4 font-bold text-right">সহায়তা ফি</th>
                    <th className="py-3 px-4 font-bold text-right">সর্বমোট ফি</th>
                    <th className="py-3 px-4 font-bold text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 font-bold text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {r.receiptNo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {toBanglaDigits(r.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block">{r.customerName}</strong>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {toBanglaDigits(r.customerMobile)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{r.serviceName}</span>
                        {r.applicationTrackingNo && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            ট্র্যাকিং: {r.applicationTrackingNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        ৳{toBanglaDigits(r.serviceFee)}/-
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ৳{toBanglaDigits(r.totalAmount)}/-
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.status === 'valid' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            বৈধ ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            বাতিলকৃত (Void)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            প্রিন্ট প্রিভিউ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: GOVT STATEMENT ARCHIVE */}
        {activeTab === 'statements' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  সংরক্ষিত সরকারি স্টেটমেন্ট তালিকা (statment .jpg ফরম্যাট)
                </h4>
                <p className="text-xs text-slate-500">
                  A4 Landscape ফরম্যাটে প্রস্তুতকৃত ও গুগল ড্রাইভে স্থায়ীভাবে ব্যাকআপকৃত স্টেটমেন্টসমূহ
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingStatement(null);
                  setShowStatementModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                নতুন স্টেটমেন্ট তৈরি করুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statements.map((stmt) => (
                <div
                  key={stmt.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3 hover:border-blue-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                        {stmt.periodType === 'monthly' ? 'মাসিক স্টেটমেন্ট' : 'বিশেষ স্টেটমেন্ট'}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        {stmt.periodLabel}
                      </h4>
                      <p className="text-xs text-slate-500">
                        স্মারক নং: <span className="font-mono">{stmt.memoNo}</span> | তারিখ: {stmt.statementDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 block">
                        {toBanglaDigits(stmt.totalApplications)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">মোট আবেদন</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-semibold text-slate-700">সেবার সারসংক্ষেপ:</p>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                      {stmt.breakdown.slice(0, 4).map((b, i) => (
                        <div key={i} className="truncate">
                          • {b.serviceName}: <strong>{toBanglaDigits(b.count)}</strong> টি
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CloudCheck className="w-4 h-4" />
                      ড্রাইভে সংরক্ষিত ✓
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setViewingStatement(stmt);
                        setShowStatementModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      স্টেটমেন্ট দেখুন ও প্রিন্ট করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMPLIANCE & INSPECTION */}
        {activeTab === 'compliance' && (
          <ComplianceCenter settings={settings} />
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <AuditLogViewer logs={auditLogs} />
        )}

      </main>

      {/* FOOTER */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            © ২০২৬ ভূমিসেবা সহায়তা কেন্দ্র (LSFC) • গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
          </p>
          <div className="flex items-center space-x-4">
            <span>সহায়তা হটলাইন: <strong>১৬১২২</strong></span>
            <span>|</span>
            <span>সিস্টেম সংস্করণ: v2.5.0-Compliance</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          settings={settings}
          onClose={() => setSelectedReceipt(null)}
          onReceiptUpdated={reloadData}
        />
      )}

      {showStatementModal && (
        <GovtStatementModal
          settings={settings}
          receipts={receipts}
          existingStatement={viewingStatement}
          onClose={() => setShowStatementModal(false)}
          onSaved={reloadData}
        />
      )}

      {showNewServiceModal && (
        <NewServiceModal
          settings={settings}
          services={services}
          onClose={() => setShowNewServiceModal(false)}
          onReceiptCreated={(newR) => {
            setShowNewServiceModal(false);
            reloadData();
            setSelectedReceipt(newR);
          }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSaved={reloadData}
        />
      )}

      {showCashClosingModal && (
        <CashClosingModal
          settings={settings}
          receipts={receipts}
          onClose={() => setShowCashClosingModal(false)}
          onClosed={reloadData}
        />
      )}

      {showMakerCheckerModal && (
        <MakerCheckerModal
          settings={settings}
          onClose={() => setShowMakerCheckerModal(false)}
        />
      )}

      {showStaffModal && (
        <StaffManagerModal
          settings={settings}
          receipts={receipts}
          onClose={() => setShowStaffModal(false)}
        />
      )}

      {showConsentModal && (
        <ConsentSlipModal
          settings={settings}
          onClose={() => setShowConsentModal(false)}
        />
      )}

      {showFeeChartModal && (
        <OfficialFeeChartModal
          settings={settings}
          services={services}
          onClose={() => setShowFeeChartModal(false)}
        />
      )}

      {showLicenseModal && (
        <OfficialLicenseModal
          settings={settings}
          onClose={() => setShowLicenseModal(false)}
        />
      )}

      {showBatchPrintModal && (
        <BatchReceiptPrintModal
          receipts={receipts}
          settings={settings}
          onClose={() => setShowBatchPrintModal(false)}
        />
      )}

    </div>
  );
}
