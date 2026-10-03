'use client';

import React, { useState } from 'react';
import { StaffMember, BusinessSettings, ReceiptItem } from '@/types';
import { toBanglaDigits, formatBanglaDate } from '@/lib/banglaConverter';
import { initialStaff } from '@/lib/mockData';
import { Printer, X, Users, UserPlus, DollarSign, Award, ShieldCheck, Check } from 'lucide-react';

interface StaffManagerModalProps {
  settings: BusinessSettings;
  receipts: ReceiptItem[];
  onClose: () => void;
}

export const StaffManagerModal: React.FC<StaffManagerModalProps> = ({
  settings,
  receipts,
  onClose,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(initialStaff[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form
  const [name, setName] = useState('');
  const [role, setRole] = useState<'operator' | 'manager'>('operator');
  const [mobile, setMobile] = useState('');
  const [nid, setNid] = useState('');

  // Count applications processed by selected staff
  const staffReceipts = receipts.filter(
    (r) => r.createdBy.includes(selectedStaff?.name || '') && r.status === 'valid'
  );
  const totalHandled = staffReceipts.length;
  const totalRevenueHandled = staffReceipts.reduce((sum, r) => sum + r.totalAmount, 0);

  // Salary calculations
  const baseSalary = 12000;
  const commissionPerApp = 10;
  const totalCommission = totalHandled * commissionPerApp;
  const grossPay = baseSalary + totalCommission;

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    const newStaff: StaffMember = {
      id: 'stf_' + Date.now(),
      name,
      role,
      mobile,
      nid,
      joinedDate: new Date().toISOString().substring(0, 10),
      photoUrl: '',
      nidDocUrl: '',
      status: 'active',
    };
    setStaffList([...staffList, newStaff]);
    setSelectedStaff(newStaff);
    setShowAddModal(false);
    setName('');
    setMobile('');
    setNid('');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              স্টাফ
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                কম্পিউটার কর্মী ও বেতন/কমিশন রেজিস্টার
              </h3>
              <p className="text-xs text-slate-300">
                ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫ (অনুচ্ছেদ ১১.৬.২ ও ১১.৬.৬ অনুযায়ী)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              নতুন কর্মী যোগ করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50">
          
          {/* Staff List Sidebar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              নিযুক্ত কর্মীদের তালিকা ({toBanglaDigits(staffList.length)} জন)
            </h4>
            <div className="space-y-2">
              {staffList.map((stf) => (
                <div
                  key={stf.id}
                  onClick={() => setSelectedStaff(stf)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStaff?.id === stf.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-xs text-slate-900 block">{stf.name}</strong>
                      <span className="text-[10px] text-slate-500 capitalize">{stf.role}</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                      সক্রিয় ✓
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">মোবাইল: {toBanglaDigits(stf.mobile)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Staff Profile & Salary Slip */}
          <div className="md:col-span-2 space-y-4">
            {selectedStaff && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{selectedStaff.name}</h3>
                    <p className="text-xs text-slate-500">
                      যোগদানের তারিখ: {formatBanglaDate(selectedStaff.joinedDate)} | NID: <span className="font-mono">{toBanglaDigits(selectedStaff.nid)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="no-print px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    বেতন স্লিপ প্রিন্ট
                  </button>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">প্রসেসকৃত মোট আবেদন:</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {toBanglaDigits(totalHandled)} টি
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">মোট সংগৃহীত ফি:</span>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">
                      ৳{toBanglaDigits(totalRevenueHandled)}/-
                    </p>
                  </div>
                </div>

                {/* Salary breakdown card */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b">
                    চলতি মাসের পারিশ্রমিক হিসাব (অনুচ্ছেদ ১১.৬.৬)
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>মূল মজুরি / বেতন (Basic):</span>
                      <strong className="text-slate-900">৳{toBanglaDigits(baseSalary)}/-</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>আবেদন প্রতি কমিশন ({toBanglaDigits(totalHandled)} টি × ৳১০):</span>
                      <strong>+ ৳{toBanglaDigits(totalCommission)}/-</strong>
                    </div>
                    <div className="border-t border-dashed pt-2 flex justify-between items-center text-sm font-extrabold text-slate-900">
                      <span>সর্বমোট প্রদেয় বেতন:</span>
                      <span className="text-base text-emerald-800">৳{toBanglaDigits(grossPay)}/-</span>
                    </div>
                  </div>
                </div>

                {/* Guideline Compliance Check */}
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    আইনি কমপ্লায়েন্স স্ট্যাটাস:
                  </div>
                  <p>• এনআইডি ও বায়োডাটার সফট কপি গুগল ড্রাইভে সংরক্ষিত রয়েছে (অনুচ্ছেদ ১১.৬.২)।</p>
                  <p>• নাগরিকবান্ধব আচরণ ও গোপনীয়তা রক্ষার প্রশিক্ষণ সম্পন্ন হয়েছে (অনুচ্ছেদ ১১.৬.৩)।</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-3">নতুন কম্পিউটার কর্মী নিবন্ধন</h4>
            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">কর্মীর নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: কম্পিউটার অপারেটর ৩"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">পদবি</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="operator">কম্পিউটার অপারেটর</option>
                  <option value="manager">সহকারী ম্যানেজার</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ০১৭৭০০০..."
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">এনআইডি নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: ১৯৯২..."
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm"
                >
                  নিবন্ধন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
