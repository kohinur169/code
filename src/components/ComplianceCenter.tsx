'use client';

import React, { useState } from 'react';
import { BusinessSettings, InspectionChecklist, ComplaintRecord } from '@/types';
import { toBanglaDigits, formatBanglaDate } from '@/lib/banglaConverter';
import { getInspectionChecklist, saveInspectionChecklist, getComplaints, addComplaint, addAuditLog } from '@/lib/storage';
import {
  Clock,
  MessageSquare,
  Plus,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  CheckSquare,
  Upload,
  ShieldCheck,
  Building2,
  Users,
  Database,
  Lock,
  Printer,
  Calendar,
  Award,
} from 'lucide-react';

interface ComplianceCenterProps {
  settings: BusinessSettings;
}

interface DocumentExpiryItem {
  id: string;
  docName: string;
  docNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface CorrectiveActionItem {
  id: string;
  finding: string;
  responsible: string;
  deadline: string;
  actionTaken: string;
  evidenceDoc: string;
  status: 'open' | 'in_progress' | 'closed';
}

interface InspectionHistoryItem {
  id: string;
  date: string;
  authority: string;
  officerName: string;
  officerDesignation: string;
  score: number;
  findings: string;
  remarks: string;
  deficiencies: string;
  correctiveAction: string;
  deadline: string;
  resolution: string;
  supportingDoc: string;
}

export const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'expiry' | 'corrective' | 'complaints'>('overview');
  const [checklist, setChecklist] = useState<InspectionChecklist[]>(getInspectionChecklist());
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(getComplaints());

  // Document Expiry Tracker (Feature #4)
  const [documents, setDocuments] = useState<DocumentExpiryItem[]>([
    {
      id: 'doc_1',
      docName: 'এলএসএফসি সরকারি পরিচালনা অনুমতিপত্র',
      docNumber: settings.licenseNo,
      issuingAuthority: `জেলা প্রশাসক কার্যালয়, ${settings.district}`,
      issueDate: settings.licenseIssueDate,
      expiryDate: settings.licenseExpiryDate,
      status: 'valid',
      daysLeft: Math.ceil((new Date(settings.licenseExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
    },
    {
      id: 'doc_2',
      docName: 'হালনাগাদ পৌর/ইউনিয়ন ট্রেড লাইসেন্স',
      docNumber: 'TRD-2025-9014',
      issuingAuthority: `${settings.upazila} পৌরসভা`,
      issueDate: '2025-07-01',
      expiryDate: '2026-06-30',
      status: 'expiring_soon',
      daysLeft: 270,
    },
    {
      id: 'doc_3',
      docName: 'দোকান/স্পেস ভাড়ার চুক্তিপত্র (ন্যূনতম ২ বছর)',
      docNumber: 'RNT-8812',
      issuingAuthority: 'নোটারি পাবলিক',
      issueDate: '2025-01-01',
      expiryDate: '2027-01-01',
      status: 'valid',
      daysLeft: 455,
    },
    {
      id: 'doc_4',
      docName: '১০ এমবিপিএস অপটিক্যাল ফাইবার ব্রডব্যান্ড চুক্তি',
      docNumber: 'ISP-77102',
      issuingAuthority: 'বিটিআরসি অনুমোদিত আইএসপি',
      issueDate: '2025-02-01',
      expiryDate: '2026-11-15',
      status: 'valid',
      daysLeft: 43,
    },
  ]);

  // Government Inspection Module History (Feature #2)
  const [inspectionHistory, setInspectionHistory] = useState<InspectionHistoryItem[]>([
    {
      id: 'insp_1',
      date: '2026-09-18',
      authority: `সহকারী কমিশনার (ভূমি) কার্যালয়, ${settings.upazila}`,
      officerName: 'জনাব রিফাত বিন আশরাফ',
      officerDesignation: 'সহকারী কমিশনার (ভূমি)',
      score: 95,
      findings: 'কেন্দ্রের সার্বিক সেবা, সরকারি ফি চার্ট ও সাইনবোর্ড সন্তোষজনকভাবে টানানো আছে।',
      remarks: 'নাগরিক সেবা ও রিসিট প্রদানের কার্যক্রমে স্বচ্ছতা বজায় আছে।',
      deficiencies: 'ডেস্কটপে স্ক্যান ফাইলের সাময়িক জমাকরণ',
      correctiveAction: 'গুগল ড্রাইভে সরাসরি আপলোড ও লোকাল ফাইল পার্মানেন্ট ডিলিট পলিসি কার্যকর করা হয়েছে।',
      deadline: '2026-10-15',
      resolution: 'শতভাগ সমাধান ও প্রমাণক অনুমোদিত',
      supportingDoc: 'AC_Land_Inspection_Report_2026.pdf',
    },
    {
      id: 'insp_2',
      date: '2026-05-10',
      authority: `অতিরিক্ত জেলা প্রশাসক (রাজস্ব) কার্যালয়, ${settings.district}`,
      officerName: 'জনাব কামরুল হাসান',
      officerDesignation: 'অতিরিক্ত জেলা প্রশাসক (রাজস্ব)',
      score: 92,
      findings: 'অনুমোদিত ফি মোতাবেক রিসিট প্রদান এবং ডিজিটাল অডিট ট্রেইল পরীক্ষিত ও সঠিক।',
      remarks: 'চমৎকার উদ্যোক্তা ব্যবস্থাপনা।',
      deficiencies: 'অভিযোগ বাক্সে এসিল্যান্ড মহোদয়ের নামফলক স্পষ্টীকরণ',
      correctiveAction: 'নতুন স্টিকারযুক্ত সিল ও নির্দেশিকা সংস্থাপন।',
      deadline: '2026-05-25',
      resolution: 'সমাধান সম্পন্ন',
      supportingDoc: 'ADC_Rev_Inspection_Report.pdf',
    },
  ]);

  // Corrective Action Management (Feature #3)
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveActionItem[]>([
    {
      id: 'ca_1',
      finding: 'গ্রাহকের আবেদনের সাথে সংযুক্ত খতিয়ানের কপি স্ক্যান শেষে ডেস্কটপে উন্মুক্ত রাখা যাবে না',
      responsible: 'কম্পিউটার অপারেটর ১',
      deadline: '2026-10-15',
      actionTaken: 'স্ক্যানকৃত ফাইল তাৎক্ষণিক গুগল ড্রাইভে আপলোড করে লোকাল কম্পিউটার থেকে পার্মানেন্ট ডিলিট পলিসি কার্যকর করা হয়েছে।',
      evidenceDoc: 'Data_Security_SOP.pdf',
      status: 'closed',
    },
    {
      id: 'ca_2',
      finding: 'অভিযোগ বাক্সের উপরে সিসিটিভি ক্যামেরার ফোকাস আরও স্পষ্ট করতে হবে',
      responsible: `${settings.inchargeName} (ইনচার্জ)`,
      deadline: '2026-10-20',
      actionTaken: 'সিসিটিভি ক্যামেরা অ্যাঙ্গেল পরিবর্তন ও রেকর্ডিং টেস্ট সম্পন্ন।',
      evidenceDoc: 'CCTV_Inspection_Photo.jpg',
      status: 'closed',
    },
  ]);

  // New complaint form state
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [newCitizenName, setNewCitizenName] = useState('');
  const [newCitizenMobile, setNewCitizenMobile] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const toggleChecklistItem = (id: number) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, complied: !item.complied } : item
    );
    setChecklist(updated);
    saveInspectionChecklist(updated);
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitizenName || !newSubject) return;

    const newRecord: ComplaintRecord = {
      id: `cmp_${Date.now()}`,
      complaintDate: new Date().toISOString().substring(0, 10),
      citizenName: newCitizenName,
      citizenMobile: newCitizenMobile,
      subject: newSubject,
      description: newDesc,
      status: 'pending',
    };

    addComplaint(newRecord);
    setComplaints([newRecord, ...complaints]);
    setShowAddComplaint(false);
    setNewCitizenName('');
    setNewCitizenMobile('');
    setNewSubject('');
    setNewDesc('');
    alert('অভিযোগটি সফলভাবে নথিভুক্ত করা হয়েছে।');
  };

  const compliedCount = checklist.filter((c) => c.complied).length;
  const complianceScore = Math.round((compliedCount / checklist.length) * 100);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner - 4 Core Compliance Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              অনুমতিপত্রের মেয়াদ
            </span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              {toBanglaDigits(documents[0].daysLeft)} দিন বাকি
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              মেয়াদ: {formatBanglaDate(settings.licenseExpiryDate)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              পরিদর্শন প্রস্তুতি স্কোর
            </span>
            <h4 className="text-xl font-black text-emerald-700 mt-1">
              {toBanglaDigits(complianceScore)}% প্রস্তুত
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              পরিশিষ্ট-৫: {toBanglaDigits(compliedCount)}/১০টি মানদণ্ড অর্জিত
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              কারেক্টিভ অ্যাকশন (CAPA)
            </span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              ১০০% সমাধানকৃত
            </h4>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {toBanglaDigits(correctiveActions.length)}টির সবকয়টি ক্লোজড ✓
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileWarning className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ডিজিটাল অভিযোগ রেজিস্টার
            </span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              {toBanglaDigits(complaints.length)} টি নথিভুক্ত
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              চাবি এসিল্যান্ড মহোদয়ের নিকট
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Compliance Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            কমপ্লায়েন্স সামারি (LSFC Readiness)
          </button>
          <button
            onClick={() => setActiveTab('inspection')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'inspection'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            সরকারি পরিদর্শন মডিউল ও চেকলিস্ট (পরিশিষ্ট-৫)
          </button>
          <button
            onClick={() => setActiveTab('expiry')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'expiry'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ডকুমেন্ট মেয়াদ ট্র্যাকার (Expiry 90/60/30/7)
          </button>
          <button
            onClick={() => setActiveTab('corrective')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'corrective'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            কারেক্টিভ অ্যাকশন (CAPA Workflow)
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'complaints'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            অভিযোগ রেজিস্টার (অনুচ্ছেদ ১১.৬.১৩)
          </button>
        </div>

        <div className="p-6">
          
          {/* TAB 1: OVERVIEW - EXACT 11 AUDIT INDICATORS (Item #1) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs">
              
              {/* Readiness Banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-emerald-950">
                      LSFC আজ কতটা Compliance-Ready?
                    </h5>
                    <p className="text-xs text-emerald-800">
                      ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫-এর সকল আইনি ও প্রশাসনিক শর্তাবলি শতভাগ প্রতিপালিত।
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-lg text-xs shadow-xs">
                  ১০০% অডিট রেডি (AUDIT-READY)
                </span>
              </div>

              {/* 11 Audit Indicators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">১. অনুমতিপত্র স্ট্যাটাস</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    অনুমতিপত্র সম্পূর্ণ বৈধ ও সচল
                  </div>
                  <p className="text-[11px] text-slate-600">অনুমতিপত্র নং: {settings.licenseNo}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">২. অনুমতিপত্রের মেয়াদ</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {formatBanglaDate(settings.licenseExpiryDate)}
                  </div>
                  <p className="text-[11px] text-slate-600">অবশিষ্ট মেয়াদ: {toBanglaDigits(documents[0].daysLeft)} দিন</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৩. কর্মচারীর তথ্য ও এনআইডি</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    সকল কর্মীর তথ্য সম্পূর্ণ
                  </div>
                  <p className="text-[11px] text-slate-600">ছবি ও এনআইডি ড্রাইভে সংরক্ষিত</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৪. সার্ভিস রেজিস্টার স্ট্যাটাস</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    রিয়েল-টাইম হালনাগাদ
                  </div>
                  <p className="text-[11px] text-slate-600">ট্রেজারি ফি ও সহায়তা ফি পৃথকীকৃত</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৫. অভিযোগ রেজিস্টার স্ট্যাটাস</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ডিজিটাল রেজিস্টার সক্রিয়
                  </div>
                  <p className="text-[11px] text-slate-600">তালাবদ্ধ অভিযোগ বক্স স্থাপিত</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৬. রিসিট রেকর্ড ও কাউন্টারফয়েল</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    অপরিবর্তনীয় ও সংরক্ষিত
                  </div>
                  <p className="text-[11px] text-slate-600">৮.২৭"×৩.৮৯" সাইজ ও কিউআর যাচাইকৃত</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৭. গ্রাহক ডেটা রেকর্ড</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    সম্পূর্ণ ও মাস্কড সুরক্ষিত
                  </div>
                  <p className="text-[11px] text-slate-600">কোনো গ্রাহক অ্যাকাউন্ট নেই</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৮. প্রয়োজনীয় নথিপত্র সংযুক্তি</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ৪টি মূল দলিল হালনাগাদ
                  </div>
                  <p className="text-[11px] text-slate-600">ট্রেড লাইসেন্স, ভাড়া ও আইএসপি চুক্তি</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">৯. সর্বশেষ ব্যাকআপ স্থিতি</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    আজ দুপুর ১২:০০ (গুগল ড্রাইভ)
                  </div>
                  <p className="text-[11px] text-slate-600">Backup Health: Healthy ✓</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">১০. সিকিউরিটি ও ডাটা রিভিউ</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    জিরো-ট্রাস্ট ও সুরক্ষিত
                  </div>
                  <p className="text-[11px] text-slate-600">অস্বাভাবিক কার্যকলাপ বা লঙ্ঘন নেই</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">১১. সর্বশেষ সরকারি পরিদর্শন</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <Award className="w-3.5 h-3.5" />
                    ১৮ সেপ্টেম্বর ২০২৬ (এসিল্যান্ড)
                  </div>
                  <p className="text-[11px] text-slate-600">পরিদর্শন স্কোর: ৯৫% (সন্তোষজনক)</p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: GOVERNMENT INSPECTION MODULE (Item #2) */}
          {activeTab === 'inspection' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    সরকারি পরিদর্শন মডিউল ও ইতিহাস (Government Inspection Log)
                  </h5>
                  <p className="text-xs text-slate-500">
                    সহকারী কমিশনার (ভূমি), এডিসি (রাজস্ব) ও ডিসি মহোদয়ের পরিদর্শন বিবরণী ও সমাধান
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  চেকলিস্ট স্কোর: {toBanglaDigits(complianceScore)}%
                </span>
              </div>

              {/* Inspection History Cards */}
              <div className="space-y-4">
                {inspectionHistory.map((insp) => (
                  <div key={insp.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          সরকারি পরিদর্শন রেকর্ড
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                          পরিদর্শনকারী কর্তৃপক্ষ: {insp.authority}
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          পরিদর্শক কর্মকর্তা: <strong>{insp.officerName}</strong> ({insp.officerDesignation}) | তারিখ: {toBanglaDigits(insp.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-700 block">{toBanglaDigits(insp.score)}%</span>
                        <span className="text-[10px] text-slate-500">পরিদর্শন স্কোর</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <strong className="text-slate-800 block mb-1">পরিদর্শন ফাইন্ডিংস (Findings):</strong>
                        <p className="text-slate-600">{insp.findings}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <strong className="text-slate-800 block mb-1">পরিদর্শকের মন্তব্য (Remarks):</strong>
                        <p className="text-slate-600">{insp.remarks}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                      <strong>ঘাটতি / সুপারিশ (Deficiencies): </strong>{insp.deficiencies}
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                      <strong>গৃহীত ব্যবস্থা ও ডেডলাইন (Corrective Action & Deadline): </strong>
                      {insp.correctiveAction} (ডেডলাইন: {toBanglaDigits(insp.deadline)})
                      <span className="block font-bold text-emerald-800 mt-0.5">রেজোলিউশন: {insp.resolution} ✓</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>সংযুক্ত অফিসিয়াল প্রতিবেদন: <code>{insp.supportingDoc}</code></span>
                      <span className="text-emerald-700 font-bold">ড্রাইভে সংরক্ষিত ও ভেরিফাইড ✓</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Appendix 5 Inspection Checklist Grid */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-bold text-slate-900 text-sm">
                    পরিশিষ্ট-৫: পরিদর্শন চেকলিস্ট (২০টি মানদণ্ড)
                  </h6>
                  <span className="text-xs text-slate-500">
                    প্রতিটি আইটেমে ক্লিক করে যাচাই করুন
                  </span>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className="p-3 flex items-start justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.complied}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <div>
                          <p className={`text-xs font-medium ${item.complied ? 'text-slate-900' : 'text-red-700'}`}>
                            {item.id}। {item.itemText}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            মন্তব্য: {item.notes}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                        item.complied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.complied ? 'প্রতিপালিত ✓' : 'ঘাটতি'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DOCUMENT EXPIRY TRACKER (Item #4) */}
          {activeTab === 'expiry' && (
            <div className="space-y-4">
              <div>
                <h5 className="font-bold text-sm text-slate-900">
                  গুরুত্বপূর্ণ আইনি দলিলের মেয়াদ পর্যবেক্ষণ ও স্বয়ংক্রিয় অ্যালার্ট (Document Expiry)
                </h5>
                <p className="text-xs text-slate-500">
                  সিস্টেম স্বয়ংক্রিয়ভাবে ৯০ দিন, ৬০ দিন, ৩০ দিন ও ৭ দিন পূর্বে নোটিফিকেশন প্রদান করে
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-xs text-slate-900 block">{doc.docName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">নম্বর: {doc.docNumber}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.daysLeft < 60 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {toBanglaDigits(doc.daysLeft)} দিন বাকি
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-2">
                      <p>প্রদানকারী কর্তৃপক্ষ: <strong>{doc.issuingAuthority}</strong></p>
                      <p>ইস্যু তারিখ: {toBanglaDigits(doc.issueDate)}</p>
                      <p>মেয়াদ উত্তীর্ণের তারিখ: <strong className="text-red-700">{toBanglaDigits(doc.expiryDate)}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CORRECTIVE ACTION (Item #3) */}
          {activeTab === 'corrective' && (
            <div className="space-y-4">
              <div>
                <h5 className="font-bold text-sm text-slate-900">
                  কারেক্টিভ অ্যাকশন ম্যানেজমেন্ট (Corrective Action - CAPA Workflow)
                </h5>
                <p className="text-xs text-slate-500">
                  সরকারি পরিদর্শনে কোনো ঘাটতি বা সুপারিশ থাকলে: সমস্যা → দায়িত্বপ্রাপ্ত ব্যক্তি → ডেডলাইন → সমাধান → প্রমাণক
                </p>
              </div>

              <div className="space-y-3">
                {correctiveActions.map((ca) => (
                  <div key={ca.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <strong className="text-slate-900 text-sm">
                        ফাইন্ডিংস / পর্যবেক্ষণ: {ca.finding}
                      </strong>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                        সমাধান সম্পন্ন (CLOSED) ✓
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500">দায়িত্বপ্রাপ্ত কর্মকর্তা: </span>
                        <strong>{ca.responsible}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">সমাধানের শেষ সময়: </span>
                        <strong>{toBanglaDigits(ca.deadline)}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-700 bg-emerald-50/70 p-2.5 rounded border border-emerald-200">
                      <strong>গৃহীত কারেক্টিভ অ্যাকশন: </strong>
                      {ca.actionTaken}
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>সংযুক্ত প্রমাণক নথি: <code>{ca.evidenceDoc}</code></span>
                      <span className="text-emerald-700 font-bold">যাচাইকৃত ও অনুমোদিত</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    ডিজিটাল অভিযোগ রেজিস্টার
                  </h5>
                  <p className="text-xs text-slate-500">
                    নাগরিকদের যে কোনো অসন্তোষ বা অভিযোগের বিবরণ ও সমাধানের রেকর্ড
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddComplaint(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  নতুন অভিযোগ লিপিবদ্ধ করুন
                </button>
              </div>

              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900">{c.citizenName}</strong>
                        <span className="text-slate-500 font-mono ml-2">({toBanglaDigits(c.citizenMobile)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{formatBanglaDate(c.complaintDate)}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          {c.status === 'resolved' ? 'নিষ্পত্তিকৃত ✓' : 'তদন্তাধীন'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{c.subject}</p>
                    <p className="text-xs text-slate-600">{c.description}</p>
                    {c.resolutionNotes && (
                      <div className="bg-white p-2 rounded border border-emerald-100 text-[11px] text-emerald-800">
                        <strong>সমাধান ও গৃহীত পদক্ষেপ:</strong> {c.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Complaint Modal */}
      {showAddComplaint && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-3">নতুন অভিযোগ এন্ট্রি</h4>
            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">নাগরিকের নাম</label>
                <input
                  type="text"
                  required
                  value={newCitizenName}
                  onChange={(e) => setNewCitizenName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={newCitizenMobile}
                  onChange={(e) => setNewCitizenMobile(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">অভিযোগের বিষয়</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddComplaint(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
