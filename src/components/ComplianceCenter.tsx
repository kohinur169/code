'use client';

import React, { useState } from 'react';
import { BusinessSettings, InspectionChecklist, ComplaintRecord } from '@/types';
import { toBanglaDigits, formatBanglaDate } from '@/lib/banglaConverter';
import { getInspectionChecklist, saveInspectionChecklist, getComplaints, addComplaint } from '@/lib/storage';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, MessageSquare, Plus, FileCheck2, UserCheck } from 'lucide-react';

interface ComplianceCenterProps {
  settings: BusinessSettings;
}

export const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'complaints'>('overview');
  const [checklist, setChecklist] = useState<InspectionChecklist[]>(getInspectionChecklist());
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(getComplaints());

  // New complaint form state
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [newCitizenName, setNewCitizenName] = useState('');
  const [newCitizenMobile, setNewCitizenMobile] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Calculate license validity
  const expiry = new Date(settings.licenseExpiryDate || '2027-02-14');
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
    <div className="space-y-6">
      
      {/* Top Banner - License Expiry & Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* License Expiry Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              অনুমতিপত্রের বৈধতার মেয়াদ
            </span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">
              {toBanglaDigits(diffDays)} দিন বাকি
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              মেয়াদ উত্তীর্ণ: {formatBanglaDate(settings.licenseExpiryDate)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Audit Readiness Score */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              সরকারি পরিদর্শন প্রস্তুতি স্কোর
            </span>
            <h4 className="text-xl font-extrabold text-emerald-700 mt-1">
              {toBanglaDigits(complianceScore)}% প্রস্তুত
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ১০টি মূল আইনি মানদণ্ডের মধ্যে {toBanglaDigits(compliedCount)}টি অর্জিত
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Complaint Box Status */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ডিজিটাল অভিযোগ রেজিস্টার
            </span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">
              {toBanglaDigits(complaints.length)} টি নথিভুক্ত
            </h4>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              অভিযোগ বাক্সের চাবি এসিল্যান্ড মহোদয়ের নিকট
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            কমপ্লায়েন্স সামারি ও গাইডলাইন
          </button>
          <button
            onClick={() => setActiveTab('inspection')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'inspection'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            সরকারি পরিদর্শন চেকলিস্ট (পরিশিষ্ট-৫)
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'complaints'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            অভিযোগ রেজিস্টার (পরিশিষ্ট-৫/১১.৬.১৩)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h5 className="font-bold text-sm text-emerald-950 mb-1">
                  ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫ - আইনি বাধ্যবাধকতা
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
                    <li>কোনো রিসিট সিস্টেমে ডিলিট করা নিষিদ্ধ; ভুল হলে "Void" হিসেবে চিহ্নিত থাকে।</li>
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
                    সহকারী কমিশনার (ভূমি) / ডিসি মহোদয়ের পরিদর্শন প্রস্তুতি চেকলিস্ট
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
