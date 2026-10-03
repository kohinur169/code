'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/types';
import { toBanglaDigits } from '@/lib/banglaConverter';
import { Shield, Clock, Monitor, User, ArrowRight, Search, Filter } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_RECEIPT':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">রিসিট তৈরি</span>;
      case 'VOID_RECEIPT':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px]">রিসিট বাতিল</span>;
      case 'GENERATE_STATEMENT':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">স্টেটমেন্ট তৈরি</span>;
      case 'CASH_CLOSING':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">ক্যাশ ক্লোজিং</span>;
      case 'UPDATE_SETTINGS':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">সেটিংস পরিবর্তন</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px]">{action}</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header with Search and Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            ডিজিটাল অপরিবর্তনীয় অডিট ট্রেইল (Immutable Audit Trail)
          </h4>
          <p className="text-xs text-slate-500">
            প্রতিটি সেবা, রিসিট, বাতিলকরণ ও পরিবর্তনের সময়, আইপি ও ব্যবহারকারীর লগ
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="অডিট সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs w-48"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            <option value="ALL">সকল কার্যক্রম</option>
            <option value="CREATE_RECEIPT">রিসিট তৈরি</option>
            <option value="VOID_RECEIPT">রিসিট বাতিল</option>
            <option value="GENERATE_STATEMENT">স্টেটমেন্ট তৈরি</option>
            <option value="CASH_CLOSING">ক্যাশ ক্লোজিং</option>
            <option value="UPDATE_SETTINGS">সেটিংস পরিবর্তন</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="py-2.5 px-4 font-semibold">তারিখ ও সময়</th>
              <th className="py-2.5 px-3 font-semibold">ব্যবহারকারী</th>
              <th className="py-2.5 px-3 font-semibold">কার্যক্রমের ধরন</th>
              <th className="py-2.5 px-4 font-semibold">বিস্তারিত বিবরণ</th>
              <th className="py-2.5 px-3 font-semibold">আইপি ও ডিভাইস</th>
              <th className="py-2.5 px-3 font-semibold text-center">ডেটা হিস্ট্রি</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {toBanglaDigits(log.timestamp)}
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-800">{log.userName}</span>
                  <span className="block text-[10px] text-slate-400 capitalize">{log.userRole}</span>
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {getActionBadge(log.action)}
                </td>
                <td className="py-3 px-4 text-slate-700 leading-snug">
                  {log.details}
                </td>
                <td className="py-3 px-3 text-[11px] text-slate-500 font-mono">
                  <span>{log.ipAddress}</span>
                  <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">{log.device}</span>
                </td>
                <td className="py-3 px-3 text-center">
                  {(log.beforeData || log.afterData) ? (
                    <button
                      type="button"
                      onClick={() => setInspectingLog(log)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline text-[11px]"
                    >
                      Before / After
                    </button>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Before / After Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h4 className="font-bold text-slate-900 text-sm">
                ডেটা পরিবর্তন নিরীক্ষা (Before vs After Audit)
              </h4>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">{inspectingLog.details}</p>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <strong className="text-red-800 block mb-1">পূর্বের মান (Before):</strong>
                <pre className="text-[11px] overflow-x-auto text-red-900 whitespace-pre-wrap">
                  {JSON.stringify(inspectingLog.beforeData || 'কোনো পূর্ববর্তী মান নেই (New Entry)', null, 2)}
                </pre>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <strong className="text-emerald-800 block mb-1">নতুন মান (After):</strong>
                <pre className="text-[11px] overflow-x-auto text-emerald-900 whitespace-pre-wrap">
                  {JSON.stringify(inspectingLog.afterData || 'N/A', null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
