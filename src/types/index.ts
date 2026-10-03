export type TierType = 'union_upazila' | 'municipality' | 'city_corporation';

export interface BusinessSettings {
  id: string;
  businessName: string; // যেমন: "জনি কম্পিউটার"
  lsfcName: string; // যেমন: "ঠাকুরগাঁও সদর"
  licenseNo: string; // যেমন: "০১"
  licenseIssueDate: string; // e.g. "2025-02-15"
  licenseExpiryDate: string; // e.g. "2027-02-14"
  division: string;
  district: string; // যেমন: "ঠাকুরগাঁও"
  upazila: string; // যেমন: "ঠাকুরগাঁও সদর"
  addressDetails: string;
  inchargeName: string; // যেমন: "মোঃ মাহমুদুল হাসান"
  inchargeDesignation: string; // "কেন্দ্র ইনচার্জ"
  mobile: string; // "০১৭৭৩০১০৬৮৭"
  acLandOffice: string; // "সহকারী কমিশনার (ভূমি), ঠাকুরগাঁও সদর"
  ministryMemoRef: string; // "ভূমি মন্ত্রণালয়ের ২৮/০৭/২০২৫ খ্রি. তারিখের ৩১.০০.০০০.০৫৭.১১.১৪০.২৩-২৪৬ নং স্মারক মোতাবেক।"
  signatureUrl: string; // Image path or Google Drive link
  logoUrl: string;
  optionalMonogramUrl?: string; // Top-right optional monogram for statement
  tier: TierType; // Union/Upazila, Municipality, City Corporation
  autoReceiptSeq: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  feeUnion: number;
  feeMunicipality: number;
  feeCityCorp: number;
  govtFee: number; // সরকারি কোষাগারে প্রদেয় ফি (যেমন নামজারি ১,১৭০/-)
  perPageScanFee: number; // ২০ পৃষ্ঠার অতিরিক্ত প্রতি পৃষ্ঠা ৩/-
}

export interface CustomerRecord {
  id: string;
  name: string;
  mobile: string;
  nidMasked: string; // masked for privacy e.g. "1987********45"
  nidFull?: string;
  address: string;
  createdAt: string;
}

export interface ReceiptItem {
  id: string;
  receiptNo: string; // e.g. "LSFC-TS-2026-0001"
  verificationToken: string; // random token for QR verification
  customerId: string;
  customerName: string;
  customerMobile: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  applicationTrackingNo?: string;
  serviceFee: number; // LSFC service assistance fee
  govtFee: number; // Government treasury fee
  scannedPages: number;
  extraScanFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  status: 'valid' | 'voided' | 'refunded';
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
  createdAt: string;
  createdBy: string;
  drivePdfId?: string;
  drivePdfUrl?: string;
  printCount: number;
}

export interface GovtStatementItem {
  id: string;
  statementNo: string;
  memoNo: string;
  statementDate: string;
  periodType: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';
  periodLabel: string; // e.g. "সেপ্টেম্বর/২০২৬"
  startDate: string;
  endDate: string;
  totalApplications: number;
  breakdown: {
    serviceName: string;
    count: number;
    remarks?: string;
  }[];
  customRemarks?: string;
  status: 'draft' | 'finalized';
  drivePdfId?: string;
  drivePdfUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'owner' | 'manager' | 'operator';
  action: 'LOGIN' | 'CREATE_RECEIPT' | 'VOID_RECEIPT' | 'REPRINT_RECEIPT' | 'GENERATE_STATEMENT' | 'UPDATE_SETTINGS' | 'CASH_CLOSING' | 'VIEW_SENSITIVE_DATA' | 'BACKUP_DRIVE';
  details: string;
  ipAddress: string;
  device: string;
  beforeData?: any;
  afterData?: any;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'operator' | 'manager' | 'receptionist';
  mobile: string;
  nid: string;
  joinedDate: string;
  photoUrl: string;
  nidDocUrl: string;
  status: 'active' | 'inactive';
}

export interface InspectionChecklist {
  id: number;
  itemText: string;
  complied: boolean;
  notes: string;
}

export interface ComplaintRecord {
  id: string;
  complaintDate: string;
  citizenName: string;
  citizenMobile: string;
  subject: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved';
  resolutionNotes?: string;
}

export interface CashClosingRecord {
  id: string;
  date: string;
  openingCash: number;
  cashCollections: number;
  digitalCollections: number;
  cashExpenses: number;
  refunds: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  closedBy: string;
  closedAt: string;
  notes?: string;
}
