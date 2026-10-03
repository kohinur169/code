'use client';

import React from 'react';
import { BusinessSettings, ServiceItem } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { Printer, X, ShieldAlert, Award } from 'lucide-react';

interface OfficialFeeChartModalProps {
  settings: BusinessSettings;
  services: ServiceItem[];
  onClose: () => void;
}

export const OfficialFeeChartModal: React.FC<OfficialFeeChartModalProps> = ({
  settings,
  services,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              চার্ট
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                দেয়ালে টানানোর সরকারি ফি চার্ট (পরিশিষ্ট-৭)
              </h3>
              <p className="text-xs text-slate-300">
                নির্দেশিকার অনুচ্ছেদ ১১.৬.৭ অনুযায়ী সেন্টারের ভেতরে প্রকাশ্যে ঝুলিয়ে রাখার বাধ্যতামূলক তালিকা
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              চার্ট প্রিন্ট করুন (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Wall Hanging Poster */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            className="bg-white border-4 border-emerald-800 p-8 shadow-xl text-slate-900 w-full max-w-[8.27in] min-h-[11in] flex flex-col justify-between"
            style={{ fontFamily: `'SolaimanLipi', 'Kalpurush', sans-serif` }}
          >
            <div>
              {/* Header */}
              <div className="text-center border-b-2 border-emerald-800 pb-3">
                <div className="inline-block p-1 bg-emerald-50 rounded-full border border-emerald-200 mb-1">
                  <span className="text-[10px] font-bold text-emerald-900 px-3 py-0.5">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  {settings.businessName} • {settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র
                </h1>
                <p className="text-xs font-bold text-emerald-800 mt-0.5">
                  অনুমতিপত্র নম্বর: {toBanglaDigits(settings.licenseNo)} | {settings.addressDetails}
                </p>
                <div className="mt-2 inline-block bg-emerald-800 text-white px-6 py-1 rounded-full text-xs font-black tracking-wide">
                  পরিশিষ্ট-৭: নাগরিক ভূমিসেবা ফি-এর সরকারি তালিকা
                </div>
              </div>

              {/* Notice */}
              <div className="my-3 p-2 bg-amber-50 border border-amber-200 rounded text-center text-[11px] font-semibold text-amber-900">
                ⚠️ সরকার নির্ধারিত ফি-এর অতিরিক্ত অর্থ প্রদান করবেন না। অতিরিক্ত অর্থ দাবি করলে অবিলম্বে ভূমি মন্ত্রণালয়ের হটলাইন <strong>১৬১২২</strong> নম্বরে জানান।
              </div>

              {/* Table */}
              <table className="w-full text-xs border-collapse border border-slate-900 mt-2">
                <thead>
                  <tr className="bg-emerald-800 text-white text-center font-bold">
                    <th className="border border-slate-900 px-2 py-1.5 w-10">ক্রঃ</th>
                    <th className="border border-slate-900 px-3 py-1.5 text-left">ভূমিসেবায় ধরন</th>
                    <th className="border border-slate-900 px-2 py-1.5 w-24">ইউনিয়ন ও উপজেলা</th>
                    <th className="border border-slate-900 px-2 py-1.5 w-24">পৌর এলাকা</th>
                    <th className="border border-slate-900 px-2 py-1.5 w-28">সিটি কর্পোরেশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {services.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-900 px-2 py-1 text-center font-bold">
                        {toBanglaDigits(idx + 1)}
                      </td>
                      <td className="border border-slate-900 px-3 py-1 font-semibold text-slate-800">
                        {s.name}
                      </td>
                      <td className="border border-slate-900 px-2 py-1 text-center font-bold text-slate-900">
                        ৳{toBanglaDigits(s.feeUnion)}/-
                      </td>
                      <td className="border border-slate-900 px-2 py-1 text-center font-bold text-slate-900">
                        ৳{toBanglaDigits(s.feeMunicipality)}/-
                      </td>
                      <td className="border border-slate-900 px-2 py-1 text-center font-bold text-slate-900">
                        ৳{toBanglaDigits(s.feeCityCorp)}/-
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 text-[10px] text-slate-600 space-y-0.5">
                <p>• স্ক্যানিং আবেদনের ক্ষেত্রে ২০ পৃষ্ঠার অধিক হলে প্রতি অতিরিক্ত পৃষ্ঠার জন্য ৩ টাকা যুক্ত হবে।</p>
                <p>• দ্বিতীয় বা অধিক কপি প্রিন্টের জন্য প্রতি কপি ২০ টাকা সহায়তাকারী কর্তৃক আদায়যোগ্য হবে।</p>
                <p>• সরকারি ফি (যেমন নামজারি ১,১৭০/-) সহায়তাকারী ফি-এর অতিরিক্ত হিসেবে সরকারি কোষাগারে সরাসরি প্রদেয়।</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-emerald-800 pt-3 flex items-center justify-between text-xs mt-6">
              <div>
                <p className="font-bold text-slate-900">কেন্দ্র ইনচার্জ:</p>
                <p>{settings.inchargeName}</p>
                <p className="font-mono text-slate-600">মোবাইল: {toBanglaDigits(settings.mobile)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-800">সহায়তা হটলাইন: ১৬১২২</p>
                <p className="text-[11px] text-slate-500">ভূমি মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
