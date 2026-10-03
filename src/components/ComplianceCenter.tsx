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

export const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'expiry' | 'corrective' | 'complaints'>('overview');
  const [checklist, setChecklist] = useState<InspectionChecklist[]>(getInspectionChecklist());
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(getComplaints());

  // Document Expiry Tracker (Feature #4)
  const [documents] = useState<DocumentExpiryItem[]>([
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
      responsible: 'মোঃ মাহমুদুল হাসান (ইনচার্জ)',
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
    addComplaint({
      complaintDate: new Date().toISOString().substring(0, 10),
      citizenName: newCitizenName,
      citizenMobile: newCitizenMobile,
      subject: newSubject,
      description: newDesc,
    });
    setComplaints(getComplaints());
    setShowAddComplaint(false);
    setNewCitizenName('');
    setNewCitizenMobile('');
    setNewSubject('');
    setNewDesc('');
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
              ১০টি মূল আইনি শর্তের মধ্যে {toBanglaDigits(compliedCount)}টি অর্জিত
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              কারেক্টিভ অ্যাকশন
            </span>
            <h4 className="text-xl font-black text-purple-700 mt-1">
              ১০০% সমাধান
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ২টি অডিট ফাইন্ডিংস শতভাগ ক্লোজড
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ডিজিটাল অভিযোগ বক্স
            </span>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              {toBanglaDigits(complaints.length)} টি নথিভুক্ত
            </h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              চাবি এসিল্যান্ড মহোদয়ের নিকট
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 px-6 pt-3 bg-slate-50 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            কমপ্লায়েন্স সামারি
          </button>
          <button
            onClick={() => setActiveTab('inspection')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'inspection'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            সরকারি পরিদর্শন চেকলিস্ট (পরিশিষ্ট-৫)
          </button>
          <button
            onClick={() => setActiveTab('expiry')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'expiry'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ডকুমেন্ট মেয়াদ ট্র্যাকার (Expiry 90/60/30)
          </button>
          <button
            onClick={() => setActiveTab('corrective')}
            className={`pb-3 px-3.5 border-b-2 transition-all ${
              activeTab === 'corrective'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            কারেক্টিভ অ্যাকশন (CAPA)
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
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h5 className="font-bold text-sm text-emerald-950 mb-1">
                  ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫ - ডিজিটাল অডিট প্রস্তুতি
                </h5>
                <p className="leading-relaxed">
                  অত্র সফটওয়্যারটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ভূমি মন্ত্রণালয়ের সর্বশেষ নির্দেশিকা অনুযায়ী ডিজাইনকৃত। কেন্দ্রের প্রতিটি রিসিটের অডিট ট্রেইল, রিসিট নম্বর ও কিউআর কোড সরাসরি অনলাইনে সংরক্ষণ করা হয়।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h6 className="font-bold text-slate-900">নির্দেশিকার প্রধান প্রধান ধারা:</h6>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>অনুচ্ছেদ ৮.১:</strong> অনুমতিপত্রের মেয়াদ ২ বছর বলবৎ থাকবে।</li>
                    <li><strong>অনুচ্ছেদ ৮.৪:</strong> মেয়াদ উত্তীর্ণের ৩০ দিন পূর্বে নবায়ন আবেদন দাখিল করতে হবে।</li>
                    <li><strong>অনুচ্ছেদ ১০.২:</strong> নগদ অর্থ গ্রহণ করা হলে কম্পিউটার জেনারেটেড রিসিট দিতে হবে।</li>
                    <li><strong>অনুচ্ছেদ ১১.৬.১৪:</strong> সেবার তারিখ, বিবরণ ও অর্থ সম্বলিত রেজিস্টার সংরক্ষণ বাধ্যতামূলক।</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h6 className="font-bold text-slate-900">ডেটা সুরক্ষা ও গোপনীয়তা:</h6>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>গ্রাহকের এনআইডি ও ফোন নম্বর সাধারণ কর্মীদের জন্য মাস্কড থাকবে।</li>
                    <li>কোনো রিসিট সিস্টেমে ডিলিট করা নিষিদ্ধ; ভুল হলে &quot;Void&quot; হিসেবে চিহ্নিত থাকে।</li>
                    <li>প্রতিটি ট্রানজ্যাকশন স্বয়ংক্রিয়ভাবে অডিট লগে স্থান ও সময়সহ লিপিবদ্ধ হয়।</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inspection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    সহকারী কমিশনার (ভূমি) / ডিসি মহোদয়ের পরিদর্শন চেকলিস্ট
                  </h5>
                  <p className="text-xs text-slate-500">
                    পরিশিষ্ট-৫ পরিদর্শন ফরম অনুযায়ী আইনি শর্তাদি পূরণ যাচাই করুন
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  {toBanglaDigits(compliedCount)} / {toBanglaDigits(checklist.length)} টি শর্ত প্রতিপালিত
                </span>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
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
                      {item.complied ? 'প্রতিপালিত ✓' : 'অপূর্ণ ✕'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT EXPIRY TRACKER (Feature #4) */}
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

          {/* TAB 4: CORRECTIVE ACTION (Feature #3) */}
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
                <label className="block font-semibold mb-1">নাগরিকের নাম</label>
                <input
                  type="text"
                  required
                  value={newCitizenName}
                  onChange={(e) => setNewCitizenName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={newCitizenMobile}
                  onChange={(e) => setNewCitizenMobile(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">অভিযোগের বিষয়</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg"
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
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm"
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
