'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReceiptItem, BusinessSettings } from '@/types';
import { getReceipts, getSettings } from '@/lib/storage';
import { toBanglaDigits, formatBanglaDate } from '@/lib/banglaConverter';
import { ShieldCheck, AlertOctagon, CheckCircle2, PhoneCall, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [receipt, setReceipt] = useState<ReceiptItem | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allReceipts = getReceipts();
      const currentSettings = getSettings();
      setSettings(currentSettings);

      if (token) {
        const found = allReceipts.find((r) => r.verificationToken === token);
        if (found) {
          setReceipt(found);
        }
      }
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-600 font-semibold">যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-emerald-800 text-white p-6 text-center relative">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-md mb-3">
            <ShieldCheck className="w-9 h-9 text-emerald-700" />
          </div>
          <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
          </p>
          <h1 className="text-lg font-black mt-1">
            ভূমিসেবা সহায়তা কেন্দ্র (LSFC)
          </h1>
          <p className="text-xs text-emerald-100 mt-0.5">
            নাগরিক রিসিট ডিজিটাল সত্যতা যাচাই পোর্টাল
          </p>
        </div>

        {/* Verification Body */}
        <div className="p-6">
          {receipt ? (
            <div className="space-y-4">
              
              {/* Status Banner */}
              {receipt.status === 'valid' ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-emerald-950 text-sm">
                      বৈধ অফিসিয়াল রিসিট (Verified Valid)
                    </h4>
                    <p className="text-xs text-emerald-700">
                      এই রিসিটটি অনুমোদিত সহায়তা কেন্দ্র কর্তৃক সঠিকভাবে প্রদানকৃত।
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-center space-x-3">
                  <AlertOctagon className="w-7 h-7 text-red-600 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-red-950 text-sm">
                      বাতিলকৃত রিসিট (Voided Receipt)
                    </h4>
                    <p className="text-xs text-red-700">
                      কারণ: {receipt.voidReason || 'প্রশাসনিক কারণে বাতিলকৃত'}
                    </p>
                  </div>
                </div>
              )}

              {/* Center Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">অনুমোদিত কেন্দ্র:</span>
                  <strong className="text-slate-900">{settings?.businessName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">অনুমতি পত্র নং:</span>
                  <span className="font-mono font-bold text-slate-800">{settings?.licenseNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">উপজেলা ও জেলা:</span>
                  <span className="text-slate-800">{settings?.upazila}, {settings?.district}</span>
                </div>
              </div>

              {/* Receipt Details (Strictly masking sensitive data) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200">
                  সেবা ও ফি বিবরণী
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">রিসিট নম্বর:</span>
                    <strong className="text-slate-900 font-mono">{receipt.receiptNo}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">প্রদানের তারিখ:</span>
                    <span className="text-slate-800">{toBanglaDigits(receipt.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">সেবার নাম:</span>
                    <strong className="text-emerald-800">{receipt.serviceName}</strong>
                  </div>
                  
                  {/* Masked citizen info */}
                  <div className="flex justify-between">
                    <span className="text-slate-500">সেবা গ্রহীতা:</span>
                    <span className="text-slate-800 font-medium">
                      {receipt.customerName.substring(0, 3)}*** {receipt.customerName.slice(-2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">মোবাইল (মাস্কড):</span>
                    <span className="text-slate-800 font-mono">
                      {receipt.customerMobile.substring(0, 3)}*****{receipt.customerMobile.slice(-2)}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900">গৃহীত সর্বমোট ফি:</span>
                    <strong className="text-base text-emerald-700 font-extrabold">
                      ৳{toBanglaDigits(receipt.totalAmount)}/-
                    </strong>
                  </div>
                </div>
              </div>

              {/* Citizen 5-Star Rating & Feedback (Clause 11.3.7) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center text-xs">
                <p className="font-bold text-slate-800">
                  সেবা গ্রহণ পরবর্তী নাগরিক মূল্যায়ন (Citizen Rating):
                </p>
                <div className="flex justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => alert(`ধন্যবাদ! আপনি ${toBanglaDigits(star)} তারকা রেটিং প্রদান করেছেন।`)}
                      className="text-amber-400 hover:scale-125 transition-transform text-lg"
                      title={`${toBanglaDigits(star)} তারকা`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  আপনার মূল্যবান মতামত কেন্দ্রের সেবার মান বৃদ্ধি এবং নিয়মিত পরিদর্শনে মূল্যায়িত হয়।
                </p>
              </div>

              {/* Security notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  নাগরিকের ব্যক্তিগত তথ্যের সুরক্ষার্থে পূর্ণাঙ্গ ফোন নম্বর ও জাতীয় পরিচয়পত্র গোপন রাখা হয়েছে। অতিরিক্ত অর্থ দাবি করা হলে অবিলম্বে ১৬১২২ হটলাইনে যোগাযোগ করুন।
                </p>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                কোনো বৈধ রিসিট পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                প্রদত্ত কিউআর টোকেনটি সঠিক নয় অথবা ডাটাবেজে সংরক্ষিত নেই।
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              এলএসএফসি মূল ড্যাশবোর্ডে ফিরুন
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
