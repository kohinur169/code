'use client';

import React, { useState } from 'react';
import { BusinessSettings, ReceiptItem } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { addCashClosing } from '@/lib/storage';
import { X, CheckCircle, Calculator, AlertCircle, DollarSign, Wallet } from 'lucide-react';

interface CashClosingModalProps {
  settings: BusinessSettings;
  receipts: ReceiptItem[];
  onClose: () => void;
  onClosed: () => void;
}

export const CashClosingModal: React.FC<CashClosingModalProps> = ({
  settings,
  receipts,
  onClose,
  onClosed,
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);

  // Filter today's valid receipts
  const todayReceipts = receipts.filter(
    (r) => r.createdAt.startsWith(todayStr) && r.status === 'valid'
  );

  const cashCollections = todayReceipts
    .filter((r) => r.paymentMethod === 'cash')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const digitalCollections = todayReceipts
    .filter((r) => r.paymentMethod !== 'cash')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const [openingCash, setOpeningCash] = useState<number>(1000);
  const [cashExpenses, setCashExpenses] = useState<number>(0);
  const [refunds, setRefunds] = useState<number>(0);
  const [actualCash, setActualCash] = useState<number>(openingCash + cashCollections);
  const [notes, setNotes] = useState('');

  const expectedCash = openingCash + cashCollections - cashExpenses - refunds;
  const difference = actualCash - expectedCash;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCashClosing(
      {
        date: todayStr,
        openingCash,
        cashCollections,
        digitalCollections,
        cashExpenses,
        refunds,
        expectedCash,
        actualCash,
        difference,
        closedBy: settings.inchargeName,
        notes,
      },
      settings.inchargeName
    );
    alert('ডে-এন্ড ক্যাশ ক্লোজিং সফলভাবে সম্পন্ন হয়েছে!');
    onClosed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">দৈনিক ক্যাশ ক্লোজিং (Day-End Closing)</h3>
              <p className="text-xs text-slate-300">
                তারিখ: {todayStr} | ইনচার্জ: {settings.inchargeName}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-slate-600">আজকের নগদ আদায় (Cash):</span>
              <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                ৳{toBanglaDigits(cashCollections)}/-
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-slate-600">ডিজিটাল আদায় (bKash/Nagad):</span>
              <p className="text-lg font-extrabold text-blue-800 mt-0.5">
                ৳{toBanglaDigits(digitalCollections)}/-
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                দিনের শুরুতে প্রারম্ভিক ক্যাশ (Opening Cash)
              </label>
              <input
                type="number"
                min="0"
                value={openingCash}
                onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  আজকের নগদ খরচ (কাগজ/কালি/চা ইত্যাদি)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashExpenses}
                  onChange={(e) => setCashExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  গ্রাহক রিফান্ড (যদি থাকে)
                </label>
                <input
                  type="number"
                  min="0"
                  value={refunds}
                  onChange={(e) => setRefunds(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ড্রয়ারে ফিজিক্যাল ক্যাশ কত গণনা পাওয়া গেল (Actual Cash)
              </label>
              <input
                type="number"
                min="0"
                value={actualCash}
                onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ক্লোজিং নোট / মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: সব ভাউচার পরীক্ষিত"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Reconciliation Summary */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>হিসাব অনুযায়ী ক্যাশ থাকার কথা (Expected):</span>
              <strong className="text-slate-900">৳{toBanglaDigits(expectedCash)}/-</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>বাস্তবে গণনাকৃত ক্যাশ (Actual):</span>
              <strong className="text-slate-900">৳{toBanglaDigits(actualCash)}/-</strong>
            </div>
            <div className="border-t border-slate-300 pt-1.5 flex justify-between items-center">
              <span className="font-bold text-slate-800">পার্থক্য (Difference):</span>
              <span className={`font-extrabold text-sm ${
                difference === 0 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {difference === 0 ? 'কোনো গরমিল নেই (৳০)' : `৳${toBanglaDigits(difference)}/-`}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-sm"
            >
              ক্যাশ হিসাব লক ও ক্লোজ করুন
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
