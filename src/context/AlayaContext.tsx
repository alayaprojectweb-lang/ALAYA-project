import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Washroom,
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
} from '../types';
import { calculateCUS, calculateRateAndTTT, verifyCleanResult } from '../utils/cusLogic';
import { translations } from '../i18n/translations';

// Initial pre-loaded clean seed data for washrooms with Floor assignments
const createInitialHourlyHistory = (baseCus: number, baseAir: number, baseFoot: number) => {
  const points = [];
  const now = Date.now();
  for (let i = 60; i >= 0; i -= 10) {
    const timeStr = new Date(now - i * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    points.push({ time: timeStr, cus: baseCus, air: baseAir, foot: baseFoot });
  }
  return points;
};

const INITIAL_WASHROOMS: Washroom[] = [
  {
    id: 'gf-boys',
    name: 'Ground Floor Boys Washroom',
    nameHi: 'भूतल बालक प्रसाधन',
    floor: 'Ground Floor',
    floorHi: 'भूतल',
    staffId: 'staff_gf',
    staffPassword: '1234',
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
    floorHi: 'भूतल',
    staffId: 'staff_gf',
    staffPassword: '1234',
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
    floorHi: 'प्रथम तल',
    staffId: 'staff_ff',
    staffPassword: '1234',
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
    floorHi: 'स्टाफ विंग',
    staffId: 'staff_sw',
    staffPassword: '1234',
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

// Completely clean empty logs and maintenance on start as requested
const INITIAL_LOGS: CleaningLogEntry[] = [];
const INITIAL_MAINTENANCE: MaintenanceItem[] = [];

interface AlayaContextType {
  washrooms: Washroom[];
  activeWashroom: Washroom;
  selectedWashroomId: string;
  setSelectedWashroomId: (id: string) => void;
  cleaningReports: CleaningReport[];
  maintenanceQueue: MaintenanceItem[];
  cleaningLogs: CleaningLogEntry[];
  mopState: MopState;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
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
  submitReport: (washroomId: string, type: CleaningReportType, text?: string) => { success: boolean; message: string };
  markCleaned: (washroomId: string) => void;
  resolveCleaningReport: (id: string) => void;
  resolveMaintenance: (id: string) => void;
  isAutoSimulateEnabled: boolean;
  setIsAutoSimulateEnabled: (val: boolean) => void;
  resetAllScoresToClean: () => void;
  simulateCleanResult: (washroomId: string, mode: 'VERIFIED' | 'UNVERIFIED') => void;
  updateWashroomParams: (
    washroomId: string,
    params: Partial<Pick<Washroom, 'airQuality' | 'footfall' | 'supplyLevel' | 'moistureFlag' | 'userReports' | 'timeSinceLastClean'>>
  ) => void;
  runDaySimulation: () => void;
  isSimulatingDay: boolean;
  exportCsvLogs: () => void;
  // Floor and Admin Login additions
  isAdminLoggedIn: boolean;
  adminLogin: (id: string, pass: string) => boolean;
  adminLogout: () => void;
  staffAuth: { isLoggedIn: boolean; floor: string | null; staffId: string | null };
  staffLogin: (id: string, pass: string) => { success: boolean; floor?: string; error?: string };
  staffLogout: () => void;
  availableFloors: string[];
  staffSelectedFloor: string;
  setStaffSelectedFloor: (floor: string) => void;
  addWashroom: (data: {
    name: string;
    nameHi?: string;
    floor: string;
    floorHi?: string;
    staffId?: string;
    staffPassword?: string;
    location: string;
    locationHi?: string;
  }) => void;
  removeWashroom: (id: string) => void;
  clearAllData: () => void;
  t: typeof translations['en'];
}

const AlayaContext = createContext<AlayaContextType | null>(null);

export const AlayaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load washrooms from localStorage v3
  const [washrooms, setWashrooms] = useState<Washroom[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_washrooms_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not load washrooms from localStorage', e);
    }
    return INITIAL_WASHROOMS;
  });

  const [selectedWashroomId, setSelectedWashroomId] = useState<string>('gf-boys');
  const [staffSelectedFloor, setStaffSelectedFloor] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [demoMode, setDemoMode] = useState<boolean>(true); // default true for 60s exhibition settling

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alaya_admin_auth_v1') === 'true';
    } catch (_) {
      return false;
    }
  });

  // Staff authentication state
  const [staffAuth, setStaffAuth] = useState<{
    isLoggedIn: boolean;
    floor: string | null;
    staffId: string | null;
  }>(() => {
    try {
      const saved = localStorage.getItem('alaya_staff_auth_v1');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { isLoggedIn: false, floor: null, staffId: null };
  });

  // Initial state for user reports, maintenance, and cleaning logs
  const [cleaningReports, setCleaningReports] = useState<CleaningReport[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_cleaning_reports_v3');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });
  const [isAutoSimulateEnabled, setIsAutoSimulateEnabled] = useState<boolean>(false);
  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_maintenance_v3');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_MAINTENANCE;
  });

  const [cleaningLogs, setCleaningLogs] = useState<CleaningLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('alaya_logs_v3');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_LOGS;
  });

  const [mopState, setMopState] = useState<MopState>({
    status: 'docked',
    runtimeMinutesToday: 32,
  });

  // Hardware Web Serial State
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
  const [isSimulatingDay, setIsSimulatingDay] = useState<boolean>(false);

  // Serial references
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);
  const virtualIntervalRef = useRef<any>(null);
  const lastPacketTimestampRef = useRef<number>(Date.now());

  // Rate limiting timestamps for user reports
  const reportRateLimitsRef = useRef<Record<string, number>>({});

  // Active washroom object
  const activeWashroom = washrooms.find((w) => w.id === selectedWashroomId) || washrooms[0] || INITIAL_WASHROOMS[0];

  // List of distinct floors
  const availableFloors = useMemo(() => {
    const set = new Set<string>();
    washrooms.forEach((w) => {
      if (w.floor) set.add(w.floor);
    });
    return Array.from(set);
  }, [washrooms]);

  // Append serial log helper
  const addHardwareLog = useCallback((message: string, type: 'rx' | 'tx' | 'err' | 'info' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setHardwareLogs((prev) => [{ time, message, type }, ...prev.slice(0, 100)]);
  }, []);

  // Save changes to localStorage v3
  useEffect(() => {
    try {
      localStorage.setItem('alaya_washrooms_v3', JSON.stringify(washrooms));
    } catch (_) {}
  }, [washrooms]);

  useEffect(() => {
    try {
      localStorage.setItem('alaya_maintenance_v3', JSON.stringify(maintenanceQueue));
    } catch (_) {}
  }, [maintenanceQueue]);

  useEffect(() => {
    try {
      localStorage.setItem('alaya_logs_v3', JSON.stringify(cleaningLogs));
    } catch (_) {}
  }, [cleaningLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('alaya_cleaning_reports_v3', JSON.stringify(cleaningReports));
    } catch (_) {}
  }, [cleaningReports]);

  // Admin login handler
  const adminLogin = useCallback((id: string, pass: string): boolean => {
    const cleanId = id.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (cleanId === 'admin' && (cleanPass === 'admin' || cleanPass === 'alaya2026' || cleanPass === 'admin123')) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem('alaya_admin_auth_v1', 'true');
      } catch (_) {}
      return true;
    }
    return false;
  }, []);

  // Admin logout handler
  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('alaya_admin_auth_v1');
    } catch (_) {}
  }, []);

  // Staff login handler (checks floor credentials)
  const staffLogin = useCallback(
    (id: string, pass: string): { success: boolean; floor?: string; error?: string } => {
      const cleanId = id.trim().toLowerCase();
      const cleanPass = pass.trim();

      // Master staff login (can view all floors)
      if (cleanId === 'staff' && (cleanPass === '1234' || cleanPass === 'staff' || cleanPass === 'alaya2026')) {
        const authData = { isLoggedIn: true, floor: 'all', staffId: 'staff' };
        setStaffAuth(authData);
        setStaffSelectedFloor('all');
        try {
          localStorage.setItem('alaya_staff_auth_v1', JSON.stringify(authData));
        } catch (_) {}
        return { success: true, floor: 'all' };
      }

      // Check matching floor washroom credentials
      const matched = washrooms.find(
        (w) => w.staffId && w.staffId.toLowerCase() === cleanId && w.staffPassword === cleanPass
      );

      if (matched) {
        const authData = { isLoggedIn: true, floor: matched.floor, staffId: matched.staffId || cleanId };
        setStaffAuth(authData);
        setStaffSelectedFloor(matched.floor);
        try {
          localStorage.setItem('alaya_staff_auth_v1', JSON.stringify(authData));
        } catch (_) {}
        return { success: true, floor: matched.floor };
      }

      return { success: false, error: 'Incorrect Staff ID or Password for this floor.' };
    },
    [washrooms]
  );

  // Staff logout handler
  const staffLogout = useCallback(() => {
    setStaffAuth({ isLoggedIn: false, floor: null, staffId: null });
    setStaffSelectedFloor('all');
    try {
      localStorage.removeItem('alaya_staff_auth_v1');
    } catch (_) {}
  }, []);

  // Add new Washroom / Floor
  const addWashroom = useCallback(
    (data: {
      name: string;
      nameHi?: string;
      floor: string;
      floorHi?: string;
      staffId?: string;
      staffPassword?: string;
      location: string;
      locationHi?: string;
    }) => {
      const newId = 'zone-' + Date.now().toString(36);
      const defaultStaffId = data.staffId?.trim() || `staff_${data.floor.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const defaultStaffPass = data.staffPassword?.trim() || '1234';

      const newW: Washroom = {
        id: newId,
        name: data.name,
        nameHi: data.nameHi || data.name,
        floor: data.floor,
        floorHi: data.floorHi || data.floor,
        staffId: defaultStaffId,
        staffPassword: defaultStaffPass,
        location: data.location || `${data.floor} Wing`,
        locationHi: data.locationHi || `${data.floorHi || data.floor} विंग`,
        airQuality: 15,
        userReports: 0,
        timeSinceLastClean: 0,
        footfall: 0,
        moistureFlag: 0,
        supplyLevel: 100,
        cus: 10,
        status: 'GREEN',
        cusHistory: [10, 10, 10, 10, 10],
        rate: 0,
        timeToThreshold: 'Stable',
        lastCleanedTimestamp: Date.now(),
        lastVerifiedTimestamp: Date.now(),
        lastVerifiedCleanMinAgo: 0,
        isSettling: false,
        settlingSecondsRemaining: 0,
        verificationState: 'IDLE',
        settlingAirBefore: 15,
        settlingMoistureBefore: 0,
        isWetFloorAfterMop: false,
        isLiveHardware: false,
        allFineCountSinceClean: 0,
        gasDriftDetected: false,
        hourlyHistory: createInitialHourlyHistory(10, 15, 0),
      };

      setWashrooms((prev) => [...prev, newW]);
      setSelectedWashroomId(newId);
    },
    []
  );

  // Remove Washroom / Zone
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

  // Clear all historical data and reset to freshly cleaned state
  const clearAllData = useCallback(() => {
    setCleaningLogs([]);
    setCleaningReports([]);
    setMaintenanceQueue([]);
    setWashrooms((prev) =>
      prev.map((w) => {
        const recalculated = calculateCUS({
          airQuality: 15,
          userReportsCount: 0,
          timeSinceLastClean: 0,
          footfall: 0,
          moistureFlag: 0,
          supplyLevel: 100,
          previousStatus: 'GREEN',
          isWetFloorAfterMop: false,
        });

        return {
          ...w,
          airQuality: 15,
          userReports: 0,
          timeSinceLastClean: 0,
          footfall: 0,
          moistureFlag: 0,
          supplyLevel: 100,
          cus: recalculated.cus,
          status: 'GREEN',
          cusHistory: [recalculated.cus, recalculated.cus, recalculated.cus, recalculated.cus, recalculated.cus],
          rate: 0,
          timeToThreshold: 'Stable',
          lastCleanedTimestamp: Date.now(),
          lastVerifiedTimestamp: Date.now(),
          lastVerifiedCleanMinAgo: 0,
          isSettling: false,
          settlingSecondsRemaining: 0,
          verificationState: 'IDLE',
          isWetFloorAfterMop: false,
          allFineCountSinceClean: 0,
          gasDriftDetected: false,
          hourlyHistory: createInitialHourlyHistory(recalculated.cus, 15, 0),
        };
      })
    );
    try {
      localStorage.removeItem('alaya_logs_v3');
      localStorage.removeItem('alaya_maintenance_v3');
      localStorage.removeItem('alaya_logs_v2');
      localStorage.removeItem('alaya_maintenance_v2');
    } catch (_) {}
  }, []);

  // Periodic 1-second interval for settling timers & hardware timeout watchdogs
  useEffect(() => {
    const interval = setInterval(() => {
      // Hardware watchdog
      if (isHardwareConnected) {
        const diffSec = Math.floor((Date.now() - lastPacketTimestampRef.current) / 1000);
        setSecondsSinceLastData(diffSec);
        if (diffSec > 10) {
          setHardwareStaleWarning(true);
        } else {
          setHardwareStaleWarning(false);
        }
        setDeviceUptimeSeconds((prev) => prev + 1);
      }

      // Check settling timers on washrooms
      setWashrooms((prev) =>
        prev.map((w) => {
          if (!w.isSettling) return w;

          const nextRemaining = w.settlingSecondsRemaining - 1;
          if (nextRemaining > 0) {
            return {
              ...w,
              settlingSecondsRemaining: nextRemaining,
            };
          }

          // Settling finished! Run verification evaluation
          const { isVerified, reason } = verifyCleanResult(
            w.settlingAirBefore,
            w.airQuality,
            w.settlingMoistureBefore,
            w.moistureFlag
          );

          // Log entry
          const newLog: CleaningLogEntry = {
            id: 'log-' + Date.now(),
            timestamp: Date.now(),
            washroomId: w.id,
            washroomName: w.name,
            status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
            reason,
            airBefore: w.settlingAirBefore,
            airAfter: w.airQuality,
            moistureBefore: w.settlingMoistureBefore,
            moistureAfter: w.moistureFlag,
          };

          setCleaningLogs((logs) => [newLog, ...logs]);

          if (isVerified) {
            // VERIFIED: Resets time-since-clean, footfall and reports to 0
            const recalculated = calculateCUS({
              airQuality: w.airQuality,
              userReportsCount: 0,
              timeSinceLastClean: 0,
              footfall: 0,
              moistureFlag: w.moistureFlag,
              supplyLevel: Math.min(100, w.supplyLevel + 30),
              previousStatus: w.status,
              isWetFloorAfterMop: w.isWetFloorAfterMop,
            });

            const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
            const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

            return {
              ...w,
              userReports: 0,
              timeSinceLastClean: 0,
              footfall: 0,
              supplyLevel: Math.min(100, w.supplyLevel + 30),
              cus: recalculated.cus,
              status: recalculated.status,
              cusHistory: nextHistory,
              rate,
              timeToThreshold,
              lastCleanedTimestamp: Date.now(),
              lastVerifiedTimestamp: Date.now(),
              lastVerifiedCleanMinAgo: 0,
              isSettling: false,
              settlingSecondsRemaining: 0,
              verificationState: 'VERIFIED',
              allFineCountSinceClean: 0,
              gasDriftDetected: false,
            };
          } else {
            // UNVERIFIED: store entry but do NOT reset the score!
            return {
              ...w,
              isSettling: false,
              settlingSecondsRemaining: 0,
              verificationState: 'UNVERIFIED',
            };
          }
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isHardwareConnected]);

  // Periodic slow drift for non-connected washrooms (ONLY active if isAutoSimulateEnabled is true)
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

  // Connect to Virtual ESP32 Hardware Simulator (for seamless demonstration without physical USB or inside iframes)
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
    addHardwareLog('Sensors initialized: MQ-135 Gas Sniffer, PIR Motion, Resistive Moisture, VL53L0X ToF', 'info');

    // Simulate incoming telemetry packets every 1.5 seconds
    virtualIntervalRef.current = setInterval(() => {
      lastPacketTimestampRef.current = Date.now();
      setSecondsSinceLastData(0);
      setDeviceUptimeSeconds((prev) => prev + 1);

      setWashrooms((prev) =>
        prev.map((w) => {
          if (!w.isLiveHardware) return w;

          // Natural minor jitter
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

      // Virtual hardware simulation response
      if (isVirtualHardware || !serialWriterRef.current) {
        setTimeout(() => {
          const upper = cmd.trim().toUpperCase();
          if (upper === 'PING') {
            addHardwareLog(`RX: {"device":"ALAYA_ESP32_S3","firmware":"2.1.0-SIM","chipId":"0x2462AB","status":"READY"}`, 'rx');
          } else if (upper === 'BUZZ') {
            addHardwareLog(`RX: ACK: PIEZO BUZZER 800Hz BEEPED 500ms`, 'rx');
          } else if (upper === 'CLEANED') {
            addHardwareLog(`RX: ACK: CLEANED EVENT - Commencing settling evaluation window`, 'rx');
            setWashrooms((prev) =>
              prev.map((w) =>
                w.isLiveHardware
                  ? {
                      ...w,
                      isSettling: true,
                      settlingSecondsRemaining: demoMode ? 60 : 600,
                      verificationState: 'SETTLING',
                      settlingAirBefore: w.airQuality,
                      settlingMoistureBefore: w.moistureFlag,
                      isWetFloorAfterMop: true,
                      status: 'WET_FLOOR',
                    }
                  : w
              )
            );
          } else if (upper.startsWith('LIGHT:')) {
            const color = upper.replace('LIGHT:', '');
            addHardwareLog(`RX: ACK: RGB HYGIENE DOME LIGHT SET TO ${color}`, 'rx');
          } else if (upper === 'RECAL') {
            addHardwareLog(`RX: ACK: MQ-135 R0 Calibrated to Clean Air Baseline (R0=412)`, 'rx');
          } else if (upper === 'RELAY:ON') {
            addHardwareLog(`RX: ACK: EXHAUST FAN RELAY PIN 25 SWITCHED HIGH (ON)`, 'rx');
          } else if (upper === 'RELAY:OFF') {
            addHardwareLog(`RX: ACK: EXHAUST FAN RELAY PIN 25 SWITCHED LOW (OFF)`, 'rx');
          } else if (upper === 'DEMO:ON') {
            addHardwareLog(`RX: ACK: Settling evaluation duration set to 60s`, 'rx');
          } else if (upper === 'RESETREPORTS') {
            addHardwareLog(`RX: ACK: Pending report counters cleared to 0`, 'rx');
            setWashrooms((prev) =>
              prev.map((w) => (w.isLiveHardware ? { ...w, userReports: 0 } : w))
            );
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
    [addHardwareLog, isVirtualHardware, demoMode]
  );

  // Connect to Web Serial Port (115200 baud)
  const connectSerial = useCallback(async () => {
    // Check if Web Serial API exists
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

                    if (parsed.mop) {
                      setMopState((prev) => ({
                        ...prev,
                        status: parsed.mop,
                      }));
                    }
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

      // Check if blocked by iframe permissions policy
      if (errName === 'SecurityError' || errMsg.includes('permissions policy') || errMsg.includes('disallowed')) {
        setIsIframeRestricted(true);
        addHardwareLog('Browser security notice: Web Serial is blocked inside embedded iframe sandboxes.', 'info');
        addHardwareLog('Switched automatically to Virtual ESP32 Live Stream so you can preview telemetry!', 'info');
        connectVirtualSerial();
        return;
      }

      // Check if user cancelled
      if (errName === 'NotFoundError' || errMsg.includes('No port selected') || errMsg.includes('canceled') || errMsg.includes('cancelled') || errName === 'AbortError') {
        addHardwareLog('USB Port selection cancelled by user.', 'info');
        setIsHardwareConnected(false);
        return;
      }

      // Other general error
      addHardwareLog(`Port open notice: ${errMsg || 'Could not access device'}.`, 'err');
      setIsHardwareConnected(false);
    }
  }, [addHardwareLog, sendSerialCommand, connectVirtualSerial]);

  // Disconnect Web Serial Port
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

  // Submit User Report
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

      if (type === 'something_broken') {
        const maintItem: MaintenanceItem = {
          id: 'maint-' + Date.now(),
          timestamp: now,
          washroomId,
          washroomName,
          fault: text || 'Fixture or plumbing defect reported by visitor',
          detail: text,
          resolved: false,
        };
        setMaintenanceQueue((prev) => [maintItem, ...prev]);

        return {
          success: true,
          message: 'Maintenance ticket created for repairs staff.',
        };
      }

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

      const report: CleaningReport = {
        id: 'rep-' + Date.now(),
        timestamp: now,
        washroomId,
        washroomName,
        floor: targetWashroom?.floor || 'Ground Floor',
        type,
        text,
        resolved: false,
      };
      setCleaningReports((prev) => [report, ...prev]);

      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== washroomId) return w;

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

          return {
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
        })
      );

      return {
        success: true,
        message: 'Report sent directly to sanitation staff dashboard.',
      };
    },
    [washrooms, isHardwareConnected, sendSerialCommand]
  );

  // Staff mark specific cleaning report as resolved
  const resolveCleaningReport = useCallback(
    (reportId: string) => {
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

            return {
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
          })
        );
      }
    },
    []
  );

  // Trigger "Mark Cleaned" button by staff
  const markCleaned = useCallback(
    (washroomId: string) => {
      const settlingDuration = demoMode ? 60 : 600;

      // Mark all unresolved reports for this washroom as resolved
      setCleaningReports((prev) =>
        prev.map((r) =>
          r.washroomId === washroomId && !r.resolved
            ? { ...r, resolved: true, resolvedAt: Date.now() }
            : r
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
    [demoMode, washrooms, isHardwareConnected, sendSerialCommand]
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
      localStorage.removeItem('alaya_cleaning_reports_v3');
      localStorage.removeItem('alaya_maintenance_v3');
    } catch (_) {}
  }, []);

  // Demo direct simulation of Clean Result
  const simulateCleanResult = useCallback((washroomId: string, mode: 'VERIFIED' | 'UNVERIFIED') => {
    setWashrooms((prev) =>
      prev.map((w) => {
        if (w.id !== washroomId) return w;

        const airBefore = w.airQuality;
        const moistBefore = w.moistureFlag;
        const airAfter = mode === 'VERIFIED' ? Math.max(12, airBefore - 18) : airBefore;
        const moistAfter = mode === 'VERIFIED' ? 0 : moistBefore;

        const { isVerified, reason } = verifyCleanResult(airBefore, airAfter, moistBefore, moistAfter);

        const newLog: CleaningLogEntry = {
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
        setCleaningLogs((logs) => [newLog, ...logs]);

        if (isVerified) {
          const recalculated = calculateCUS({
            airQuality: airAfter,
            userReportsCount: 0,
            timeSinceLastClean: 0,
            footfall: 0,
            moistureFlag: 0,
            supplyLevel: 95,
            previousStatus: w.status,
            isWetFloorAfterMop: false,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          return {
            ...w,
            airQuality: airAfter,
            moistureFlag: 0,
            supplyLevel: 95,
            userReports: 0,
            timeSinceLastClean: 0,
            footfall: 0,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
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
          };
        }
      })
    );
  }, []);

  // Update simulator parameters manually
  const updateWashroomParams = useCallback(
    (
      washroomId: string,
      params: Partial<
        Pick<
          Washroom,
          'airQuality' | 'footfall' | 'supplyLevel' | 'moistureFlag' | 'userReports' | 'timeSinceLastClean'
        >
      >
    ) => {
      setWashrooms((prev) =>
        prev.map((w) => {
          if (w.id !== washroomId) return w;

          const air = params.airQuality !== undefined ? params.airQuality : w.airQuality;
          const foot = params.footfall !== undefined ? params.footfall : w.footfall;
          const supply = params.supplyLevel !== undefined ? params.supplyLevel : w.supplyLevel;
          const moist = params.moistureFlag !== undefined ? params.moistureFlag : w.moistureFlag;
          const reports = params.userReports !== undefined ? params.userReports : w.userReports;
          const time = params.timeSinceLastClean !== undefined ? params.timeSinceLastClean : w.timeSinceLastClean;

          const recalculated = calculateCUS({
            airQuality: air,
            userReportsCount: reports,
            timeSinceLastClean: time,
            footfall: foot,
            moistureFlag: moist,
            supplyLevel: supply,
            previousStatus: w.status,
            isWetFloorAfterMop: w.isWetFloorAfterMop,
          });

          const nextHistory = [...w.cusHistory.slice(1), recalculated.cus];
          const { rate, timeToThreshold } = calculateRateAndTTT(nextHistory, recalculated.cus);

          return {
            ...w,
            airQuality: air,
            footfall: foot,
            supplyLevel: supply,
            moistureFlag: moist,
            userReports: reports,
            timeSinceLastClean: time,
            cus: recalculated.cus,
            status: recalculated.status,
            cusHistory: nextHistory,
            rate,
            timeToThreshold,
          };
        })
      );
    },
    []
  );

  // Mark Maintenance item fixed
  const resolveMaintenance = useCallback((id: string) => {
    setMaintenanceQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, resolved: true, resolvedAt: Date.now() };
        }
        return item;
      })
    );
  }, []);

  // Run Day Simulation fast-forwarding 8 hours of school
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

          return {
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
            hourlyHistory: [...w.hourlyHistory.slice(-10), {
              time: s.time,
              cus: recalculated.cus,
              air: s.air,
              foot: s.foot,
            }],
          };
        })
      );

      stepIndex++;
    }, 2200);
  }, [isSimulatingDay]);

  // Export cleaning logs as CSV
  const exportCsvLogs = useCallback(() => {
    if (cleaningLogs.length === 0) return;

    const headers = [
      'Timestamp',
      'Date_Time',
      'Washroom_ID',
      'Washroom_Name',
      'Verification_Status',
      'Empirical_Reason',
      'Air_Before',
      'Air_After',
      'Moisture_Before',
      'Moisture_After',
    ];

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

  const t = translations[language];

  return (
    <AlayaContext.Provider
      value={{
        washrooms,
        activeWashroom,
        selectedWashroomId,
        setSelectedWashroomId,
        cleaningReports,
        maintenanceQueue,
        cleaningLogs,
        mopState,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        demoMode,
        setDemoMode,
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
        submitReport,
        markCleaned,
        resolveCleaningReport,
        resolveMaintenance,
        isAutoSimulateEnabled,
        setIsAutoSimulateEnabled,
        resetAllScoresToClean,
        simulateCleanResult,
        updateWashroomParams,
        runDaySimulation,
        isSimulatingDay,
        exportCsvLogs,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        staffAuth,
        staffLogin,
        staffLogout,
        availableFloors,
        staffSelectedFloor,
        setStaffSelectedFloor,
        addWashroom,
        removeWashroom,
        clearAllData,
        t,
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
