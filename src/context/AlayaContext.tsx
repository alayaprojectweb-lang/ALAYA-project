import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Washroom,
  Floor,
  CleaningReport,
  CleaningReportType,
  MaintenanceItem,
  CleaningLogEntry,
  MopState,
  HardwareLogEntry,
  TabType,
  Language,
  HardwareSerialData,
  VerificationState,
  SmsDeliveryMode,
  SmsSettings,
  SmsLogEntry,
  ScoreTimelineEvent,
  ScoreFactorDiff,
} from '../types';
import { calculateCUS, calculateRateAndTTT, verifyCleanResult } from '../utils/cusLogic';
import { translations } from '../i18n/translations';

// Phone helpers
export const isValidIndianPhone = (phoneStr: string): boolean => {
  const cleaned = (phoneStr || '').replace(/\D/g, '');
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) return true;
  if (cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned)) return true;
  return false;
};

export const normalizeIndianPhone10 = (phoneStr: string): string => {
  const cleaned = (phoneStr || '').replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  return cleaned.slice(-10);
};

export const formatIndianPhoneE164 = (phoneStr: string): string => {
  const norm10 = normalizeIndianPhone10(phoneStr);
  return norm10.length === 10 ? `+91${norm10}` : phoneStr;
};

export const maskIndianPhone = (phoneStr: string): string => {
  const norm10 = normalizeIndianPhone10(phoneStr);
  if (norm10.length !== 10) return phoneStr || 'N/A';
  return `+91 ${norm10.slice(0, 2)}••••••${norm10.slice(8)}`;
};

const createInitialHourlyHistory = (baseCus: number, baseAir: number, baseFoot: number) => {
  const points = [];
  const now = Date.now();
  for (let i = 60; i >= 0; i -= 10) {
    const timeStr = new Date(now - i * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    points.push({ time: timeStr, cus: baseCus, air: baseAir, foot: baseFoot });
  }
  return points;
};

export const INITIAL_FLOORS: Floor[] = [
  {
    id: 'floor-gf',
    name: 'Ground Floor',
    nameHi: 'भूतल',
    janitorName: 'Ramesh Kumar',
    janitorPhone: '+919876543210',
    smsAlertsActive: true,
  },
  {
    id: 'floor-ff',
    name: 'First Floor',
    nameHi: 'प्रथम तल',
    janitorName: 'Sunita Devi',
    janitorPhone: '+919812345678',
    smsAlertsActive: true,
  },
  {
    id: 'floor-sw',
    name: 'Staff Wing',
    nameHi: 'स्टाफ विंग',
    janitorName: 'Manoj Singh',
    janitorPhone: '+919890123456',
    smsAlertsActive: true,
  },
];

export const INITIAL_WASHROOMS: Washroom[] = [
  {
    id: 'gf-boys',
    name: 'Ground Floor Boys Washroom',
    nameHi: 'भूतल बालक प्रसाधन',
    floor: 'Ground Floor',
    floorId: 'floor-gf',
    floorHi: 'भूतल',
    washroomType: 'Boys',
    location: 'Main Academic Wing - Room G04',
    locationHi: 'मुख्य शैक्षणिक विंग - कक्ष G04',
    airQuality: 10,
    userReports: 0,
    timeSinceLastClean: 0,
    footfall: 0,
    moistureFlag: 0,
    supplyLevel: 100,
    cus: 0,
    status: 'GREEN',
    cusHistory: [0, 0, 0, 0, 0],
    rate: 0,
    timeToThreshold: 'Stable',
    lastCleanedTimestamp: Date.now(),
    lastVerifiedTimestamp: Date.now(),
    lastVerifiedCleanMinAgo: 0,
    isSettling: false,
    settlingSecondsRemaining: 0,
    verificationState: 'VERIFIED',
    settlingAirBefore: 10,
    settlingMoistureBefore: 0,
    isWetFloorAfterMop: false,
    isLiveHardware: true,
    allFineCountSinceClean: 0,
    gasDriftDetected: false,
    hourlyHistory: createInitialHourlyHistory(0, 10, 0),
  },
  {
    id: 'gf-girls',
    name: 'Ground Floor Girls Washroom',
    nameHi: 'भूतल बालिका प्रसाधन',
    floor: 'Ground Floor',
    floorId: 'floor-gf',
    floorHi: 'भूतल',
    washroomType: 'Girls',
    location: 'Main Academic Wing - Room G08',
    locationHi: 'मुख्य शैक्षणिक विंग - कक्ष G08',
    airQuality: 10,
    userReports: 0,
    timeSinceLastClean: 0,
    footfall: 0,
    moistureFlag: 0,
    supplyLevel: 100,
    cus: 0,
    status: 'GREEN',
    cusHistory: [0, 0, 0, 0, 0],
    rate: 0,
    timeToThreshold: 'Stable',
    lastCleanedTimestamp: Date.now(),
    lastVerifiedTimestamp: Date.now(),
    lastVerifiedCleanMinAgo: 0,
    isSettling: false,
    settlingSecondsRemaining: 0,
    verificationState: 'VERIFIED',
    settlingAirBefore: 10,
    settlingMoistureBefore: 0,
    isWetFloorAfterMop: false,
    isLiveHardware: false,
    allFineCountSinceClean: 0,
    gasDriftDetected: false,
    hourlyHistory: createInitialHourlyHistory(0, 10, 0),
  },
  {
    id: 'ff-girls',
    name: 'First Floor Girls Washroom',
    nameHi: 'प्रथम तल बालिका प्रसाधन',
    floor: 'First Floor',
    floorId: 'floor-ff',
    floorHi: 'प्रथम तल',
    washroomType: 'Girls',
    location: 'Upper Science Wing - Room 102',
    locationHi: 'ऊपरी विज्ञान विंग - कक्ष 102',
    airQuality: 10,
    userReports: 0,
    timeSinceLastClean: 0,
    footfall: 0,
    moistureFlag: 0,
    supplyLevel: 100,
    cus: 0,
    status: 'GREEN',
    cusHistory: [0, 0, 0, 0, 0],
    rate: 0,
    timeToThreshold: 'Stable',
    lastCleanedTimestamp: Date.now(),
    lastVerifiedTimestamp: Date.now(),
    lastVerifiedCleanMinAgo: 0,
    isSettling: false,
    settlingSecondsRemaining: 0,
    verificationState: 'VERIFIED',
    settlingAirBefore: 10,
    settlingMoistureBefore: 0,
    isWetFloorAfterMop: false,
    isLiveHardware: false,
    allFineCountSinceClean: 0,
    gasDriftDetected: false,
    hourlyHistory: createInitialHourlyHistory(0, 10, 0),
  },
  {
    id: 'staff-room',
    name: 'Staff Room Washroom',
    nameHi: 'स्टाफ कक्ष प्रसाधन',
    floor: 'Staff Wing',
    floorId: 'floor-sw',
    floorHi: 'स्टाफ विंग',
    washroomType: 'Staff',
    location: 'Faculty Lounge - 1st Floor',
    locationHi: 'संकाय लाउंज - प्रथम तल',
    airQuality: 10,
    userReports: 0,
    timeSinceLastClean: 0,
    footfall: 0,
    moistureFlag: 0,
    supplyLevel: 100,
    cus: 0,
    status: 'GREEN',
    cusHistory: [0, 0, 0, 0, 0],
    rate: 0,
    timeToThreshold: 'Stable',
    lastCleanedTimestamp: Date.now(),
    lastVerifiedTimestamp: Date.now(),
    lastVerifiedCleanMinAgo: 0,
    isSettling: false,
    settlingSecondsRemaining: 0,
    verificationState: 'VERIFIED',
    settlingAirBefore: 10,
    settlingMoistureBefore: 0,
    isWetFloorAfterMop: false,
    isLiveHardware: false,
    allFineCountSinceClean: 0,
    gasDriftDetected: false,
    hourlyHistory: createInitialHourlyHistory(0, 10, 0),
  },
];

const DEFAULT_SMS_SETTINGS: SmsSettings = {
  mode: 'FAST2SMS',
  provider: 'fast2sms',
  fast2smsApiKey: '',
  backendEndpointUrl: '',
  backendAccessKey: '',
  dailyCap: 50,
  minGapMinutes: 5,
  maintenancePhone: '',
};

interface ActiveSmsAlertModal {
  id: string;
  timestamp: number;
  floor: string;
  washroom: string;
  phone: string;
  rawPhone: string;
  message: string;
  mode: SmsDeliveryMode;
  reason: string;
}

interface AlayaContextType {
  // Navigation & Localization
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];

  // Hero & Swachh Bharat Branding
  heroPhoto: string | null;
  setHeroPhoto: (photo: string | null) => void;
  swachhLogo: string | null;
  setSwachhLogo: (logo: string | null) => void;

  // Floors & Washrooms
  floors: Floor[];
  addFloor: (data: { name: string; nameHi?: string; janitorName?: string; janitorPhone: string; smsAlertsActive?: boolean }) => { success: boolean; error?: string };
  updateFloor: (id: string, data: Partial<Floor>) => { success: boolean; error?: string };
  removeFloor: (id: string) => void;

  washrooms: Washroom[];
  activeWashroom: Washroom;
  selectedWashroomId: string;
  setSelectedWashroomId: (id: string) => void;
  addWashroom: (data: {
    name: string;
    nameHi?: string;
    floor: string;
    floorId?: string;
    floorHi?: string;
    washroomType?: Washroom['washroomType'];
    janitorPhoneOverride?: string;
    location: string;
    locationHi?: string;
  }) => { success: boolean; error?: string };
  updateWashroom: (id: string, data: Partial<Washroom>) => void;
  removeWashroom: (id: string) => void;
  updateWashroomParams: (
    washroomId: string,
    params: Partial<Pick<Washroom, 'airQuality' | 'footfall' | 'supplyLevel' | 'moistureFlag' | 'userReports' | 'timeSinceLastClean'>>
  ) => void;

  // Cleaning, Reports & Maintenance
  cleaningReports: CleaningReport[];
  submitReport: (washroomId: string, type: CleaningReportType, text?: string) => { success: boolean; message: string };
  resolveCleaningReport: (id: string) => void;
  maintenanceQueue: MaintenanceItem[];
  resolveMaintenance: (id: string) => void;
  cleaningLogs: CleaningLogEntry[];
  markCleaned: (washroomId: string) => void;
  simulateCleanResult: (washroomId: string, mode: 'VERIFIED' | 'UNVERIFIED') => void;
  mopState: MopState;

  // Exhibition & Simulation
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  isAutoSimulateEnabled: boolean;
  setIsAutoSimulateEnabled: (val: boolean) => void;
  resetAllScoresToClean: () => void;
  runDaySimulation: () => void;
  isSimulatingDay: boolean;
  clearAllData: () => void;
  exportCsvLogs: () => void;

  // Why Did The Score Change
  scoreTimeline: ScoreTimelineEvent[];
  clearScoreTimeline: () => void;
  latestScoreDiff: {
    oldScore: number;
    newScore: number;
    delta: number;
    topFactor: string;
    reasonEn: string;
    reasonHi: string;
    factors: ScoreFactorDiff[];
  };

  // SMS Alert System
  smsSettings: SmsSettings;
  updateSmsSettings: (settings: Partial<SmsSettings>) => void;
  smsLogs: SmsLogEntry[];
  clearSmsLogs: () => void;
  exportSmsLogsCsv: () => void;
  activeSmsModal: ActiveSmsAlertModal | null;
  dismissSmsModal: () => void;
  sendTestSms: (floorId: string, testNumber?: string) => Promise<{ success: boolean; message: string }>;
  checkSmsConnection: (testNumber: string) => Promise<{ success: boolean; message: string }>;
  dailySmsSentCount: number;
  smsFallbackBannerActive: boolean;

  // Admin Auth
  isAdminLoggedIn: boolean;
  adminLogin: (id: string, pass: string) => boolean;
  adminLogout: () => void;

  // Hardware Web Serial
  isHardwareConnected: boolean;
  isVirtualHardware: boolean;
  isIframeRestricted: boolean;
  hardwareStaleWarning: boolean;
  hardwareLogs: HardwareLogEntry[];
  lightMode: 'AUTO' | 'MANUAL';
  setLightMode: (mode: 'AUTO' | 'MANUAL') => void;
  manualLightColor: 'RED' | 'AMBER' | 'GREEN' | 'BLUE' | 'OFF';
  relayActive: boolean;
  secondsSinceLastData: number;
  deviceUptimeSeconds: number;
  connectSerial: () => Promise<void>;
  connectVirtualSerial: () => void;
  disconnectSerial: () => Promise<void>;
  sendSerialCommand: (cmd: string) => Promise<void>;
}

const AlayaContext = createContext<AlayaContextType | null>(null);

export const AlayaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [language, setLanguage] = useState<Language>('en');

  // Hero & Swachh Bharat Media
  const [heroPhoto, setHeroPhotoState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('alaya_hero_photo_v2') || null;
    } catch (_) {
      return null;
    }
  });

  const [swachhLogo, setSwachhLogoState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('alaya_swachh_logo_v2') || null;
    } catch (_) {
      return null;
    }
  });

  const setHeroPhoto = useCallback((photo: string | null) => {
    setHeroPhotoState(photo);
    try {
      if (photo) localStorage.setItem('alaya_hero_photo_v2', photo);
      else localStorage.removeItem('alaya_hero_photo_v2');
    } catch (_) {}
  }, []);

  const setSwachhLogo = useCallback((logo: string | null) => {
    setSwachhLogoState(logo);
    try {
      if (logo) localStorage.setItem('alaya_swachh_logo_v2', logo);
      else localStorage.removeItem('alaya_swachh_logo_v2');
    } catch (_) {}
  }, []);

  // Floors state
  const [floors, setFloors] = useState<Floor[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_floors_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_FLOORS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_floors_v4', JSON.stringify(floors));
    } catch (_) {}
  }, [floors]);

  // Washrooms state
  const [washrooms, setWashrooms] = useState<Washroom[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_washrooms_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_WASHROOMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_washrooms_v4', JSON.stringify(washrooms));
    } catch (_) {}
  }, [washrooms]);

  const [selectedWashroomId, setSelectedWashroomId] = useState<string>('gf-boys');
  const activeWashroom = washrooms.find((w) => w.id === selectedWashroomId) || washrooms[0] || INITIAL_WASHROOMS[0];

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState<SmsSettings>(() => {
    try {
      const saved = localStorage.getItem('alaya_sms_settings_v4');
      if (saved) return { ...DEFAULT_SMS_SETTINGS, ...JSON.parse(saved) };
    } catch (_) {}
    return DEFAULT_SMS_SETTINGS;
  });

  const updateSmsSettings = useCallback((updated: Partial<SmsSettings>) => {
    setSmsSettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('alaya_sms_settings_v4', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  // SMS Logs
  const [smsLogs, setSmsLogs] = useState<SmsLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_sms_logs_v4');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_sms_logs_v4', JSON.stringify(smsLogs));
    } catch (_) {}
  }, [smsLogs]);

  const clearSmsLogs = useCallback(() => {
    setSmsLogs([]);
    try {
      localStorage.removeItem('alaya_sms_logs_v4');
    } catch (_) {}
  }, []);

  const [activeSmsModal, setActiveSmsModal] = useState<ActiveSmsAlertModal | null>(null);
  const dismissSmsModal = useCallback(() => setActiveSmsModal(null), []);

  const [smsFallbackBannerActive, setSmsFallbackBannerActive] = useState<boolean>(false);

  // Daily SMS count
  const dailySmsSentCount = useMemo(() => {
    const today = new Date().toDateString();
    return smsLogs.filter((l) => new Date(l.timestamp).toDateString() === today && l.status !== 'Failed').length;
  }, [smsLogs]);

  // Anti-spam references
  const lastSmsSentMapRef = useRef<Record<string, number>>({});
  const lastSmsStatusMapRef = useRef<Record<string, string>>({});

  // Cleaning Reports & Maintenance
  const [cleaningReports, setCleaningReports] = useState<CleaningReport[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_cleaning_reports_v4');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_cleaning_reports_v4', JSON.stringify(cleaningReports));
    } catch (_) {}
  }, [cleaningReports]);

  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_maintenance_v4');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_maintenance_v4', JSON.stringify(maintenanceQueue));
    } catch (_) {}
  }, [maintenanceQueue]);

  const [cleaningLogs, setCleaningLogs] = useState<CleaningLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_logs_v4');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_logs_v4', JSON.stringify(cleaningLogs));
    } catch (_) {}
  }, [cleaningLogs]);

  // Score Timeline & Change Explanation
  const [scoreTimeline, setScoreTimeline] = useState<ScoreTimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_score_timeline_v4');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('alaya_score_timeline_v4', JSON.stringify(scoreTimeline));
    } catch (_) {}
  }, [scoreTimeline]);

  const clearScoreTimeline = useCallback(() => {
    setScoreTimeline([]);
    try {
      localStorage.removeItem('alaya_score_timeline_v4');
    } catch (_) {}
  }, []);

  const [latestScoreDiff, setLatestScoreDiff] = useState<{
    oldScore: number;
    newScore: number;
    delta: number;
    topFactor: string;
    reasonEn: string;
    reasonHi: string;
    factors: ScoreFactorDiff[];
  }>({
    oldScore: 0,
    newScore: 0,
    delta: 0,
    topFactor: 'Stable Baseline',
    reasonEn: 'Washroom is at pristine clean baseline.',
    reasonHi: 'प्रसाधन पूर्णतः साफ़ और सामान्य स्थिति में है।',
    factors: [],
  });

  // Admin Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alaya_admin_auth_v2') === 'true';
    } catch (_) {
      return false;
    }
  });

  const adminLogin = useCallback((id: string, pass: string): boolean => {
    const cleanId = id.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (cleanId === 'admin' && (cleanPass === 'admin' || cleanPass === 'alaya2026' || cleanPass === 'admin123')) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem('alaya_admin_auth_v2', 'true');
      } catch (_) {}
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('alaya_admin_auth_v2');
    } catch (_) {}
  }, []);

  // Simulation controls
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isAutoSimulateEnabled, setIsAutoSimulateEnabled] = useState<boolean>(false);
  const [isSimulatingDay, setIsSimulatingDay] = useState<boolean>(false);

  // Mop State
  const [mopState, setMopState] = useState<MopState>({
    status: 'docked',
    runtimeMinutesToday: 32,
  });

  // Hardware State
  const [isHardwareConnected, setIsHardwareConnected] = useState<boolean>(false);
  const [isVirtualHardware, setIsVirtualHardware] = useState<boolean>(false);
  const [isIframeRestricted, setIsIframeRestricted] = useState<boolean>(false);
  const [hardwareStaleWarning, setHardwareStaleWarning] = useState<boolean>(false);
  const [hardwareLogs, setHardwareLogs] = useState<HardwareLogEntry[]>([
    {
      time: new Date().toLocaleTimeString(),
      message: 'ALAYA System Initialized. Simulator active. Web Serial ready.',
      type: 'info',
    },
  ]);
  const [lightMode, setLightMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualLightColor, setManualLightColor] = useState<'RED' | 'AMBER' | 'GREEN' | 'BLUE' | 'OFF'>('OFF');
  const [relayActive, setRelayActive] = useState<boolean>(false);
  const [secondsSinceLastData, setSecondsSinceLastData] = useState<number>(0);
  const [deviceUptimeSeconds, setDeviceUptimeSeconds] = useState<number>(0);

  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);
  const virtualIntervalRef = useRef<any>(null);
  const lastPacketTimestampRef = useRef<number>(Date.now());
  const reportRateLimitsRef = useRef<Record<string, number>>({});

  const addHardwareLog = useCallback((message: string, type: 'rx' | 'tx' | 'err' | 'info' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setHardwareLogs((prev) => [{ time, message, type }, ...prev.slice(0, 100)]);
  }, []);

  // SMS Dispatcher Core
  const dispatchSmsInternal = useCallback(
    async (params: {
      floorName: string;
      washroomName: string;
      phone: string;
      reason: string;
      cus: number;
      status: string;
      isFault?: boolean;
      isTest?: boolean;
    }) => {
      const { floorName, washroomName, phone, reason, cus, status, isFault, isTest } = params;

      if (!isValidIndianPhone(phone)) {
        console.warn('Invalid phone format for SMS dispatch:', phone);
        return { success: false, message: 'Invalid phone format' };
      }

      const raw10 = normalizeIndianPhone10(phone);
      const masked = maskIndianPhone(phone);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Construct compliant message (<= 160 characters)
      let smsText = isTest
        ? `ALAYA: Test alert for ${floorName}. System online. ${timeStr}`
        : `ALAYA: ${floorName} - ${washroomName} needs cleaning. ${reason}. Score ${cus} (${status}). ${timeStr}`;

      if (smsText.length > 160) {
        const overflow = smsText.length - 160;
        const shortenedReason = reason.slice(0, Math.max(10, reason.length - overflow - 3)) + '...';
        smsText = `ALAYA: ${floorName} - ${washroomName} needs cleaning. ${shortenedReason}. Score ${cus} (${status}). ${timeStr}`;
        if (smsText.length > 160) {
          smsText = smsText.slice(0, 160);
        }
      }

      const logId = 'sms-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

      // Check daily cap (unless it's a test)
      if (!isTest && dailySmsSentCount >= smsSettings.dailyCap) {
        console.warn('Daily SMS cap reached');
        setSmsLogs((prev) => [
          {
            id: logId,
            timestamp: Date.now(),
            floor: floorName,
            washroom: washroomName,
            phone: masked,
            rawPhone: raw10,
            message: smsText,
            status: 'Failed',
            error: 'Daily SMS cap reached',
            isTest,
          },
          ...prev,
        ]);
        return { success: false, message: 'Daily SMS cap reached' };
      }

      // Check mode
      let targetMode = smsSettings.mode;

      // If API mode but endpoint is missing, fallback to DEMO
      if (targetMode === 'API' && (!smsSettings.backendEndpointUrl || !smsSettings.backendEndpointUrl.trim())) {
        targetMode = 'DEMO';
        setSmsFallbackBannerActive(true);
      }

      // 1. DEMO MODE
      if (targetMode === 'DEMO') {
        const logEntry: SmsLogEntry = {
          id: logId,
          timestamp: Date.now(),
          floor: floorName,
          washroom: washroomName,
          phone: masked,
          rawPhone: raw10,
          message: smsText,
          status: 'Simulated',
          isTest,
        };
        setSmsLogs((prev) => [logEntry, ...prev]);

        // Show mobile-style popup notification
        setActiveSmsModal({
          id: logId,
          timestamp: Date.now(),
          floor: floorName,
          washroom: washroomName,
          phone: masked,
          rawPhone: raw10,
          message: smsText,
          mode: 'DEMO',
          reason,
        });

        return { success: true, message: 'Simulated SMS notification triggered' };
      }

      // 2. LINK MODE
      if (targetMode === 'LINK') {
        const logEntry: SmsLogEntry = {
          id: logId,
          timestamp: Date.now(),
          floor: floorName,
          washroom: washroomName,
          phone: masked,
          rawPhone: raw10,
          message: smsText,
          status: 'Opened in app',
          isTest,
        };
        setSmsLogs((prev) => [logEntry, ...prev]);

        // Show popup with direct WhatsApp and SMS action buttons
        setActiveSmsModal({
          id: logId,
          timestamp: Date.now(),
          floor: floorName,
          washroom: washroomName,
          phone: masked,
          rawPhone: raw10,
          message: smsText,
          mode: 'LINK',
          reason,
        });

        return { success: true, message: 'SMS and WhatsApp links generated' };
      }

      // 3. FAST2SMS (Real Direct Mobile Carrier SMS via Fast2SMS)
      if (targetMode === 'FAST2SMS') {
        const apiKey = smsSettings.fast2smsApiKey || smsSettings.backendAccessKey;
        try {
          const res = await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: raw10,
              message: smsText,
              provider: 'fast2sms',
              apiKey: apiKey,
            }),
          });
          const data: any = await res.json().catch(() => ({}));

          if (res.ok && data?.success === true) {
            setSmsLogs((prev) => [
              {
                id: logId,
                timestamp: Date.now(),
                floor: floorName,
                washroom: washroomName,
                phone: masked,
                rawPhone: raw10,
                message: smsText,
                status: 'Sent',
                isTest,
              },
              ...prev,
            ]);
            setSmsFallbackBannerActive(false);

            setActiveSmsModal({
              id: logId,
              timestamp: Date.now(),
              floor: floorName,
              washroom: washroomName,
              phone: masked,
              rawPhone: raw10,
              message: smsText,
              mode: 'FAST2SMS',
              reason: `${reason} • Direct Carrier SMS Sent!`,
            });

            return { success: true, message: `Real SMS delivered directly to +91 ${raw10} via Fast2SMS!` };
          } else {
            throw new Error(data?.message || data?.error || 'Fast2SMS API delivery error');
          }
        } catch (apiErr: any) {
          setSmsLogs((prev) => [
            {
              id: logId,
              timestamp: Date.now(),
              floor: floorName,
              washroom: washroomName,
              phone: masked,
              rawPhone: raw10,
              message: smsText,
              status: 'Failed',
              error: apiErr?.message || 'Fast2SMS error',
              isTest,
            },
            ...prev,
          ]);

          // Seamless fallback: Show 1-Click WhatsApp & SMS app buttons so the message STILL reaches the phone without interruption!
          setSmsFallbackBannerActive(true);
          setActiveSmsModal({
            id: logId,
            timestamp: Date.now(),
            floor: floorName,
            washroom: washroomName,
            phone: masked,
            rawPhone: raw10,
            message: smsText,
            mode: 'LINK',
            reason: `${reason} (${apiErr?.message || 'Tap below to send directly via phone app'})`,
          });

          return { success: false, message: apiErr?.message || 'Carrier SMS failed. 1-click links ready.' };
        }
      }

      // 4. API MODE (Custom Webhook / Twilio)
      if (targetMode === 'API') {
        const sendAttempt = async (): Promise<boolean> => {
          const res = await fetch(smsSettings.backendEndpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-ALAYA-Key': smsSettings.backendAccessKey || '',
            },
            body: JSON.stringify({
              phone: raw10,
              message: smsText,
            }),
          });
          const data = await res.json().catch(() => ({}));
          return res.ok && (data.ok === true || data.success === true || res.status === 200);
        };

        try {
          let ok = false;
          try {
            ok = await sendAttempt();
          } catch (netErr) {
            // Retry once after 5 seconds on network error
            await new Promise((r) => setTimeout(r, 5000));
            ok = await sendAttempt();
          }

          if (ok) {
            setSmsLogs((prev) => [
              {
                id: logId,
                timestamp: Date.now(),
                floor: floorName,
                washroom: washroomName,
                phone: masked,
                rawPhone: raw10,
                message: smsText,
                status: 'Sent',
                isTest,
              },
              ...prev,
            ]);
            setSmsFallbackBannerActive(false);
            return { success: true, message: 'SMS successfully dispatched via backend gateway' };
          } else {
            throw new Error('Backend rejected request or returned error');
          }
        } catch (apiErr: any) {
          setSmsLogs((prev) => [
            {
              id: logId,
              timestamp: Date.now(),
              floor: floorName,
              washroom: washroomName,
              phone: masked,
              rawPhone: raw10,
              message: smsText,
              status: 'Failed',
              error: apiErr?.message || 'Gateway connection error',
              isTest,
            },
            ...prev,
          ]);

          // Auto fallback to demo mode notification so user experience is uninterrupted
          setSmsFallbackBannerActive(true);
          setActiveSmsModal({
            id: logId,
            timestamp: Date.now(),
            floor: floorName,
            washroom: washroomName,
            phone: masked,
            rawPhone: raw10,
            message: smsText,
            mode: 'DEMO',
            reason: `${reason} (Fallback: API Failed)`,
          });

          return { success: false, message: `Failed to deliver via API: ${apiErr?.message || 'Error'}` };
        }
      }

      return { success: false, message: 'Unknown mode' };
    },
    [dailySmsSentCount, smsSettings]
  );

  // Trigger evaluation for auto SMS alerts
  const checkAndTriggerSmsAlert = useCallback(
    (washroomId: string, triggerReason: string, force: boolean = false) => {
      const targetW = washrooms.find((w) => w.id === washroomId);
      if (!targetW) return;

      const targetFloor = floors.find((f) => f.id === targetW.floorId || f.name === targetW.floor) || floors[0];
      if (!targetFloor || (!targetFloor.smsAlertsActive && !force)) return;

      const targetPhone = targetW.janitorPhoneOverride && isValidIndianPhone(targetW.janitorPhoneOverride)
        ? targetW.janitorPhoneOverride
        : targetFloor.janitorPhone;

      if (!targetPhone || !isValidIndianPhone(targetPhone)) return;

      const now = Date.now();
      const lastSentTime = lastSmsSentMapRef.current[washroomId] || 0;
      const minGapMs = (smsSettings.minGapMinutes || 10) * 60 * 1000;

      // Rate limit check
      if (!force && now - lastSentTime < minGapMs) {
        return;
      }

      // Check if status repeated without change
      if (!force && triggerReason === 'Status Red' && lastSmsStatusMapRef.current[washroomId] === 'RED') {
        return;
      }

      lastSmsSentMapRef.current[washroomId] = now;
      lastSmsStatusMapRef.current[washroomId] = targetW.status;

      dispatchSmsInternal({
        floorName: targetW.floor,
        washroomName: targetW.name,
        phone: targetPhone,
        reason: triggerReason,
        cus: targetW.cus,
        status: targetW.status === 'RED' ? 'Urgent' : targetW.status === 'AMBER' ? 'Needs Checking' : 'Clean',
      });
    },
    [washrooms, floors, smsSettings, dispatchSmsInternal]
  );

  // Send Test SMS button per floor
  const sendTestSms = useCallback(
    async (floorId: string, testNumber?: string): Promise<{ success: boolean; message: string }> => {
      const flr = floors.find((f) => f.id === floorId) || floors[0];
      if (!flr) return { success: false, message: 'Floor not found' };

      const phoneToUse = testNumber && isValidIndianPhone(testNumber) ? testNumber : flr.janitorPhone;
      if (!isValidIndianPhone(phoneToUse)) {
        return { success: false, message: 'Please provide a valid 10-digit Indian phone number (starting 6,7,8,9).' };
      }

      return await dispatchSmsInternal({
        floorName: flr.name,
        washroomName: 'All Floor Washrooms',
        phone: phoneToUse,
        reason: 'Manual test dispatch',
        cus: 0,
        status: 'Operational',
        isTest: true,
      });
    },
    [floors, dispatchSmsInternal]
  );

  // Connection check button in SMS settings
  const checkSmsConnection = useCallback(
    async (testNumber: string): Promise<{ success: boolean; message: string }> => {
      if (!isValidIndianPhone(testNumber)) {
        return { success: false, message: 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.' };
      }
      return await dispatchSmsInternal({
        floorName: 'Admin Hub',
        washroomName: 'System Gateway Check',
        phone: testNumber,
        reason: 'Connectivity Probe',
        cus: 0,
        status: 'Checking',
        isTest: true,
      });
    },
    [dispatchSmsInternal]
  );

  // Export SMS Logs as CSV
  const exportSmsLogsCsv = useCallback(() => {
    if (smsLogs.length === 0) return;
    const headers = ['Timestamp', 'Date_Time', 'Floor', 'Washroom', 'Phone_Masked', 'Phone_Raw', 'Status', 'Message', 'Error'];
    const rows = smsLogs.map((l) => [
      l.timestamp,
      new Date(l.timestamp).toISOString(),
      `"${l.floor}"`,
      `"${l.washroom}"`,
      `"${l.phone}"`,
      `"${l.rawPhone}"`,
      `"${l.status}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${(l.error || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALAYA_Janitor_SMS_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [smsLogs]);

  // Compute "Why did the score change?" factors and sentences
  const recordScoreDelta = useCallback(
    (
      targetW: Washroom,
      oldW: Washroom,
      triggerLabel: string = 'Sensor update'
    ) => {
      const oldBreakdown = calculateCUS({
        airQuality: oldW.airQuality,
        userReportsCount: oldW.userReports,
        timeSinceLastClean: oldW.timeSinceLastClean,
        footfall: oldW.footfall,
        moistureFlag: oldW.moistureFlag,
        supplyLevel: oldW.supplyLevel,
        previousStatus: oldW.status,
        isWetFloorAfterMop: oldW.isWetFloorAfterMop,
      }).breakdown;

      const newBreakdown = calculateCUS({
        airQuality: targetW.airQuality,
        userReportsCount: targetW.userReports,
        timeSinceLastClean: targetW.timeSinceLastClean,
        footfall: targetW.footfall,
        moistureFlag: targetW.moistureFlag,
        supplyLevel: targetW.supplyLevel,
        previousStatus: targetW.status,
        isWetFloorAfterMop: targetW.isWetFloorAfterMop,
      }).breakdown;

      const airDiff = +(newBreakdown.airQualityScore - oldBreakdown.airQualityScore).toFixed(1);
      const repDiff = +(newBreakdown.userReportsScore - oldBreakdown.userReportsScore).toFixed(1);
      const timeDiff = +(newBreakdown.timeScore - oldBreakdown.timeScore).toFixed(1);
      const footDiff = +(newBreakdown.footfallScore - oldBreakdown.footfallScore).toFixed(1);
      const moistDiff = +(newBreakdown.moistureScore - oldBreakdown.moistureScore).toFixed(1);
      const supplyDiff = -(newBreakdown.supplyDeduction - oldBreakdown.supplyDeduction); // negative impact on score

      const factors: ScoreFactorDiff[] = [
        {
          name: 'Air & Odor Level (NH₃)',
          oldVal: oldW.airQuality,
          newVal: targetW.airQuality,
          weight: 0.25,
          pointsChange: airDiff,
          color: '#1F5BFF',
          desc: 'MQ-135 chemical sniffer index',
        },
        {
          name: 'Crowdsourced Reports',
          oldVal: oldW.userReports,
          newVal: targetW.userReports,
          weight: 0.20,
          pointsChange: repDiff,
          color: '#FFB020',
          desc: 'Student and visitor report count',
        },
        {
          name: 'Floor Wetness',
          oldVal: oldW.moistureFlag ? 'WET' : 'DRY',
          newVal: targetW.moistureFlag ? 'WET' : 'DRY',
          weight: 0.15,
          pointsChange: moistDiff,
          color: '#1F5BFF',
          desc: 'Floor conductivity sensor flag',
        },
        {
          name: 'Time Since Clean',
          oldVal: `${Math.round(oldW.timeSinceLastClean)}m`,
          newVal: `${Math.round(targetW.timeSinceLastClean)}m`,
          weight: 0.15,
          pointsChange: timeDiff,
          color: '#8A94B2',
          desc: 'Minutes elapsed since last clean',
        },
        {
          name: 'Entries (Footfall)',
          oldVal: oldW.footfall,
          newVal: targetW.footfall,
          weight: 0.15,
          pointsChange: footDiff,
          color: '#C6FF00',
          desc: 'PIR motion entries',
        },
        {
          name: 'Soap & Paper Supply',
          oldVal: `${oldW.supplyLevel}%`,
          newVal: `${targetW.supplyLevel}%`,
          weight: 0.10,
          pointsChange: +supplyDiff.toFixed(1),
          color: '#C6FF00',
          desc: 'Supply deducted from urgency',
        },
      ].sort((a, b) => Math.abs(b.pointsChange) - Math.abs(a.pointsChange));

      const delta = targetW.cus - oldW.cus;
      const top = factors[0];

      // Formulate English & Hindi sentences
      let reasonEn = 'Score remains stable and balanced.';
      let reasonHi = 'स्कोर स्थिर एवं संतुलित है।';

      if (delta > 0) {
        if (targetW.userReports > oldW.userReports && airDiff > 0) {
          reasonEn = `Score rose mainly because air quality worsened (+${airDiff} pts) and ${targetW.userReports - oldW.userReports} new report came in (+${repDiff} pts).`;
          reasonHi = `हवा की गुणवत्ता खराब होने (+${airDiff} अंक) और नई शिकायत आने (+${repDiff} अंक) के कारण स्कोर बढ़ा।`;
        } else if (targetW.moistureFlag && !oldW.moistureFlag) {
          reasonEn = `Score rose by +15 pts due to wet floor detected on conductive sensors.`;
          reasonHi = `सेंसर द्वारा फर्श पर पानी पाए जाने के कारण स्कोर में 15 अंक बढ़े।`;
        } else if (top && Math.abs(top.pointsChange) > 0) {
          reasonEn = `Score rose mainly because ${top.name.toLowerCase()} changed (+${top.pointsChange} pts).`;
          reasonHi = `${top.name} में बदलाव (+${top.pointsChange} अंक) के कारण स्कोर बढ़ा।`;
        }
      } else if (delta < 0) {
        if (targetW.cus === 0) {
          reasonEn = `Score dropped to 0 because the room was verified clean and reset.`;
          reasonHi = `कमरे के साफ़ होने और सत्यापन के बाद स्कोर घटकर 0 हो गया।`;
        } else {
          reasonEn = `Score improved as air cleared and supplies were replenished.`;
          reasonHi = `हवा साफ़ होने और आपूर्ति भरने से स्वच्छता स्कोर में सुधार हुआ।`;
        }
      }

      // Check band change
      if (oldW.status !== targetW.status) {
        reasonEn += ` Band changed from ${oldW.status} → ${targetW.status}.`;
        reasonHi += ` स्थिति ${oldW.status} से बदलकर ${targetW.status} हो गई।`;
      }

      const diffObj = {
        oldScore: oldW.cus,
        newScore: targetW.cus,
        delta,
        topFactor: top ? top.name : 'Stable',
        reasonEn,
        reasonHi,
        factors,
      };

      setLatestScoreDiff(diffObj);

      // Add to timeline
      if (Math.abs(delta) > 0 || oldW.status !== targetW.status) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const timelineItem: ScoreTimelineEvent = {
          id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
          time: timeNow,
          timestamp: Date.now(),
          washroomId: targetW.id,
          washroomName: targetW.name,
          oldScore: oldW.cus,
          newScore: targetW.cus,
          oldStatus: oldW.status,
          newStatus: targetW.status,
          reasonEn,
          reasonHi,
          topFactor: top?.name,
          factors,
          trigger: triggerLabel,
        };
        setScoreTimeline((prev) => [timelineItem, ...prev.slice(0, 19)]);
      }
    },
    []
  );

  // Add Floor
  const addFloor = useCallback(
    (data: { name: string; nameHi?: string; janitorName?: string; janitorPhone: string; smsAlertsActive?: boolean }) => {
      if (!data.name || !data.name.trim()) return { success: false, error: 'Floor name is required.' };
      if (!isValidIndianPhone(data.janitorPhone)) {
        return { success: false, error: 'Enter a valid 10-digit Indian phone number starting with 6, 7, 8 or 9.' };
      }

      const id = 'floor-' + Date.now();
      const newFloor: Floor = {
        id,
        name: data.name.trim(),
        nameHi: data.nameHi || data.name.trim(),
        janitorName: data.janitorName?.trim() || 'Floor Janitor',
        janitorPhone: formatIndianPhoneE164(data.janitorPhone),
        smsAlertsActive: data.smsAlertsActive ?? true,
      };

      setFloors((prev) => [...prev, newFloor]);
      return { success: true };
    },
    []
  );

  // Update Floor
  const updateFloor = useCallback((id: string, data: Partial<Floor>) => {
    if (data.janitorPhone && !isValidIndianPhone(data.janitorPhone)) {
      return { success: false, error: 'Enter a valid 10-digit Indian mobile number.' };
    }
    setFloors((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        return {
          ...f,
          ...data,
          janitorPhone: data.janitorPhone ? formatIndianPhoneE164(data.janitorPhone) : f.janitorPhone,
        };
      })
    );
    return { success: true };
  }, []);

  // Remove Floor
  const removeFloor = useCallback((id: string) => {
    setFloors((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Add Washroom
  const addWashroom = useCallback(
    (data: {
      name: string;
      nameHi?: string;
      floor: string;
      floorId?: string;
      floorHi?: string;
      washroomType?: Washroom['washroomType'];
      janitorPhoneOverride?: string;
      location: string;
      locationHi?: string;
    }) => {
      if (!data.name.trim()) return { success: false, error: 'Washroom name is required.' };
      if (data.janitorPhoneOverride && !isValidIndianPhone(data.janitorPhoneOverride)) {
        return { success: false, error: 'Invalid override phone number. Must be 10 digits starting with 6-9.' };
      }

      const newId = 'w-' + Date.now();
      const matchedFloor = floors.find((f) => f.id === data.floorId || f.name === data.floor);

      const newW: Washroom = {
        id: newId,
        name: data.name.trim(),
        nameHi: data.nameHi || data.name.trim(),
        floor: matchedFloor ? matchedFloor.name : data.floor || 'Ground Floor',
        floorId: matchedFloor?.id,
        floorHi: data.floorHi || data.floor,
        washroomType: data.washroomType || 'Unisex',
        janitorPhoneOverride: data.janitorPhoneOverride ? formatIndianPhoneE164(data.janitorPhoneOverride) : undefined,
        location: data.location || 'School Campus',
        locationHi: data.locationHi || 'विद्यालय परिसर',
        airQuality: 10,
        userReports: 0,
        timeSinceLastClean: 0,
        footfall: 0,
        moistureFlag: 0,
        supplyLevel: 100,
        cus: 0,
        status: 'GREEN',
        cusHistory: [0, 0, 0, 0, 0],
        rate: 0,
        timeToThreshold: 'Stable',
        lastCleanedTimestamp: Date.now(),
        lastVerifiedTimestamp: Date.now(),
        lastVerifiedCleanMinAgo: 0,
        isSettling: false,
        settlingSecondsRemaining: 0,
        verificationState: 'VERIFIED',
        settlingAirBefore: 10,
        settlingMoistureBefore: 0,
        isWetFloorAfterMop: false,
        isLiveHardware: false,
        allFineCountSinceClean: 0,
        gasDriftDetected: false,
        hourlyHistory: createInitialHourlyHistory(0, 10, 0),
      };

      setWashrooms((prev) => [...prev, newW]);
      setSelectedWashroomId(newId);
      return { success: true };
    },
    [floors]
  );

  // Update Washroom
  const updateWashroom = useCallback((id: string, data: Partial<Washroom>) => {
    setWashrooms((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          ...data,
          janitorPhoneOverride: data.janitorPhoneOverride ? formatIndianPhoneE164(data.janitorPhoneOverride) : w.janitorPhoneOverride,
        };
      })
    );
  }, []);

  // Remove Washroom
  const removeWashroom = useCallback(
    (id: string) => {
      setWashrooms((prev) => {
        const remaining = prev.filter((w) => w.id !== id);
        if (selectedWashroomId === id && remaining.length > 0) {
          setSelectedWashroomId(remaining[0].id);
        }
        return remaining;
      });
    },
    [selectedWashroomId]
  );

  // Update Washroom parameters (Sliders / Simulator / Real-time)
  const updateWashroomParams = useCallback(
    (
      washroomId: string,
      params: Partial<Pick<Washroom, 'airQuality' | 'footfall' | 'supplyLevel' | 'moistureFlag' | 'userReports' | 'timeSinceLastClean'>>
    ) => {
      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== washroomId) return w;

          const oldW = { ...w };

          const nextAir = params.airQuality !== undefined ? params.airQuality : w.airQuality;
          const nextFoot = params.footfall !== undefined ? params.footfall : w.footfall;
          const nextSupply = params.supplyLevel !== undefined ? params.supplyLevel : w.supplyLevel;
          const nextMoist = params.moistureFlag !== undefined ? params.moistureFlag : w.moistureFlag;
          const nextReports = params.userReports !== undefined ? params.userReports : w.userReports;
          const nextTime = params.timeSinceLastClean !== undefined ? params.timeSinceLastClean : w.timeSinceLastClean;

          const recalculated = calculateCUS({
            airQuality: nextAir,
            userReportsCount: nextReports,
            timeSinceLastClean: nextTime,
            footfall: nextFoot,
            moistureFlag: nextMoist,
            supplyLevel: nextSupply,
            previousStatus: w.status,
            isWetFloorAfterMop: w.isWetFloorAfterMop,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          const updated: Washroom = {
            ...w,
            airQuality: nextAir,
            footfall: nextFoot,
            supplyLevel: nextSupply,
            moistureFlag: nextMoist,
            userReports: nextReports,
            timeSinceLastClean: nextTime,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
          };

          // Record delta reason for Why Did Score Change panel
          recordScoreDelta(updated, oldW, 'Simulator Adjust');

          return updated;
        })
      );
    },
    [recordScoreDelta]
  );

  // Submit User Report from Public Status
  const submitReport = useCallback(
    (washroomId: string, type: CleaningReportType, text?: string): { success: boolean; message: string } => {
      const now = Date.now();
      const rateLimitKey = `${type}_${washroomId}`;
      const lastReportTime = reportRateLimitsRef.current[rateLimitKey] || 0;

      if (now - lastReportTime < 120000 && type !== 'all_fine') {
        const remainingSeconds = Math.ceil((120000 - (now - lastReportTime)) / 1000);
        return {
          success: false,
          message: `Rate limit active: Please wait ${remainingSeconds}s before reporting "${type}" again.`,
        };
      }

      reportRateLimitsRef.current[rateLimitKey] = now;

      const targetWashroom = washrooms.find((w) => w.id === washroomId);
      const washroomName = targetWashroom?.name || 'Washroom';
      const floorName = targetWashroom?.floor || 'Ground Floor';

      // 1. FAULT REPORT (something broken / plumbing defect)
      if (type === 'something_broken') {
        const maintItem: MaintenanceItem = {
          id: 'maint-' + Date.now(),
          timestamp: now,
          washroomId,
          washroomName,
          floor: floorName,
          fault: text || 'Fixture or plumbing defect reported by visitor',
          detail: text,
          resolved: false,
        };
        setMaintenanceQueue((prev) => [maintItem, ...prev]);

        // If maintenance phone number is configured, dispatch SMS to maintenance; otherwise route to floor janitor
        const targetFloor = floors.find((f) => f.id === targetWashroom?.floorId || f.name === targetWashroom?.floor) || floors[0];
        const phoneToUse = smsSettings.maintenancePhone && isValidIndianPhone(smsSettings.maintenancePhone)
          ? smsSettings.maintenancePhone
          : targetWashroom?.janitorPhoneOverride || targetFloor?.janitorPhone;

        if (phoneToUse && isValidIndianPhone(phoneToUse)) {
          dispatchSmsInternal({
            floorName,
            washroomName,
            phone: phoneToUse,
            reason: text ? `Defect: ${text}` : 'Fixture or plumbing defect reported',
            cus: targetWashroom?.cus || 0,
            status: 'Fault Ticket',
            isFault: true,
          });
        }

        return {
          success: true,
          message: 'Maintenance ticket created for repairs team.',
        };
      }

      // 2. ALL FINE REPORT
      if (type === 'all_fine') {
        setWashrooms((prev) =>
          prev.map((w) => {
            if (w.id !== washroomId) return w;
            const nextAllFineCount = w.allFineCountSinceClean + 1;
            const driftDetected = w.cus >= 50 && nextAllFineCount >= 2;
            return {
              ...w,
              allFineCountSinceClean: nextAllFineCount,
              gasDriftDetected: driftDetected,
            };
          })
        );
        return {
          success: true,
          message: 'Status logged: Room verified fine by visitor.',
        };
      }

      // 3. CLEANING REPORTS (floor wet, no soap, bad smell, bin full)
      const report: CleaningReport = {
        id: 'rep-' + Date.now(),
        timestamp: now,
        washroomId,
        washroomName,
        floor: floorName,
        type,
        text,
        resolved: false,
      };
      setCleaningReports((prev) => [report, ...prev]);

      const reportLabel =
        type === 'floor_wet'
          ? 'Floor wet report'
          : type === 'no_soap'
          ? 'No soap report'
          : type === 'bad_smell'
          ? 'Bad odor report'
          : 'Bin full report';

      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== washroomId) return w;

          const oldW = { ...w };
          const nextReportsCount = w.userReports + 1;
          const nextMoisture = type === 'floor_wet' ? 1 : w.moistureFlag;

          const recalculated = calculateCUS({
            airQuality: w.airQuality + (type === 'bad_smell' ? 25 : 0),
            userReportsCount: nextReportsCount,
            timeSinceLastClean: w.timeSinceLastClean,
            footfall: w.footfall,
            moistureFlag: nextMoisture,
            supplyLevel: type === 'no_soap' ? 15 : w.supplyLevel,
            previousStatus: w.status,
            isWetFloorAfterMop: w.isWetFloorAfterMop,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          if (w.isLiveHardware && isHardwareConnected) {
            sendSerialCommand(`REPORTS:${nextReportsCount}`);
          }

          const updated: Washroom = {
            ...w,
            userReports: nextReportsCount,
            moistureFlag: nextMoisture,
            airQuality: Math.min(100, w.airQuality + (type === 'bad_smell' ? 25 : 0)),
            supplyLevel: type === 'no_soap' ? 15 : w.supplyLevel,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
          };

          recordScoreDelta(updated, oldW, reportLabel);
          return updated;
        })
      );

      // SMS TRIGGER: Dispatch alert to the janitor of this floor specifically because a consumer reported an issue
      checkAndTriggerSmsAlert(washroomId, reportLabel, true);

      return {
        success: true,
        message: 'Sent to the cleaning team',
      };
    },
    [washrooms, floors, smsSettings, isHardwareConnected, recordScoreDelta, checkAndTriggerSmsAlert, dispatchSmsInternal]
  );

  // Resolve specific cleaning report
  const resolveCleaningReport = useCallback((reportId: string) => {
    let matchedWashroomId = '';
    let matchedType: CleaningReportType | null = null;

    setCleaningReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          matchedWashroomId = r.washroomId;
          matchedType = r.type;
          return { ...r, resolved: true, resolvedAt: Date.now() };
        }
        return r;
      })
    );

    if (matchedWashroomId) {
      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== matchedWashroomId) return w;
          const oldW = { ...w };
          const nextReports = Math.max(0, w.userReports - 1);
          const nextMoist = matchedType === 'floor_wet' ? 0 : w.moistureFlag;
          const nextSupply = matchedType === 'no_soap' ? 100 : w.supplyLevel;

          const recalculated = calculateCUS({
            airQuality: w.airQuality,
            userReportsCount: nextReports,
            timeSinceLastClean: w.timeSinceLastClean,
            footfall: w.footfall,
            moistureFlag: nextMoist,
            supplyLevel: nextSupply,
            previousStatus: w.status,
            isWetFloorAfterMop: w.isWetFloorAfterMop,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          const updated: Washroom = {
            ...w,
            userReports: nextReports,
            moistureFlag: nextMoist,
            supplyLevel: nextSupply,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
          };

          recordScoreDelta(updated, oldW, 'Report Resolved');
          return updated;
        })
      );
    }
  }, [recordScoreDelta]);

  // Mark Cleaned Button & Verification window
  const markCleaned = useCallback(
    (washroomId: string) => {
      const settlingDuration = demoMode ? 60 : 600;

      // Mark all pending reports for this room as resolved
      setCleaningReports((prev) =>
        prev.map((r) =>
          r.washroomId === washroomId && !r.resolved ? { ...r, resolved: true, resolvedAt: Date.now() } : r
        )
      );

      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== washroomId) return w;
          return {
            ...w,
            isSettling: true,
            settlingSecondsRemaining: settlingDuration,
            verificationState: 'SETTLING',
            settlingAirBefore: w.airQuality,
            settlingMoistureBefore: w.moistureFlag,
            isWetFloorAfterMop: true,
            status: 'WET_FLOOR',
          };
        })
      );

      const target = washrooms.find((w) => w.id === washroomId);
      if (target?.isLiveHardware && isHardwareConnected) {
        sendSerialCommand('CLEANED');
      }
    },
    [demoMode, washrooms, isHardwareConnected]
  );

  // Mark Maintenance Item Fixed
  const resolveMaintenance = useCallback((id: string) => {
    setMaintenanceQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: true, resolvedAt: Date.now() } : item))
    );
  }, []);

  // Demo clean result simulation
  const simulateCleanResult = useCallback(
    (washroomId: string, mode: 'VERIFIED' | 'UNVERIFIED') => {
      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== washroomId) return w;

          const oldW = { ...w };
          const airBefore = w.airQuality;
          const moistBefore = w.moistureFlag;
          const airAfter = mode === 'VERIFIED' ? Math.max(10, airBefore - 18) : airBefore;
          const moistAfter = mode === 'VERIFIED' ? 0 : moistBefore;

          const { isVerified, reason } = verifyCleanResult(airBefore, airAfter, moistBefore, moistAfter);

          const logEntry: CleaningLogEntry = {
            id: 'log-' + Date.now(),
            timestamp: Date.now(),
            washroomId: w.id,
            washroomName: w.name,
            status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
            reason,
            airBefore,
            airAfter,
            moistureBefore: moistBefore,
            moistureAfter: moistAfter,
          };
          setCleaningLogs((l) => [logEntry, ...l]);

          if (isVerified) {
            const recalculated = calculateCUS({
              airQuality: airAfter,
              userReportsCount: 0,
              timeSinceLastClean: 0,
              footfall: 0,
              moistureFlag: 0,
              supplyLevel: 100,
              previousStatus: 'GREEN',
              isWetFloorAfterMop: false,
            });

            const nextHistory = [0, 0, 0, 0, 0];
            const updated: Washroom = {
              ...w,
              airQuality: airAfter,
              userReports: 0,
              timeSinceLastClean: 0,
              footfall: 0,
              moistureFlag: 0,
              supplyLevel: 100,
              cus: 0,
              status: 'GREEN',
              cusHistory: nextHistory,
              rate: 0,
              timeToThreshold: 'Stable',
              lastCleanedTimestamp: Date.now(),
              lastVerifiedTimestamp: Date.now(),
              lastVerifiedCleanMinAgo: 0,
              isSettling: false,
              settlingSecondsRemaining: 0,
              verificationState: 'VERIFIED',
              isWetFloorAfterMop: false,
              allFineCountSinceClean: 0,
            };

            recordScoreDelta(updated, oldW, `Verified Clean: ${reason}`);
            return updated;
          } else {
            const updated: Washroom = {
              ...w,
              isSettling: false,
              settlingSecondsRemaining: 0,
              verificationState: 'UNVERIFIED',
              isWetFloorAfterMop: false,
            };
            recordScoreDelta(updated, oldW, `Unverified Clean: ${reason}`);
            return updated;
          }
        })
      );
    },
    [recordScoreDelta]
  );

  // 1-Click Reset all washroom scores to Clean (0 Score)
  const resetAllScoresToClean = useCallback(() => {
    setWashrooms((prev) =>
      prev.map((w) => ({
        ...w,
        airQuality: 10,
        userReports: 0,
        timeSinceLastClean: 0,
        footfall: 0,
        moistureFlag: 0,
        supplyLevel: 100,
        cus: 0,
        status: 'GREEN',
        cusHistory: [0, 0, 0, 0, 0],
        rate: 0,
        timeToThreshold: 'Stable',
        lastCleanedTimestamp: Date.now(),
        lastVerifiedTimestamp: Date.now(),
        lastVerifiedCleanMinAgo: 0,
        isSettling: false,
        settlingSecondsRemaining: 0,
        verificationState: 'VERIFIED',
        settlingAirBefore: 10,
        settlingMoistureBefore: 0,
        isWetFloorAfterMop: false,
        allFineCountSinceClean: 0,
        gasDriftDetected: false,
      }))
    );
    setCleaningReports([]);
    setMaintenanceQueue([]);
    try {
      localStorage.removeItem('alaya_cleaning_reports_v4');
      localStorage.removeItem('alaya_maintenance_v4');
    } catch (_) {}
  }, []);

  // Clear all historical data and reset
  const clearAllData = useCallback(() => {
    resetAllScoresToClean();
    setCleaningLogs([]);
    setSmsLogs([]);
    setScoreTimeline([]);
    try {
      localStorage.removeItem('alaya_logs_v4');
      localStorage.removeItem('alaya_sms_logs_v4');
      localStorage.removeItem('alaya_score_timeline_v4');
    } catch (_) {}
  }, [resetAllScoresToClean]);

  // Export cleaning logs as CSV
  const exportCsvLogs = useCallback(() => {
    if (cleaningLogs.length === 0) return;
    const headers = ['Timestamp', 'Date_Time', 'Washroom_ID', 'Washroom_Name', 'Verification_Status', 'Reason', 'Air_Before', 'Air_After', 'Moist_Before', 'Moist_After'];
    const rows = cleaningLogs.map((log) => [
      log.timestamp,
      new Date(log.timestamp).toISOString(),
      `"${log.washroomId}"`,
      `"${log.washroomName}"`,
      `"${log.status}"`,
      `"${log.reason.replace(/"/g, '""')}"`,
      log.airBefore,
      log.airAfter,
      log.moistureBefore,
      log.moistureAfter,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALAYA_Cleaning_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cleaningLogs]);

  // Settling timer countdown hook
  useEffect(() => {
    const interval = setInterval(() => {
      setWashrooms((prev) =>
        prev.map((w) => {
          if (!w.isSettling) return w;

          if (w.settlingSecondsRemaining > 1) {
            return {
              ...w,
              settlingSecondsRemaining: w.settlingSecondsRemaining - 1,
            };
          }

          // Window finished: Evaluate empirical verification
          const airBefore = w.settlingAirBefore;
          const airAfter = w.airQuality;
          const moistBefore = w.settlingMoistureBefore;
          const moistAfter = w.moistureFlag;

          const { isVerified, reason } = verifyCleanResult(airBefore, airAfter, moistBefore, moistAfter);

          const logEntry: CleaningLogEntry = {
            id: 'log-' + Date.now(),
            timestamp: Date.now(),
            washroomId: w.id,
            washroomName: w.name,
            status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
            reason,
            airBefore,
            airAfter,
            moistureBefore: moistBefore,
            moistureAfter: moistAfter,
          };
          setCleaningLogs((logs) => [logEntry, ...logs]);

          if (isVerified) {
            const nextHistory = [0, 0, 0, 0, 0];
            return {
              ...w,
              userReports: 0,
              timeSinceLastClean: 0,
              footfall: 0,
              supplyLevel: 100,
              cus: 0,
              status: 'GREEN',
              cusHistory: nextHistory,
              rate: 0,
              timeToThreshold: 'Stable',
              lastCleanedTimestamp: Date.now(),
              lastVerifiedTimestamp: Date.now(),
              lastVerifiedCleanMinAgo: 0,
              isSettling: false,
              settlingSecondsRemaining: 0,
              verificationState: 'VERIFIED',
              isWetFloorAfterMop: false,
              allFineCountSinceClean: 0,
              gasDriftDetected: false,
            };
          } else {
            return {
              ...w,
              isSettling: false,
              settlingSecondsRemaining: 0,
              verificationState: 'UNVERIFIED',
              isWetFloorAfterMop: false,
            };
          }
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Periodic slow drift for non-connected washrooms (ONLY if isAutoSimulateEnabled)
  useEffect(() => {
    if (!isAutoSimulateEnabled) return;

    const simInterval = setInterval(() => {
      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.isLiveHardware && isHardwareConnected) return w;
          if (w.isSettling) return w;

          const addedMinutes = 0.5;
          const nextTimeSinceClean = Math.min(100, Math.round((w.timeSinceLastClean + addedMinutes) * 10) / 10);
          const nextVerifiedMinAgo = Math.round((Date.now() - w.lastVerifiedTimestamp) / (60 * 1000));
          const randFootDelta = Math.random() > 0.7 ? 1 : 0;
          const nextFootfall = Math.min(100, w.footfall + randFootDelta);
          const randAirJitter = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const nextAir = Math.min(100, Math.max(5, w.airQuality + randAirJitter));

          const recalculated = calculateCUS({
            airQuality: nextAir,
            userReportsCount: w.userReports,
            timeSinceLastClean: nextTimeSinceClean,
            footfall: nextFootfall,
            moistureFlag: w.moistureFlag,
            supplyLevel: w.supplyLevel,
            previousStatus: w.status,
            isWetFloorAfterMop: w.isWetFloorAfterMop,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          return {
            ...w,
            timeSinceLastClean: nextTimeSinceClean,
            lastVerifiedCleanMinAgo: nextVerifiedMinAgo,
            footfall: nextFootfall,
            airQuality: nextAir,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
          };
        })
      );
    }, 12000);

    return () => clearInterval(simInterval);
  }, [isHardwareConnected, isAutoSimulateEnabled]);

  // Day simulation runner
  const runDaySimulation = useCallback(() => {
    if (isSimulatingDay) return;
    setIsSimulatingDay(true);

    const steps = [
      { time: '08:00 AM', label: 'Morning School Arrival', air: 24, foot: 15, moist: 0, reports: 0, timeMin: 10, supply: 95 },
      { time: '09:30 AM', label: 'Period 1 & 2 Passing', air: 36, foot: 35, moist: 0, reports: 0, timeMin: 35, supply: 88 },
      { time: '11:15 AM', label: 'Morning Recess Rush', air: 62, foot: 70, moist: 1, reports: 2, timeMin: 65, supply: 60 },
      { time: '11:45 AM', label: 'Post-Recess Dispatch & Clean', air: 26, foot: 10, moist: 0, reports: 0, timeMin: 5, supply: 95 },
      { time: '01:10 PM', label: 'Lunch Break Peak Surge', air: 74, foot: 85, moist: 1, reports: 3, timeMin: 55, supply: 35 },
      { time: '01:40 PM', label: 'Midday Mopping & Verified Clean', air: 22, foot: 12, moist: 0, reports: 0, timeMin: 8, supply: 90 },
      { time: '03:15 PM', label: 'School Dismissal Rush', air: 48, foot: 50, moist: 0, reports: 1, timeMin: 40, supply: 75 },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setIsSimulatingDay(false);
        return;
      }

      const s = steps[stepIndex];
      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== 'gf-boys') return w;
          const oldW = { ...w };

          const recalculated = calculateCUS({
            airQuality: s.air,
            userReportsCount: s.reports,
            timeSinceLastClean: s.timeMin,
            footfall: s.foot,
            moistureFlag: s.moist as 0 | 1,
            supplyLevel: s.supply,
            previousStatus: w.status,
            isWetFloorAfterMop: false,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          const updated: Washroom = {
            ...w,
            airQuality: s.air,
            footfall: s.foot,
            moistureFlag: s.moist as 0 | 1,
            userReports: s.reports,
            timeSinceLastClean: s.timeMin,
            supplyLevel: s.supply,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
            hourlyHistory: [
              ...w.hourlyHistory.slice(-10),
              {
                time: s.time,
                cus: recalculated.cus,
                air: s.air,
                foot: s.foot,
              },
            ],
          };

          recordScoreDelta(updated, oldW, s.label);

          if (recalculated.status === 'RED' && oldW.status !== 'RED') {
            checkAndTriggerSmsAlert(w.id, s.label);
          }

          return updated;
        })
      );

      stepIndex++;
    }, 2200);
  }, [isSimulatingDay, recordScoreDelta, checkAndTriggerSmsAlert]);

  // Connect to Virtual ESP32 Hardware Simulator
  const connectVirtualSerial = useCallback(() => {
    if (virtualIntervalRef.current) {
      clearInterval(virtualIntervalRef.current);
      virtualIntervalRef.current = null;
    }

    setIsHardwareConnected(true);
    setIsVirtualHardware(true);
    lastPacketTimestampRef.current = Date.now();
    setSecondsSinceLastData(0);

    addHardwareLog('Virtual ESP32 Board connected at 115200 baud.', 'info');
    addHardwareLog('ESP32-S3 Dual-Core 240MHz | Telemetry Stream active (1.5s rate)', 'info');

    virtualIntervalRef.current = setInterval(() => {
      lastPacketTimestampRef.current = Date.now();
      setSecondsSinceLastData(0);
      setDeviceUptimeSeconds((prev) => prev + 1);

      setWashrooms((prev) =>
        prev.map((w) => {
          if (!w.isLiveHardware) return w;

          const airJitter = Math.floor(Math.random() * 3) - 1;
          const nextAir = Math.min(100, Math.max(10, w.airQuality + airJitter));
          const nextFoot = w.footfall + (Math.random() > 0.8 ? 1 : 0);

          const recalculated = calculateCUS({
            airQuality: nextAir,
            userReportsCount: w.userReports,
            timeSinceLastClean: w.timeSinceLastClean,
            footfall: nextFoot,
            moistureFlag: w.moistureFlag,
            supplyLevel: w.supplyLevel,
            previousStatus: w.status,
            isWetFloorAfterMop: w.isWetFloorAfterMop,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          const packet: HardwareSerialData = {
            air: nextAir,
            foot: nextFoot,
            moist: w.moistureFlag,
            supply: w.supplyLevel,
            reports: w.userReports,
            cus: recalculated.cus,
            status: recalculated.status,
            ttt: timeToThreshold === 'Stable' ? -1 : typeof timeToThreshold === 'number' ? timeToThreshold : -1,
            verify: w.verificationState,
            mop: 'docked',
          };

          addHardwareLog(
            `RX JSON: CUS=${packet.cus} ${packet.status} Air=${packet.air} Foot=${packet.foot} Moist=${packet.moist}`,
            'rx'
          );

          return {
            ...w,
            airQuality: nextAir,
            footfall: nextFoot,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
          };
        })
      );
    }, 1500);
  }, [addHardwareLog]);

  // Send command to Serial Port
  const sendSerialCommand = useCallback(
    async (cmd: string) => {
      addHardwareLog(`TX: ${cmd}`, 'tx');

      if (isVirtualHardware || !serialWriterRef.current) {
        setTimeout(() => {
          const upper = cmd.trim().toUpperCase();
          if (upper === 'PING') {
            addHardwareLog(`RX: {"device":"ALAYA_ESP32_S3","firmware":"2.1.0-SIM","chipId":"0x2462AB","status":"READY"}`, 'rx');
          } else if (upper === 'BUZZ') {
            addHardwareLog(`RX: ACK: PIEZO BUZZER 800Hz BEEPED 500ms`, 'rx');
          } else if (upper === 'CLEANED') {
            addHardwareLog(`RX: ACK: CLEANED EVENT - Commencing settling evaluation window`, 'rx');
          } else if (upper.startsWith('LIGHT:')) {
            const color = upper.replace('LIGHT:', '');
            addHardwareLog(`RX: ACK: RGB HYGIENE DOME LIGHT SET TO ${color}`, 'rx');
          } else if (upper === 'RECAL') {
            addHardwareLog(`RX: ACK: MQ-135 R0 Calibrated to Clean Air Baseline (R0=412)`, 'rx');
          } else if (upper === 'RELAY:ON') {
            addHardwareLog(`RX: ACK: EXHAUST FAN RELAY SWITCHED HIGH (ON)`, 'rx');
          } else if (upper === 'RELAY:OFF') {
            addHardwareLog(`RX: ACK: EXHAUST FAN RELAY SWITCHED LOW (OFF)`, 'rx');
          } else {
            addHardwareLog(`RX: ACK: Command '${cmd}' processed by virtual firmware`, 'rx');
          }
        }, 60);
        return;
      }

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(cmd + '\n');
        await serialWriterRef.current.write(data);
      } catch (err: any) {
        console.warn('Writing to serial port notice:', err?.message);
        addHardwareLog(`ERR write: ${err?.message || 'Failed to transmit'}`, 'err');
      }
    },
    [addHardwareLog, isVirtualHardware]
  );

  // Connect Physical Serial Port
  const connectSerial = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      addHardwareLog('Web Serial API is not available in this browser. Connecting Virtual ESP32 Stream instead...', 'info');
      connectVirtualSerial();
      return;
    }

    try {
      addHardwareLog('Requesting USB Serial port...', 'info');
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      serialPortRef.current = port;
      setIsHardwareConnected(true);
      setIsVirtualHardware(false);
      setIsIframeRestricted(false);
      lastPacketTimestampRef.current = Date.now();
      addHardwareLog('Port connected successfully at 115200 baud. Reading stream...', 'info');

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      serialWriterRef.current = textEncoder.writable.getWriter();

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      serialReaderRef.current = reader;

      setTimeout(() => {
        sendSerialCommand('PING');
      }, 500);

      let buffer = '';
      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              reader.releaseLock();
              break;
            }
            if (value) {
              buffer += value;
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                lastPacketTimestampRef.current = Date.now();
                setSecondsSinceLastData(0);

                if (trimmed.startsWith('{')) {
                  try {
                    const parsed: HardwareSerialData = JSON.parse(trimmed);
                    addHardwareLog(`RX JSON: CUS=${parsed.cus} ${parsed.status} Air=${parsed.air}`, 'rx');

                    setWashrooms((prev) =>
                      prev.map((w) => {
                        if (!w.isLiveHardware) return w;
                        const nextHistory = [...w.cusHistory.slice(1), parsed.cus];
                        const tttVal = parsed.ttt === -1 ? 'Stable' : parsed.ttt;

                        return {
                          ...w,
                          airQuality: parsed.air,
                          footfall: parsed.foot,
                          moistureFlag: parsed.moist === 1 ? 1 : 0,
                          supplyLevel: parsed.supply,
                          userReports: parsed.reports,
                          cus: parsed.cus,
                          status: parsed.status,
                          cusHistory: nextHistory,
                          timeToThreshold: tttVal,
                          verificationState: parsed.verify,
                        };
                      })
                    );
                  } catch (jsonErr) {
                    addHardwareLog(`ERR: Malformed JSON packet ignored`, 'err');
                  }
                } else {
                  addHardwareLog(`RX: ${trimmed}`, 'rx');
                }
              }
            }
          }
        } catch (readErr: any) {
          console.warn('Serial stream notice:', readErr?.message);
          addHardwareLog(`Serial stream finished: ${readErr?.message || 'Port closed'}`, 'info');
        }
      })();
    } catch (err: any) {
      const errName = err?.name || '';
      const errMsg = err?.message || '';

      if (errName === 'SecurityError' || errMsg.includes('permissions policy') || errMsg.includes('disallowed')) {
        setIsIframeRestricted(true);
        addHardwareLog('Browser security notice: Web Serial is blocked inside embedded iframe sandboxes.', 'info');
        addHardwareLog('Switched automatically to Virtual ESP32 Live Stream so you can preview telemetry!', 'info');
        connectVirtualSerial();
        return;
      }

      if (errName === 'NotFoundError' || errMsg.includes('No port selected') || errMsg.includes('canceled') || errMsg.includes('cancelled') || errName === 'AbortError') {
        addHardwareLog('USB Port selection cancelled by user.', 'info');
        setIsHardwareConnected(false);
        return;
      }

      addHardwareLog(`Port open notice: ${errMsg || 'Could not access device'}.`, 'err');
      setIsHardwareConnected(false);
    }
  }, [addHardwareLog, sendSerialCommand, connectVirtualSerial]);

  // Disconnect Serial
  const disconnectSerial = useCallback(async () => {
    if (virtualIntervalRef.current) {
      clearInterval(virtualIntervalRef.current);
      virtualIntervalRef.current = null;
    }
    setIsVirtualHardware(false);

    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
        serialReaderRef.current = null;
      }
      if (serialWriterRef.current) {
        await serialWriterRef.current.close();
        serialWriterRef.current = null;
      }
      if (serialPortRef.current) {
        await serialPortRef.current.close();
        serialPortRef.current = null;
      }
    } catch (err: any) {
      console.warn('Closing serial port notice:', err?.message);
    } finally {
      setIsHardwareConnected(false);
      addHardwareLog('Serial port disconnected gracefully.', 'info');
    }
  }, [addHardwareLog]);

  const t = translations[language];

  return (
    <AlayaContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        heroPhoto,
        setHeroPhoto,
        swachhLogo,
        setSwachhLogo,
        floors,
        addFloor,
        updateFloor,
        removeFloor,
        washrooms,
        activeWashroom,
        selectedWashroomId,
        setSelectedWashroomId,
        addWashroom,
        updateWashroom,
        removeWashroom,
        updateWashroomParams,
        cleaningReports,
        submitReport,
        resolveCleaningReport,
        maintenanceQueue,
        resolveMaintenance,
        cleaningLogs,
        markCleaned,
        simulateCleanResult,
        mopState,
        demoMode,
        setDemoMode,
        isAutoSimulateEnabled,
        setIsAutoSimulateEnabled,
        resetAllScoresToClean,
        runDaySimulation,
        isSimulatingDay,
        clearAllData,
        exportCsvLogs,
        scoreTimeline,
        clearScoreTimeline,
        latestScoreDiff,
        smsSettings,
        updateSmsSettings,
        smsLogs,
        clearSmsLogs,
        exportSmsLogsCsv,
        activeSmsModal,
        dismissSmsModal,
        sendTestSms,
        checkSmsConnection,
        dailySmsSentCount,
        smsFallbackBannerActive,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        isHardwareConnected,
        isVirtualHardware,
        isIframeRestricted,
        hardwareStaleWarning,
        hardwareLogs,
        lightMode,
        setLightMode,
        manualLightColor,
        relayActive,
        secondsSinceLastData,
        deviceUptimeSeconds,
        connectSerial,
        connectVirtualSerial,
        disconnectSerial,
        sendSerialCommand,
      }}
    >
      {children}
    </AlayaContext.Provider>
  );
};

export const useAlaya = () => {
  const context = useContext(AlayaContext);
  if (!context) {
    throw new Error('useAlaya must be used within an AlayaProvider');
  }
  return context;
};
