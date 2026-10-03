import {
  BusinessSettings,
  ServiceItem,
  ReceiptItem,
  GovtStatementItem,
  AuditLog,
  StaffMember,
  InspectionChecklist,
  ComplaintRecord,
  CashClosingRecord,
} from '@/types';
import {
  initialBusinessSettings,
  officialServices,
  initialReceipts,
  initialStatements,
  initialAuditLogs,
  initialStaff,
  inspectionChecklistData,
  initialComplaints,
} from './mockData';
import { uploadFileToDrive } from './googleDriveService';

const STORAGE_KEYS = {
  SETTINGS: 'lsfc_settings_v1',
  SERVICES: 'lsfc_services_v1',
  RECEIPTS: 'lsfc_receipts_v1',
  STATEMENTS: 'lsfc_statements_v1',
  AUDIT_LOGS: 'lsfc_audit_logs_v1',
  STAFF: 'lsfc_staff_v1',
  INSPECTIONS: 'lsfc_inspections_v1',
  COMPLAINTS: 'lsfc_complaints_v1',
  CASH_CLOSINGS: 'lsfc_cash_closings_v1',
};

export const getSettings = (): BusinessSettings => {
  if (typeof window === 'undefined') return initialBusinessSettings;
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialBusinessSettings));
    return initialBusinessSettings;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialBusinessSettings;
  }
};

export const saveSettings = (newSettings: BusinessSettings, user: string = 'মোঃ মাহমুদুল হাসান') => {
  if (typeof window === 'undefined') return;
  const oldSettings = getSettings();
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  addAuditLog({
    userId: 'user_owner',
    userName: user,
    userRole: 'owner',
    action: 'UPDATE_SETTINGS',
    details: 'কেন্দ্রের প্রোফাইল ও সেটিংস তথ্য হালনাগাদ করা হয়েছে।',
    ipAddress: '103.145.118.24',
    device: 'Web Client',
    beforeData: oldSettings,
    afterData: newSettings,
  });
};

export const getServices = (): ServiceItem[] => {
  if (typeof window === 'undefined') return officialServices;
  const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(officialServices));
    return officialServices;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return officialServices;
  }
};

export const getReceipts = (): ReceiptItem[] => {
  if (typeof window === 'undefined') return initialReceipts;
  const stored = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(initialReceipts));
    return initialReceipts;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialReceipts;
  }
};

export const createReceipt = async (
  receiptData: Omit<ReceiptItem, 'id' | 'receiptNo' | 'verificationToken' | 'createdAt' | 'status' | 'printCount'>,
  operatorName: string = 'মোঃ মাহমুদুল হাসান'
): Promise<ReceiptItem> => {
  const settings = getSettings();
  const currentSeq = (settings.autoReceiptSeq || 678) + 1;
  const receiptNo = `LSFC-TS-2026-${String(currentSeq).padStart(6, '0')}`;
  const verificationToken = 'vfy_' + Math.random().toString(36).substring(2, 11);

  // Auto upload simulated PDF record to Google Drive
  const driveRecord = await uploadFileToDrive(
    `Receipt_${receiptNo}.pdf`,
    'receipt_pdf',
    'simulated_pdf_content'
  );

  const newReceipt: ReceiptItem = {
    ...receiptData,
    id: 'rcp_' + Date.now(),
    receiptNo,
    verificationToken,
    status: 'valid',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    drivePdfId: driveRecord.id,
    drivePdfUrl: driveRecord.driveWebUrl,
    printCount: 0,
  };

  const currentList = getReceipts();
  currentList.unshift(newReceipt);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(currentList));
  }

  // Update business sequence
  saveSettings({
    ...settings,
    autoReceiptSeq: currentSeq,
  }, operatorName);

  // Add audit log
  addAuditLog({
    userId: 'user_active',
    userName: operatorName,
    userRole: 'owner',
    action: 'CREATE_RECEIPT',
    details: `রিসিট #${receiptNo} তৈরি করা হয়েছে। সেবা: ${newReceipt.serviceName}, ফি: ৳${newReceipt.totalAmount}/- (ড্রাইভে ব্যাকআপ সম্পন্ন)`,
    ipAddress: '103.145.118.24',
    device: 'Desktop Chrome / Windows 11',
    afterData: newReceipt,
  });

  return newReceipt;
};

export const voidReceipt = (
  receiptId: string,
  reason: string,
  operatorName: string = 'মোঃ মাহমুদুল হাসান'
): ReceiptItem | null => {
  const currentList = getReceipts();
  const target = currentList.find((r) => r.id === receiptId);
  if (!target) return null;

  const beforeData = { ...target };
  target.status = 'voided';
  target.voidReason = reason;
  target.voidedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  target.voidedBy = operatorName;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(currentList));
  }

  addAuditLog({
    userId: 'user_active',
    userName: operatorName,
    userRole: 'owner',
    action: 'VOID_RECEIPT',
    details: `রিসিট #${target.receiptNo} বাতিল (Void) করা হয়েছে। কারণ: "${reason}"`,
    ipAddress: '103.145.118.24',
    device: 'Desktop Chrome / Windows 11',
    beforeData,
    afterData: target,
  });

  return target;
};

export const incrementReceiptPrintCount = (receiptId: string) => {
  const currentList = getReceipts();
  const target = currentList.find((r) => r.id === receiptId);
  if (target) {
    target.printCount = (target.printCount || 0) + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(currentList));
    }
  }
};

export const getStatements = (): GovtStatementItem[] => {
  if (typeof window === 'undefined') return initialStatements;
  const stored = localStorage.getItem(STORAGE_KEYS.STATEMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(initialStatements));
    return initialStatements;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialStatements;
  }
};

export const saveGovtStatement = async (
  statementData: Omit<GovtStatementItem, 'id' | 'createdAt'>,
  operatorName: string = 'মোঃ মাহমুদুল হাসান'
): Promise<GovtStatementItem> => {
  // Save PDF to Google Drive
  const driveRecord = await uploadFileToDrive(
    `Govt_Statement_${statementData.periodLabel.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
    'statement_pdf',
    'simulated_pdf_content'
  );

  const newStatement: GovtStatementItem = {
    ...statementData,
    id: 'stmt_' + Date.now(),
    createdAt: new Date().toISOString().substring(0, 10),
    drivePdfId: driveRecord.id,
    drivePdfUrl: driveRecord.driveWebUrl,
  };

  const currentList = getStatements();
  currentList.unshift(newStatement);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(currentList));
  }

  addAuditLog({
    userId: 'user_active',
    userName: operatorName,
    userRole: 'owner',
    action: 'GENERATE_STATEMENT',
    details: `সরকারি স্টেটমেন্ট #${statementData.statementNo} (${statementData.periodLabel}) তৈরি ও গুগল ড্রাইভে সংরক্ষিত হয়েছে। মোট আবেদন: ${statementData.totalApplications} টি`,
    ipAddress: '103.145.118.24',
    device: 'Desktop Chrome / Windows 11',
    afterData: newStatement,
  });

  return newStatement;
};

export const getAuditLogs = (): AuditLog[] => {
  if (typeof window === 'undefined') return initialAuditLogs;
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    return initialAuditLogs;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialAuditLogs;
  }
};

export const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const newLog: AuditLog = {
    ...logData,
    id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  const list = getAuditLogs();
  list.unshift(newLog);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list));
  }
};

export const getInspectionChecklist = (): InspectionChecklist[] => {
  if (typeof window === 'undefined') return inspectionChecklistData;
  const stored = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspectionChecklistData));
    return inspectionChecklistData;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return inspectionChecklistData;
  }
};

export const saveInspectionChecklist = (items: InspectionChecklist[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(items));
  }
};

export const getComplaints = (): ComplaintRecord[] => {
  if (typeof window === 'undefined') return initialComplaints;
  const stored = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(initialComplaints));
    return initialComplaints;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialComplaints;
  }
};

export const addComplaint = (complaint: Omit<ComplaintRecord, 'id' | 'status'>) => {
  const newRecord: ComplaintRecord = {
    ...complaint,
    id: 'cmp_' + Date.now(),
    status: 'pending',
  };
  const list = getComplaints();
  list.unshift(newRecord);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
  }
};

export const getCashClosings = (): CashClosingRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.CASH_CLOSINGS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const addCashClosing = (data: Omit<CashClosingRecord, 'id' | 'closedAt'>, userName: string) => {
  const record: CashClosingRecord = {
    ...data,
    id: 'close_' + Date.now(),
    closedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  const list = getCashClosings();
  list.unshift(record);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CASH_CLOSINGS, JSON.stringify(list));
  }
  addAuditLog({
    userId: 'user_active',
    userName,
    userRole: 'owner',
    action: 'CASH_CLOSING',
    details: `ডে-এন্ড ক্যাশ ক্লোজিং সম্পন্ন। তারিখ: ${record.date}, পার্থক্য: ৳${record.difference}/-`,
    ipAddress: '103.145.118.24',
    device: 'Desktop Chrome / Windows 11',
    afterData: record,
  });
};

export const exportFullBackupJSON = () => {
  if (typeof window === 'undefined') return '';
  const data = {
    exportDate: new Date().toISOString(),
    version: '2.5.0-Compliance',
    settings: getSettings(),
    receipts: getReceipts(),
    statements: getStatements(),
    auditLogs: getAuditLogs(),
    inspections: getInspectionChecklist(),
    complaints: getComplaints(),
    cashClosings: getCashClosings(),
  };
  return JSON.stringify(data, null, 2);
};

export const restoreFullBackupJSON = (jsonStr: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const data = JSON.parse(jsonStr);
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.receipts) localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(data.receipts));
    if (data.statements) localStorage.setItem(STORAGE_KEYS.STATEMENTS, JSON.stringify(data.statements));
    if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
    if (data.inspections) localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(data.inspections));
    if (data.complaints) localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(data.complaints));
    if (data.cashClosings) localStorage.setItem(STORAGE_KEYS.CASH_CLOSINGS, JSON.stringify(data.cashClosings));
    
    addAuditLog({
      userId: 'user_active',
      userName: 'সিস্টেম অ্যাডমিন',
      userRole: 'owner',
      action: 'UPDATE_SETTINGS',
      details: 'অফলাইন JSON ব্যাকআপ হতে সম্পূর্ণ সিস্টেম ডাটা সফলভাবে রিস্টোর করা হয়েছে।',
      ipAddress: '103.145.118.24',
      device: 'Desktop Chrome / Windows 11',
    });
    return true;
  } catch (e) {
    return false;
  }
};
