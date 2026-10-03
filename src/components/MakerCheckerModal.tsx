'use client';

import React, { useState } from 'react';
import { BusinessSettings } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { addAuditLog } from '@/lib/storage';
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle, X } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  type: 'VOID' | 'REFUND' | 'EXPENSE' | 'ADJUSTMENT';
  title: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

interface MakerCheckerModalProps {
  settings: BusinessSettings;
  onClose: () => void;
}

export const MakerCheckerModal: React.FC<MakerCheckerModalProps> = ({
  settings,
  onClose,
}) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: 'apr_1',
      type: 'VOID',
      title: 'রিসিট #LSFC-TS-2026-000670 বাতিলকরণ অনুরোধ',
      amount: 250,
      requestedBy: 'কম্পিউটার অপারেটর ১',
      requestedAt: '2026-10-02 11:20',
      reason: 'গ্রাহক ই-নামজারি আবেদনের পরিবর্তে পর্চা প্রাপ্তির সেবা নিতে ইচ্ছুক।',
      status: 'pending',
    },
    {
      id: 'apr_2',
      type: 'REFUND',
      title: 'গ্রাহক রিফান্ড অনুমোদন',
      amount: 100,
      requestedBy: 'কম্পিউটার অপারেটর ২',
      requestedAt: '2026-10-01 16:45',
      reason: 'ভুলবশত বাড়তি পাতা স্ক্যান ফি যুক্ত করা হয়েছিল।',
      status: 'approved',
      approvedBy: settings.inchargeName,
    },
  ]);

  const handleApprove = (id: string) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: 'approved' as const, approvedBy: settings.inchargeName } : r
    );
    setRequests(updated);
    addAuditLog({
      userId: 'user_owner',
      userName: settings.inchargeName,
      userRole: 'owner',
      action: 'MAKER_CHECKER_APPROVAL',
      details: `মেকার-চেকার অনুমোদন: অনুরোধ #${id} সফলভাবে অনুমোদন করা হয়েছে।`,
      ipAddress: '103.145.118.24',
      device: 'Desktop Chrome / Windows 11',
    });
    alert('অনুরোধটি সফলভাবে অনুমোদিত হয়েছে!');
  };

  const handleReject = (id: string) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: 'rejected' as const } : r
    );
    setRequests(updated);
    addAuditLog({
      userId: 'user_owner',
      userName: settings.inchargeName,
      userRole: 'owner',
      action: 'MAKER_CHECKER_REJECT',
      details: `মেকার-চেকার প্রত্যাখ্যান: অনুরোধ #${id} বাতিল করা হয়েছে।`,
      ipAddress: '103.145.118.24',
      device: 'Desktop Chrome / Windows 11',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              M-C
            </div>
            <div>
              <h3 className="font-bold text-base">মেকার–চেকার অনুমোদন কিউ (Maker-Checker Workflow)</h3>
              <p className="text-xs text-slate-300">
                রিসিট বাতিল, বড় অঙ্কের খরচ ও রিফান্ডের দ্বৈত অনুমোদন নিয়ন্ত্রণ (আইটেম #৬)
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

        {/* List of Approval Requests */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                    req.type === 'VOID' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {req.type}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{req.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    আবেদনকারী: <strong>{req.requestedBy}</strong> | সময়: {toBanglaDigits(req.requestedAt)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    ৳{toBanglaDigits(req.amount)}/-
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'pending' ? 'অনুমোদনের অপেক্ষায়' : req.status === 'approved' ? 'অনুমোদিত ✓' : 'প্রত্যাখ্যাত'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700">
                <strong>কারণ / যুক্তি: </strong>{req.reason}
              </div>

              {req.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold border border-red-200 flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    প্রত্যাখ্যান করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    মালিক হিসেবে অনুমোদন দিন
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
