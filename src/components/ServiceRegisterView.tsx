'use client';

import React, { useState } from 'react';
import { ReceiptItem, BusinessSettings } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { exportToCSV } from '@/lib/exportUtils';
import { Printer, Download, Search, Filter, ShieldCheck, DollarSign, Wallet } from 'lucide-react';

interface ServiceRegisterViewProps {
  receipts: ReceiptItem[];
  settings: BusinessSettings;
}

export const ServiceRegisterView: React.FC<ServiceRegisterViewProps> = ({
  receipts,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  const filtered = receipts.filter((r) => {
    const matchesSearch =
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerMobile.includes(searchTerm) ||
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'ALL' || r.serviceCategory === serviceFilter;
    return matchesSearch && matchesService;
  });

  // Financial breakdown
  const validReceipts = filtered.filter((r) => r.status === 'valid');
  const totalGovtFee = validReceipts.reduce((sum, r) => sum + r.govtFee, 0);
  const totalServiceFee = validReceipts.reduce((sum, r) => sum + r.serviceFee + r.extraScanFee, 0);
  const grandTotal = totalGovtFee + totalServiceFee;

  const handleExportCSV = () => {
    const rows = filtered.map((r, i) => ({
      'ক্রঃ নং': i + 1,
      'রিসিট নম্বর': r.receiptNo,
      'তারিখ ও সময়': r.createdAt,
      'সেবা গ্রহীতা': r.customerName,
      'মোবাইল নম্বর': r.customerMobile,
      'ভূমিসেবার নাম': r.serviceName,
      'আবেদন ট্র্যাকিং নং': r.applicationTrackingNo || '',
      'সরকারি কোষাগার ফি (টাকা)': r.govtFee,
      'সহায়তাকারী সার্ভিস ফি (টাকা)': r.serviceFee + r.extraScanFee,
      'সর্বমোট ফি (টাকা)': r.totalAmount,
      'পরিশোধ মাধ্যম': r.paymentMethod,
      'স্ট্যাটাস': r.status === 'valid' ? 'বৈধ' : 'বাতিলকৃত',
      'সেবাদানকারী': r.createdBy,
    }));
    exportToCSV(`LSFC_Service_Register_${new Date().toISOString().substring(0, 10)}.csv`, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Financial Health & Fee Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>সর্বমোট সংগৃহীত অর্থ</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mt-1">
            ৳{toBanglaDigits(grandTotal)}/-
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            মোট {toBanglaDigits(validReceipts.length)} টি বৈধ সেবার বিপরীতে
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-blue-700 font-semibold">
            <span>সরকারি কোষাগারে প্রদেয় ফি (Treasury)</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="text-2xl font-black text-blue-900 mt-1">
            ৳{toBanglaDigits(totalGovtFee)}/-
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            নামজারি, খতিয়ান ও কোর্ট ফি বাবদ
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span>কেন্দ্রের প্রকৃত সার্ভিস আয় (LSFC Revenue)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="text-2xl font-black text-emerald-800 mt-1">
            ৳{toBanglaDigits(totalServiceFee)}/-
          </h4>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            নির্দেশিকা অনুমোদিত সহায়তা ফি
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="রেজিস্টার সার্চ করুন (রিসিট, নাম, মোবাইল)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">সকল ক্যাটাগরি</option>
            <option value="নামজারি">নামজারি</option>
            <option value="ভূমি উন্নয়ন কর">ভূমি উন্নয়ন কর</option>
            <option value="খতিয়ান/পর্চা">খতিয়ান/পর্চা</option>
            <option value="মিস কেস">মিস কেস</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            এক্সেল / CSV এক্সপোর্ট
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            রেজিস্টার প্রিন্ট
          </button>
        </div>
      </div>

      {/* Official Printable Register Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              ডিজিটাল ভূমিসেবা ও ফি আদায় রেজিস্টার
            </h4>
            <p className="text-xs text-slate-500">
              ভূমিসেবা সহায়তা নির্দেশিকা, ২০২৫ (অনুচ্ছেদ ১১.৬.১৪ অনুযায়ী সরকারি অডিটের জন্য সংরক্ষিত)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            মোট রেকর্ড: {toBanglaDigits(filtered.length)} টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-bold w-12 text-center">ক্রঃ</th>
                <th className="py-2.5 px-3 font-bold">রিসিট নং ও সময়</th>
                <th className="py-2.5 px-3 font-bold">সেবা গ্রহীতা</th>
                <th className="py-2.5 px-3 font-bold">ভূমিসেবায় নাম</th>
                <th className="py-2.5 px-3 font-bold text-right text-blue-800">সরকারি ফি</th>
                <th className="py-2.5 px-3 font-bold text-right text-emerald-800">সহায়তা ফি</th>
                <th className="py-2.5 px-3 font-bold text-right">মোট ফি</th>
                <th className="py-2.5 px-3 font-bold text-center">পরিশোধ</th>
                <th className="py-2.5 px-3 font-bold">সেবাদানকারী</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 text-center text-slate-500 font-bold">{toBanglaDigits(i + 1)}</td>
                  <td className="py-2 px-3 font-mono">
                    <span className="font-bold text-slate-900">{r.receiptNo}</span>
                    <span className="block text-[10px] text-slate-400">{toBanglaDigits(r.createdAt)}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-slate-800">{r.customerName}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">{toBanglaDigits(r.customerMobile)}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-800">
                    <span>{r.serviceName}</span>
                    {r.applicationTrackingNo && (
                      <span className="block text-[10px] text-slate-400 font-mono">
                        ট্র্যাকিং: {r.applicationTrackingNo}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-blue-700">
                    ৳{toBanglaDigits(r.govtFee)}/-
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-700">
                    ৳{toBanglaDigits(r.serviceFee + r.extraScanFee)}/-
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ৳{toBanglaDigits(r.totalAmount)}/-
                  </td>
                  <td className="py-2 px-3 text-center uppercase text-[10px] font-bold text-slate-600">
                    {r.paymentMethod}
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-[11px]">
                    {r.createdBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
