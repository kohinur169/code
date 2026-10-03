'use client';

import React from 'react';
import { BusinessSettings, ReceiptItem } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { Printer, X, Shield, FileCheck2 } from 'lucide-react';

interface ConsentSlipModalProps {
  receipt?: ReceiptItem;
  settings: BusinessSettings;
  onClose: () => void;
}

export const ConsentSlipModal: React.FC<ConsentSlipModalProps> = ({
  receipt,
  settings,
  onClose,
}) => {
  const activeReceipt: Partial<ReceiptItem> & { receiptNo: string; customerName: string; customerMobile: string; serviceName: string; totalAmount: number; createdAt: string } = receipt || {
    id: 'blank',
    receiptNo: 'LSFC-BLANK-XXXXXX',
    customerName: 'নাগরিকের নাম (খসড়া)',
    customerMobile: '০১XXXXXXXXX',
    serviceName: 'ই-নামজারি ও রেকর্ড সংশোধন আবেদন',
    totalAmount: 250,
    applicationTrackingNo: 'প্রক্রিয়াধীন',
    paymentMethod: 'cash',
    status: 'valid',
    createdAt: new Date().toISOString(),
    verificationToken: 'sample-token',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              সম্মতি
            </div>
            <div>
              <h3 className="font-bold text-base">নাগরিক সম্মতিপত্র ও প্রতিনিধি মনোনয়ন ফরম</h3>
              <p className="text-xs text-slate-300">
                ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫ (অনুচ্ছেদ ১১.৬.১১ ও ১৩.৬ অনুযায়ী)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Consent Body */}
        <div className="p-8 text-slate-800 space-y-4 text-xs font-sans leading-relaxed">
          
          <div className="text-center border-b border-slate-300 pb-3">
            <p className="text-[11px] font-bold text-emerald-800">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত</p>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
              {settings.businessName} • {settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র
            </h2>
            <p className="text-[11px] text-slate-600">
              অনুমতি পত্র নং-{toBanglaDigits(settings.licenseNo)} | {settings.addressDetails}
            </p>
            <h1 className="text-sm font-black text-slate-900 border-2 border-slate-800 inline-block px-4 py-1 rounded-md mt-2">
              নাগরিক সম্মতি ও প্রতিনিধিত্বের অঙ্গীকারনামা
            </h1>
          </div>

          <div className="space-y-2 text-justify">
            <p>
              আমি নিম্নস্বাক্ষরকারী সেবা গ্রহীতা <strong>{activeReceipt.customerName}</strong>, মোবাইল নং: <strong className="font-mono">{toBanglaDigits(activeReceipt.customerMobile)}</strong>, এতদ্বারা সচেতনভাবে সম্মতি জ্ঞাপন করছি যে, আমার পক্ষে গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের নির্ধারিত ভূমিসেবা <strong>&quot;{activeReceipt.serviceName}&quot;</strong> সংক্রান্ত আবেদনপত্র অনলাইনে দাখিল ও নিষ্পত্তিতে সহায়তার জন্য অত্র অনুমোদিত <strong>&quot;{settings.businessName}&quot;</strong> ভূমিসেবা সহায়তা কেন্দ্রকে আমার প্রতিনিধি হিসেবে দায়িত্ব প্রদান করলাম।
            </p>
            
            <p>
              আমার প্রদত্ত সকল তথ্যাদি ও দাখিলকৃত কাগজপত্র সম্পূর্ণ সঠিক। সরকারি নির্দেশিকার অনুচ্ছেদ ১৩.৬ অনুযায়ী, উক্ত সেবার অগ্রগতি, নোটিশ বা ফলাফল আমাকে যথাসময়ে অবহিত করা হবে।
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">রিসিট নম্বর: </span>
              <strong className="font-mono text-slate-900">{activeReceipt.receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">তারিখ: </span>
              <span className="text-slate-800">{toBanglaDigits(activeReceipt.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-500">আবেদন ট্র্যাকিং নং: </span>
              <span className="font-mono font-bold text-slate-900">{activeReceipt.applicationTrackingNo || 'প্রক্রিয়াধীন'}</span>
            </div>
            <div>
              <span className="text-slate-500">পরিশোধিত সহায়তা ফি: </span>
              <strong className="text-emerald-800">৳{toBanglaDigits(activeReceipt.totalAmount)}/-</strong>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-tight">
              <strong>গোপনীয়তা ও ডাটা নিরাপত্তা অঙ্গীকার:</strong> কেন্দ্র কর্তৃপক্ষ গ্রাহকের ব্যক্তিগত পরিচয়পত্র ও জমির দলিল শুধুমাত্র উক্ত সরকারি আবেদন প্রক্রিয়াকরণে ব্যবহার করবে এবং কোনো অবস্থাতেই তৃতীয় পক্ষের নিকট হস্তান্তর করবে না।
            </p>
          </div>

          <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                সেবা গ্রহীতার স্বাক্ষর
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{activeReceipt.customerName}</p>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                কেন্দ্র ইনচার্জ / সহায়তাকারীর স্বাক্ষর
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {settings.inchargeName}, {settings.businessName}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
