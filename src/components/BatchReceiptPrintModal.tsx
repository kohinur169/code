'use client';

import React, { useState } from 'react';
import { ReceiptItem, BusinessSettings } from '@/types';
import { toBanglaDigits, numberToBanglaWords } from '@/lib/banglaConverter';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, CheckSquare, Square } from 'lucide-react';

interface BatchReceiptPrintModalProps {
  receipts: ReceiptItem[];
  settings: BusinessSettings;
  onClose: () => void;
}

export const BatchReceiptPrintModal: React.FC<BatchReceiptPrintModalProps> = ({
  receipts,
  settings,
  onClose,
}) => {
  // Select first 3 valid receipts by default
  const [selectedIds, setSelectedIds] = useState<string[]>(
    receipts.filter((r) => r.status === 'valid').slice(0, 3).map((r) => r.id)
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('১টি A4 পেজে একসাথে সর্বোচ্চ ৩টি রিসিট প্রিন্ট করা যাবে।');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedReceipts = receipts.filter((r) => selectedIds.includes(r.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              3-in-1
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                ১টি A4 পাতায় ৩টি রিসিট প্রিন্ট মোড (কাগজ সাশ্রয়ী ব্যাচ প্রিন্ট)
              </h3>
              <p className="text-xs text-slate-300">
                নির্বাচিত ৩টি রিসিট সমানভাবে ৩.৮৯ ইঞ্চি উচ্চতায় A4 পেজে সাজানো
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={selectedReceipts.length === 0}
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              A4 পেজে ৩টি প্রিন্ট করুন ({toBanglaDigits(selectedReceipts.length)}/৩)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="no-print bg-slate-50 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            প্রিন্টের জন্য রিসিট নির্বাচন করুন (সর্বোচ্চ ৩টি):
          </span>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {receipts.filter((r) => r.status === 'valid').slice(0, 8).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleSelect(r.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-all ${
                  selectedIds.includes(r.id)
                    ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {selectedIds.includes(r.id) ? (
                  <CheckSquare className="w-3 h-3" />
                ) : (
                  <Square className="w-3 h-3" />
                )}
                {r.receiptNo.slice(-6)}
              </button>
            ))}
          </div>
        </div>

        {/* A4 Sheet Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-200/70 flex justify-center">
          <div
            className="bg-white shadow-2xl border border-slate-300 p-0 text-slate-900 w-[8.27in] min-h-[11.69in] max-h-[11.69in] flex flex-col justify-between"
            style={{ fontFamily: `'SolaimanLipi', sans-serif`, boxSizing: 'border-box' }}
          >
            {selectedReceipts.map((receipt, index) => {
              const verifyUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/verify?token=${receipt.verificationToken}` 
                : `https://lsfc.land.gov.bd/verify?token=${receipt.verificationToken}`;

              return (
                <div
                  key={receipt.id}
                  className={`w-full h-[3.89in] max-h-[3.89in] p-4 flex flex-col justify-between box-sizing-border ${
                    index < 2 ? 'border-b-2 border-dashed border-slate-400' : ''
                  }`}
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-300 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-emerald-700 text-white font-black text-[8px] flex flex-col items-center justify-center">
                          <span>ভূমি</span>
                          <span>সেবা</span>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-emerald-800 leading-tight">
                            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
                          </p>
                          <h2 className="text-xs font-black text-slate-900 leading-tight">
                            {settings.businessName} • {settings.lsfcName} ভূমিসেবা সহায়তা কেন্দ্র
                          </h2>
                          <p className="text-[8px] text-slate-600 leading-tight">
                            অনুমোদন নং: {toBanglaDigits(settings.licenseNo)} | মোবাইল: {toBanglaDigits(settings.mobile)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-bold rounded">
                          গ্রাহক কপি ({toBanglaDigits(index + 1)}/৩)
                        </span>
                        <p className="text-[10px] font-mono font-bold text-slate-900 mt-0.5">
                          {receipt.receiptNo}
                        </p>
                        <p className="text-[8px] text-slate-500">
                          তারিখ: {toBanglaDigits(receipt.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-1 mt-1 text-[9px] bg-slate-50 p-1 rounded border border-slate-200">
                      <div className="col-span-5">
                        <span className="text-slate-500">সেবা গ্রহীতা: </span>
                        <strong className="text-slate-900">{receipt.customerName}</strong>
                      </div>
                      <div className="col-span-4">
                        <span className="text-slate-500">মোবাইল: </span>
                        <strong className="text-slate-900 font-mono">{toBanglaDigits(receipt.customerMobile)}</strong>
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="text-slate-500">ট্র্যাকিং: </span>
                        <strong className="font-mono">{receipt.applicationTrackingNo || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="my-0.5">
                    <table className="w-full text-[9px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-2 py-0.5 text-left">সেবার নাম</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-center">স্ক্যান পৃষ্ঠা</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-right">সরকারি ফি</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-right">সহায়তা ফি</th>
                          <th className="border border-slate-300 px-2 py-0.5 text-right font-bold">মোট ফি</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 px-2 py-0.5 font-semibold">{receipt.serviceName}</td>
                          <td className="border border-slate-300 px-2 py-0.5 text-center">{toBanglaDigits(receipt.scannedPages)} টি</td>
                          <td className="border border-slate-300 px-2 py-0.5 text-right">৳{toBanglaDigits(receipt.govtFee)}/-</td>
                          <td className="border border-slate-300 px-2 py-0.5 text-right">৳{toBanglaDigits(receipt.serviceFee)}/-</td>
                          <td className="border border-slate-300 px-2 py-0.5 text-right font-bold">৳{toBanglaDigits(receipt.totalAmount)}/-</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between items-center text-[8.5px] mt-0.5">
                      <div>
                        <strong>কথায়: </strong>
                        <span className="italic">{numberToBanglaWords(receipt.totalAmount)}</span>
                      </div>
                      <div>
                        পরিশোধ: <span className="uppercase font-bold">{receipt.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-300 pt-0.5 flex items-end justify-between">
                    <div className="flex items-center gap-1.5">
                      <QRCodeSVG value={verifyUrl} size={36} />
                      <div className="text-[7.5px] text-slate-500 leading-tight">
                        <p className="font-bold">যাচাইযোগ্য ডিজিটাল রিসিট</p>
                        <p>হটলাইন: ১৬১২২</p>
                      </div>
                    </div>

                    <div className="text-center pr-2">
                      <div className="font-serif italic text-blue-900 font-extrabold text-[10px]">
                        {settings.inchargeName}
                      </div>
                      <p className="text-[8px] font-bold text-slate-800 leading-tight">{settings.inchargeName}</p>
                      <p className="text-[7px] text-slate-500">{settings.inchargeDesignation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
