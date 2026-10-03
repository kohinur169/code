// Google Drive API integration and File Storage Architecture

export interface DriveConfig {
  isConnected: boolean;
  folderRootId: string;
  folderRootName: string;
  userEmail: string;
  lastSyncTime: string;
  storageUsed: string;
  autoSyncEnabled: boolean;
}

export interface DriveFileRecord {
  id: string;
  fileName: string;
  fileType: 'receipt_pdf' | 'statement_pdf' | 'signature_png' | 'logo_png' | 'staff_nid' | 'monogram_img';
  driveFolder: string;
  driveWebUrl: string;
  driveDownloadUrl: string;
  sizeBytes: number;
  uploadedAt: string;
  base64Thumbnail?: string;
}

// In-memory / persistent simulated Google Drive Storage
const DRIVE_STORAGE_KEY = 'lsfc_drive_files_v1';
const DRIVE_CONFIG_KEY = 'lsfc_drive_config_v1';

export const getDriveConfig = (): DriveConfig => {
  if (typeof window === 'undefined') {
    return {
      isConnected: true,
      folderRootId: 'root_lsfc_2026',
      folderRootName: 'LSFC_Storage',
      userEmail: 'lsfc.thakurgaon@gmail.com',
      lastSyncTime: new Date().toLocaleTimeString('bn-BD'),
      storageUsed: '২৪.৫ MB (সীমাহীন ড্রাইভ স্পেস)',
      autoSyncEnabled: true,
    };
  }

  const stored = localStorage.getItem(DRIVE_CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
  }

  const defaultConfig: DriveConfig = {
    isConnected: true,
    folderRootId: 'root_lsfc_2026',
    folderRootName: 'LSFC_Storage',
    userEmail: 'lsfc.thakurgaon@gmail.com',
    lastSyncTime: new Date().toLocaleTimeString('bn-BD'),
    storageUsed: '২৪.৫ MB',
    autoSyncEnabled: true,
  };
  localStorage.setItem(DRIVE_CONFIG_KEY, JSON.stringify(defaultConfig));
  return defaultConfig;
};

export const saveDriveConfig = (config: DriveConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DRIVE_CONFIG_KEY, JSON.stringify(config));
  }
};

export const uploadFileToDrive = async (
  fileName: string,
  fileType: DriveFileRecord['fileType'],
  contentBlobOrUrl: string,
  year?: string,
  month?: string
): Promise<DriveFileRecord> => {
  const fileId = 'gdrive_' + Math.random().toString(36).substring(2, 10);
  const currentYear = year || new Date().getFullYear().toString();
  const currentMonth = month || (new Date().getMonth() + 1).toString().padStart(2, '0');

  let targetFolder = 'LSFC_Storage';
  if (fileType === 'receipt_pdf') {
    targetFolder = `LSFC_Storage/Receipts/${currentYear}/${currentMonth}`;
  } else if (fileType === 'statement_pdf') {
    targetFolder = `LSFC_Storage/Statements/${currentYear}`;
  } else if (fileType === 'signature_png' || fileType === 'logo_png') {
    targetFolder = 'LSFC_Storage/Assets';
  } else if (fileType === 'staff_nid') {
    targetFolder = 'LSFC_Storage/Staff_Docs';
  }

  const record: DriveFileRecord = {
    id: fileId,
    fileName,
    fileType,
    driveFolder: targetFolder,
    driveWebUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    driveDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    sizeBytes: Math.floor(Math.random() * 45000) + 15000,
    uploadedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(DRIVE_STORAGE_KEY) || '[]';
    try {
      const existing: DriveFileRecord[] = JSON.parse(existingStr);
      existing.unshift(record);
      localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      // ignore
    }
  }

  return record;
};

export const getDriveFiles = (): DriveFileRecord[] => {
  if (typeof window === 'undefined') return [];
  const existingStr = localStorage.getItem(DRIVE_STORAGE_KEY);
  if (!existingStr) return [];
  try {
    return JSON.parse(existingStr);
  } catch (e) {
    return [];
  }
};
