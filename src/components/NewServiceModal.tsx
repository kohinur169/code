'use client';

import React, { useState } from 'react';
import { BusinessSettings, ServiceItem, ReceiptItem } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { createReceipt } from '@/lib/storage';
import { X, CheckCircle, Calculator, FileText, User, Smartphone, Shield, AlertCircle } from 'lucide-react';

interface NewServiceModalProps {
  settings: BusinessSettings;
  services: ServiceItem[];
  onClose: () => void;
  onReceiptCreated: (receipt: ReceiptItem) => void;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  settings,
  services,
  onClose,
  onReceiptCreated,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState(services[2]?.id || services[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [scannedPages, setScannedPages] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Calculate fee based on tier
  let baseServiceFee = selectedService.feeUnion;
  if (settings.tier === 'municipality') {
    baseServiceFee = selectedService.feeMunicipality;
  } else if (settings.tier === 'city_corporation') {
    baseServiceFee = selectedService.feeCityCorp;
  }

  // Extra scan fee rule (Guideline page 22: pages > 20 => ৳3 per extra page)
  const extraPages = Math.max(0, scannedPages - 20);
  const extraScanFee = extraPages * (selectedService.perPageScanFee || 3);

  const govtFee = selectedService.govtFee || 0;
  const totalAmount = baseServiceFee + extraScanFee + govtFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) {
      alert('অনুগ্রহ করে গ্রাহকের নাম ও মোবাইল নম্বর সঠিকভাবে প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReceipt = await createReceipt(
        {
          customerId: 'cust_' + Date.now(),
          customerName,
          customerMobile,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          serviceCategory: selectedService.category,
          applicationTrackingNo: trackingNo || undefined,
          serviceFee: baseServiceFee,
          govtFee,
          scannedPages,
          extraScanFee,
          discount: 0,
          totalAmount,
          paymentMethod,
          createdBy: settings.inchargeName,
        },
        settings.inchargeName
      );

      setIsSubmitting(false);
      onReceiptCreated(newReceipt);
    } catch (err) {
      setIsSubmitting(false);
      alert('রিসিট তৈরিতে ত্রুটি হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              + সেবা
            </div>
            <div>
              <h3 className="font-bold text-base">নতুন ভূমিসেবা এন্ট্রি ও রিসিট তৈরি</h3>
              <p className="text-xs text-slate-300">
                পরিশিষ্ট-৭ সরকারি অনুমোদিত ফি ক্যালকুলেটর
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                সেবা গ্রহীতার নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ আব্দুল করিম"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              ভূমিসেবার ধরন নির্বাচন করুন <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Tracking No & Scan Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অনলাইন আবেদন / ট্র্যাকিং নম্বর (যদি থাকে)
              </label>
              <input
                type="text"
                placeholder="যেমন: MUT-2026-9081"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সংযুক্তির স্ক্যান পাতা সংখ্যা
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={scannedPages}
                  onChange={(e) => setScannedPages(parseInt(e.target.value) || 0)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  (২০ পৃষ্ঠার পর প্রতি পৃষ্ঠা ৳৩)
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              পরিশোধের মাধ্যম
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['cash', 'bkash', 'nagad', 'bank'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method === 'cash' ? 'নগদ (Cash)' : method.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Live Fee Calculation Breakdown */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs space-y-1.5 text-slate-800">
            <div className="flex items-center justify-between text-slate-600">
              <span>সহায়তা ফি ({settings.tier === 'city_corporation' ? 'সিটি কর্পোরেশন' : settings.tier === 'municipality' ? 'পৌরসভা' : 'ইউনিয়ন ও উপজেলা সদর'}):</span>
              <span className="font-semibold text-slate-900">৳{toBanglaDigits(baseServiceFee)}/-</span>
            </div>
            {extraScanFee > 0 && (
              <div className="flex items-center justify-between text-amber-700">
                <span>অতিরিক্ত স্ক্যান ফি ({toBanglaDigits(extraPages)} পৃষ্ঠা × ৳৩):</span>
                <span className="font-semibold">+ ৳{toBanglaDigits(extraScanFee)}/-</span>
              </div>
            )}
            {govtFee > 0 && (
              <div className="flex items-center justify-between text-blue-700">
                <span>সরকারি কোষাগারে প্রদেয় ফি:</span>
                <span className="font-semibold">+ ৳{toBanglaDigits(govtFee)}/-</span>
              </div>
            )}
            <div className="border-t border-emerald-200 pt-2 flex items-center justify-between text-sm font-extrabold text-emerald-950">
              <span>সর্বমোট প্রদেয় ফি:</span>
              <span className="text-base text-emerald-700">৳{toBanglaDigits(totalAmount)}/-</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'প্রক্রিয়াধীন...' : 'সংরক্ষণ ও রিসিট প্রিন্ট করুন'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
