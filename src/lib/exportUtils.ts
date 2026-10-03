import { TierType } from '@/types';

export interface ConsentSlipData {
  citizenName: string;
  citizenMobile: string;
  citizenNid: string;
  serviceName: string;
  applicationTrackingNo?: string;
  centerName: string;
  inchargeName: string;
  date: string;
}

export const generateSmsText = (
  customerName: string,
  serviceName: string,
  receiptNo: string,
  amount: number,
  trackingNo?: string
): string => {
  return `জনাব ${customerName}, আপনার '${serviceName}' আবেদনটি সফলভাবে দাখিল হয়েছে। রিসিট নং: ${receiptNo}, মোট ফি: ৳${amount}/-। ${
    trackingNo ? `ট্র্যাকিং নং: ${trackingNo}। ` : ''
  }সেবা সহায়তায়: ১৬১২২। ভূমিসেবা সহায়তা কেন্দ্র।`;
};

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Bangla characters in Excel
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
