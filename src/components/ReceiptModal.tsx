'use client';

import React, { useState, useRef } from 'react';
import { ReceiptItem, BusinessSettings } from '@/types';
import { toBanglaDigits, numberToBanglaWords, formatBanglaDate } from '@/lib/banglaConverter';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, ShieldAlert, CheckCircle2, Download, AlertTriangle, CloudCheck, Eye } from 'lucide-react';
import { voidReceipt, incrementReceiptPrintCount } from '@/lib/storage';

interface ReceiptModalProps {
  receipt: ReceiptItem | null;
  settings: BusinessSettings;
  onClose: () => void;
  onReceiptUpdated: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  settings,
  onClose,
  onReceiptUpdated,
}) => {
  const [printMode, setPrintMode] = useState<'checkbook' | 'thermal'>('checkbook');
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [showCounterfoil, setShowCounterfoil] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const handlePrint = () => {
    incrementReceiptPrintCount(receipt.id);
    window.print();
    onReceiptUpdated();
  };

  const handleVoid = () => {
    if (!voidReason.trim()) {
      alert('অনুগ্রহ করে রিসিট বাতিলের সুনির্দিষ্ট কারণ লিখুন।');
      return;
    }
    voidReceipt(receipt.id, voidReason, settings.inchargeName);
    setShowVoidModal(false);
    onReceiptUpdated();
  };

  const verifyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify?token=${receipt.verificationToken}` 
    : `https://lsfc.land.gov.bd/verify?token=${receipt.verificationToken}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              LSFC
            </div>
            <div>
              <h3 className="font-bold text-base">
                রিসিট বিস্তারিত ও প্রিন্ট প্রিভিউ
              </h3>
              <p className="text-xs text-slate-300">
                রিসিট নং: {receipt.receiptNo} | তারিখ: {receipt.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode switch */}
            <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setPrintMode('checkbook')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  printMode === 'checkbook'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                চেকবুক সাইজ (৮.২৭"×৩.৮৯")
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('thermal')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  printMode === 'thermal'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                থার্মাল মোড (৮০ মিমি)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCounterfoil(!showCounterfoil)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
              title="ডিজিটাল অফিস কপি (কাউন্টারফয়েল) দেখুন"
            >
              <Eye className="w-3.5 h-3.5" />
              {showCounterfoil ? 'গ্রাহক কপি ভিউ' : 'অফিস কপি ভিউ'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action Toolbar */}
        <div className="no-print bg-slate-50 px-6 py-2.5 flex items-center justify-between border-b border-slate-200 text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CloudCheck className="w-4 h-4 text-emerald-600" />
              গুগল ড্রাইভে স্থায়ী সংরক্ষণ: <span className="text-emerald-700 font-bold">সফল ✓</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              প্রিন্ট সংখ্যা: <strong className="text-slate-900">{toBanglaDigits(receipt.printCount || 0)}</strong> বার
            </span>
            {receipt.status === 'voided' && (
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold border border-red-300">
                বাতিলকৃত / VOID
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {receipt.status === 'valid' && (
              <button
                type="button"
                onClick={() => setShowVoidModal(true)}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-medium transition-colors"
              >
                রিসিট বাতিল (Void)
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন (শুধু গ্রাহক কপি)
            </button>
          </div>
        </div>

        {/* Receipt Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/70 flex justify-center items-start">
          
          {/* CHECKBOOK STYLE CONTAINER (8.27in x 3.89in) */}
          {printMode === 'checkbook' && (
            <div
              ref={printRef}
              className={`receipt-print-container bg-white shadow-lg border border-slate-300 relative text-slate-800 transition-all ${
                receipt.status === 'voided' ? 'opacity-85' : ''
              }`}
              style={{
                width: '8.27in',
                minHeight: '3.89in',
                maxHeight: '3.89in',
                boxSizing: 'border-box',
                padding: '0.18in 0.25in',
                fontFamily: `'SolaimanLipi', 'Kalpurush', sans-serif`,
              }}
            >
              {/* Void Watermark if voided */}
              {receipt.status === 'voided' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <span className="text-7xl font-extrabold text-red-500/20 rotate-[-20deg] border-4 border-dashed border-red-500/30 px-10 py-2 rounded-xl">
                    বাতিল / VOID
                  </span>
                </div>
              )}

              {/* Digital Counterfoil Overlay View (when toggled) */}
              {showCounterfoil ? (
                <div className="h-full flex flex-col justify-between border-2 border-indigo-200 bg-indigo-50/40 p-4 rounded-xl">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[11px] font-bold rounded">
                        ডিজিটাল অফিস কপি (Paperless Counterfoil)
                      </span>
                      <p className="text-xs text-slate-600 mt-1">
                        এটি কাগজের অপচয় রোধে অনলাইনে স্থায়ী সংরক্ষিত থাকে।
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-800">রিসিট নং: {receipt.receiptNo}</p>
                      <p className="text-slate-500">তারিখ: {toBanglaDigits(receipt.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs my-2">
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                      <p className="text-slate-500">গ্রাহকের নাম ও ফোন:</p>
                      <p className="font-bold text-slate-800 text-sm">{receipt.customerName}</p>
                      <p className="text-indigo-600 font-mono">{toBanglaDigits(receipt.customerMobile)}</p>
                      <p className="text-slate-500 mt-1">আবেদন ট্র্যাকিং নং: {receipt.applicationTrackingNo || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                      <p className="text-slate-500">সেবার বিবরণ ও আদায়:</p>
                      <p className="font-bold text-slate-800">{receipt.serviceName}</p>
                      <p className="text-slate-600">সহায়তা ফি: ৳{toBanglaDigits(receipt.serviceFee)} | সরকারি ফি: ৳{toBanglaDigits(receipt.govtFee)}</p>
                      <p className="text-emerald-700 font-bold text-sm mt-1">
                        মোট সংগৃহীত: ৳{toBanglaDigits(receipt.totalAmount)}/- ({receipt.paymentMethod.toUpperCase()})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-indigo-200 pt-2">
                    <span>প্রস্তুতকারী কর্মী: {receipt.createdBy}</span>
                    <span>গুগল ড্রাইভ আইডি: {receipt.drivePdfId}</span>
                  </div>
                </div>
              ) : (
                /* ACTUAL CLIENT COPY (ONLY 1 COPY PRINTS AS REQUESTED) */
                <div className="h-full flex flex-col justify-between">
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-300 pb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Official Icon */}
                        <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          ভূমিসেবা
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-emerald-800 tracking-tight leading-tight">
                            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
                          </p>
                          <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                            {settings.businessName} • {settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র
                          </h2>
                          <p className="text-[10px] text-slate-600 leading-tight">
                            {settings.addressDetails} | অনুমোদন নং: {toBanglaDigits(settings.licenseNo)} | মোবাইল: {toBanglaDigits(settings.mobile)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">
                          নাগরিক সেবা রিসিট (গ্রাহক কপি)
                        </span>
                        <p className="text-[11px] font-mono font-bold text-slate-900 mt-0.5">
                          {receipt.receiptNo}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          তারিখ: {toBanglaDigits(receipt.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Customer & Service Info Bar */}
                    <div className="grid grid-cols-12 gap-2 mt-1.5 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                      <div className="col-span-4">
                        <span className="text-slate-500">সেবা গ্রহীতা: </span>
                        <strong className="text-slate-900">{receipt.customerName}</strong>
                      </div>
                      <div className="col-span-4">
                        <span className="text-slate-500">মোবাইল: </span>
                        <strong className="text-slate-900 font-mono">{toBanglaDigits(receipt.customerMobile)}</strong>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className="text-slate-500">ট্র্যাকিং নং: </span>
                        <strong className="text-slate-800 font-mono">{receipt.applicationTrackingNo || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Service Table - Aligned with Appendix 8 */}
                  <div className="my-1">
                    <table className="w-full text-[11px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="border border-slate-300 px-2 py-0.5 text-left font-bold">সেবার নাম</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-center font-bold">স্ক্যান পৃষ্ঠা</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-right font-bold">সরকারি ফি</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-right font-bold">সহায়তা ফি</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-right font-bold">মোট ফি</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 px-2 py-1 font-semibold text-slate-800">
                            {receipt.serviceName}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-center text-slate-600">
                            {toBanglaDigits(receipt.scannedPages)} টি {receipt.extraScanFee > 0 && `(+৳${toBanglaDigits(receipt.extraScanFee)})`}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-right text-slate-600">
                            ৳{toBanglaDigits(receipt.govtFee)}/-
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-right text-slate-600">
                            ৳{toBanglaDigits(receipt.serviceFee)}/-
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-right font-bold text-slate-900">
                            ৳{toBanglaDigits(receipt.totalAmount)}/-
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* In Words Row */}
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-700">
                      <div>
                        <span className="font-bold">কথায়: </span>
                        <span className="italic">{numberToBanglaWords(receipt.totalAmount)}</span>
                      </div>
                      <div className="font-semibold text-slate-600">
                        পরিশোধের মাধ্যম: <span className="uppercase text-slate-900">{receipt.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer with Signature & QR Code */}
                  <div className="border-t border-slate-300 pt-1 flex items-end justify-between">
                    {/* QR Code and verification info */}
                    <div className="flex items-center gap-2">
                      <div className="p-0.5 bg-white border border-slate-300 rounded shadow-xs">
                        <QRCodeSVG
                          value={verifyUrl}
                          size={46}
                          level="M"
                        />
                      </div>
                      <div className="text-[9px] text-slate-500 leading-tight max-w-[2.6in]">
                        <p className="font-bold text-slate-700">অনলাইন যাচাইযোগ্য রিসিট</p>
                        <p>কিউআর কোড স্ক্যান করে সরকারি বৈধতা যাচাই করুন। অতিরিক্ত অর্থ দাবি করলে ১৬১২২ নম্বরে কল করুন।</p>
                      </div>
                    </div>

                    {/* Authorized Signature Block */}
                    <div className="text-center pr-2">
                      <div className="h-8 flex items-center justify-center">
                        {/* Signature Representation */}
                        <div className="font-serif italic text-blue-900 font-extrabold text-sm border-b border-slate-400 px-4">
                          {settings.inchargeName}
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-800 leading-tight">
                        {settings.inchargeName}
                      </p>
                      <p className="text-[8px] text-slate-500 leading-tight">
                        {settings.inchargeDesignation}, {settings.businessName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* THERMAL 80mm MODE */}
          {printMode === 'thermal' && (
            <div
              className="bg-white p-4 shadow-lg border border-slate-300 text-slate-900 text-xs w-[80mm] min-h-[120mm]"
              style={{ fontFamily: `'SolaimanLipi', sans-serif` }}
            >
              <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                <p className="text-[10px] font-bold text-emerald-800">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত</p>
                <h3 className="text-sm font-extrabold">{settings.businessName}</h3>
                <p className="text-[11px]">{settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র</p>
                <p className="text-[10px] text-slate-600">{settings.mobile}</p>
              </div>

              <div className="text-[11px] mb-2 space-y-0.5">
                <p><strong>রিসিট:</strong> {receipt.receiptNo}</p>
                <p><strong>তারিখ:</strong> {toBanglaDigits(receipt.createdAt)}</p>
                <p><strong>গ্রাহক:</strong> {receipt.customerName}</p>
                <p><strong>মোবাইল:</strong> {toBanglaDigits(receipt.customerMobile)}</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 my-2 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>সেবা:</span>
                  <span>ফি:</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>{receipt.serviceName}</span>
                  <span>৳{toBanglaDigits(receipt.serviceFee)}</span>
                </div>
                {receipt.govtFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>সরকারি ফি</span>
                    <span>৳{toBanglaDigits(receipt.govtFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-slate-300 pt-1 mt-1">
                  <span>সর্বমোট:</span>
                  <span>৳{toBanglaDigits(receipt.totalAmount)}/-</span>
                </div>
              </div>

              <div className="text-center my-3 flex flex-col items-center">
                <QRCodeSVG value={verifyUrl} size={60} />
                <p className="text-[9px] text-slate-500 mt-1">অনলাইনে সত্যতা যাচাইযোগ্য</p>
              </div>

              <div className="text-center border-t border-dashed border-slate-400 pt-2 text-[10px] text-slate-600">
                <p className="font-bold">{settings.inchargeName}</p>
                <p>{settings.inchargeDesignation}</p>
                <p className="mt-1">ধন্যবাদ, আবার আসবেন</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Void Confirmation Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-red-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold">রিসিট বাতিলকরণ (Void Receipt)</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              সরকারি নির্দেশিকা ও অডিট পলিসি অনুযায়ী কোনো রিসিট ডিলিট করা যায় না। এটি বাতিল করা হলে স্থায়ীভাবে অডিট লগে রেকর্ড হবে।
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বাতিলের সুনির্দিষ্ট কারণ লিখুন <span className="text-red-500">*</span>
              </label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={3}
                placeholder="যেমন: গ্রাহক কর্তৃক সেবার ধরন পরিবর্তন বা টাকার অংক ভুল এন্ট্রি..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVoidModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleVoid}
                className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
              >
                হ্যাঁ, রিসিট বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
