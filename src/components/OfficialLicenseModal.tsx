'use client';

import React from 'react';
import { BusinessSettings } from '@/types';
import { toBanglaDigits, formatBanglaDate } from '@/lib/banglaConverter';
import { Printer, X, Award, ShieldCheck } from 'lucide-react';

interface OfficialLicenseModalProps {
  settings: BusinessSettings;
  onClose: () => void;
}

export const OfficialLicenseModal: React.FC<OfficialLicenseModalProps> = ({
  settings,
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
              সনদ
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                অফিসিয়াল অনুমতিপত্র সনদ (পরিশिष्ट-২ / ফরম-২)
              </h3>
              <p className="text-xs text-slate-300">
                নির্দেশিকার অনুচ্ছেদ ১১.৬.৭ অনুযায়ী সেন্টারের দেয়ালে টানিয়ে রাখার ফ্রেম সনদ
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
              সনদ প্রিন্ট করুন (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official License Poster */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            className="bg-white border-8 border-double border-emerald-900 p-10 shadow-2xl text-slate-900 w-full max-w-[8.27in] min-h-[11in] flex flex-col justify-between relative"
            style={{ fontFamily: `'SolaimanLipi', 'Kalpurush', sans-serif` }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <Award className="w-96 h-96 text-emerald-950" />
            </div>

            <div>
              <div className="text-right text-[11px] text-slate-500 font-bold">
                ফরম-২ / পরিশিষ্ট-২
              </div>

              {/* Header */}
              <div className="text-center mt-2">
                <p className="text-sm font-bold text-slate-900">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                <h2 className="text-base font-extrabold text-slate-900">
                  জেলা প্রশাসকের কার্যালয়, {settings.district}
                </h2>
                <div className="w-24 h-0.5 bg-emerald-800 mx-auto my-2"></div>
                <h1 className="text-lg font-black text-emerald-900 mt-2">
                  ভূমিসেবায় সহায়তা প্রদানসহ এলএসএফসি স্থাপনের জন্য অনুমতিপত্র
                </h1>
              </div>

              {/* Meta bar */}
              <div className="flex justify-between items-center text-xs mt-6 border-b border-slate-300 pb-2">
                <div>
                  <strong>অনুমতিপত্র নং: </strong>
                  <span className="font-mono font-bold text-slate-900">{toBanglaDigits(settings.licenseNo)}</span>
                </div>
                <div>
                  <strong>তারিখ: </strong>
                  <span>{formatBanglaDate(settings.licenseIssueDate)}</span>
                </div>
              </div>

              {/* License text matching Guideline Page 16 */}
              <div className="mt-4 text-xs space-y-3 leading-relaxed text-justify">
                <p>
                  <strong>নাম: </strong>{settings.inchargeName}<br />
                  <strong>ঠিকানা: </strong>{settings.addressDetails}
                </p>

                <p>
                  এর &quot;ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫&quot; এর অনুচ্ছেদ নং ৫ এ বর্ণিত সকল ভূমিসেবায় সহায়তা প্রদানের জন্য নিম্নবর্ণিত শর্ত সাপেক্ষে নিম্নে উল্লিখিত এলএসএফসি&apos;র অনুকূলে অনুমতিপত্র জারি করা হলো:
                </p>

                <table className="w-full text-xs border border-slate-900 border-collapse my-3">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-900 p-2 text-center w-1/2">এলএসএফসি&apos;র নাম</th>
                      <th className="border border-slate-900 p-2 text-center w-1/2">অবস্থান</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-900 p-3 text-center font-bold text-sm">
                        {settings.businessName}<br />
                        <span className="text-xs font-semibold text-emerald-800">
                          {settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র
                        </span>
                      </td>
                      <td className="border border-slate-900 p-3 text-xs leading-normal">
                        জেলা: <strong>{settings.district}</strong><br />
                        উপজেলা/সার্কেল: <strong>{settings.upazila}</strong><br />
                        অবস্থান: {settings.addressDetails}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="bg-emerald-50 p-2 rounded border border-emerald-200 text-emerald-950 font-medium">
                  এ অনুমতিপত্রের মেয়াদ <strong>{formatBanglaDate(settings.licenseIssueDate)}</strong> হতে <strong>{formatBanglaDate(settings.licenseExpiryDate)}</strong> খ্রি. তারিখ পর্যন্ত বহাল থাকবে।
                </p>

                <div className="space-y-1 text-[11px] text-slate-700 mt-2">
                  <strong>শর্তাবলি:</strong>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>নির্দেশিকার সংশ্লিষ্ট সকল নির্দেশনা প্রয়োগযোগ্য এবং প্রতিপালনীয় হবে।</li>
                    <li>এলএসএফসিতে অনুমতিপত্রের কপি প্রদর্শিত থাকবে এবং সংশ্লিষ্ট কর্মকর্তা দেখতে চাইলে তা দেখাতে হবে।</li>
                    <li>কেন্দ্রের অভ্যন্তরীণ পরিবেশ পরিচ্ছন্নতা ও তথ্যের পূর্ণ নিরাপত্তা বজায় রাখতে হবে।</li>
                    <li>যে এলাকার জন্য অনুমতি দেওয়া হয়েছে তা ভিন্ন অন্য কোনো কেন্দ্রের জন্য প্রযোজ্য হবে না।</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer with Seal & Signature */}
            <div className="border-t border-slate-300 pt-6 flex items-end justify-between text-xs mt-6">
              <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[9px] text-slate-400 text-center">
                সরকারি সিলমোহর
              </div>

              <div className="text-center space-y-0.5">
                <div className="h-10"></div>
                <p className="font-bold text-slate-900">জেলা প্রশাসক / অতিরিক্ত জেলা প্রশাসক (রাজস্ব)</p>
                <p className="text-[11px] text-slate-600">{settings.district}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
