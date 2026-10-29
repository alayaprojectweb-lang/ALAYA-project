export type WashroomStatus = 'GREEN' | 'AMBER' | 'RED' | 'WET_FLOOR';

export type VerificationState = 'IDLE' | 'SETTLING' | 'VERIFIED' | 'UNVERIFIED';

export interface HistoryPoint {
  time: string;
  cus: number;
  air: number;
  foot: number;
}

export interface Washroom {
  id: string;
  name: string;
  nameHi: string;
  floor: string; // e.g. "Ground Floor", "First Floor"
  floorHi: string; // e.g. "भूतल", "प्रथम तल"
  staffId?: string; // e.g. "staff_gf"
  staffPassword?: string; // e.g. "1234"
  location: string;
  locationHi: string;
  airQuality: number; // 0-100 (Ammonia / VOC index)
  userReports: number; // raw count of unresolved cleaning reports since last clean (0 to 4+)
  timeSinceLastClean: number; // in minutes (0-100 normalized)
  footfall: number; // footfall count since last clean (0-100 normalized)
  moistureFlag: 0 | 1; // 0 = dry, 1 = wet
  supplyLevel: number; // 0-100%
  cus: number; // Cleanliness & Urgency Score (0-100)
  status: WashroomStatus;
  cusHistory: number[]; // Last 5 CUS values to compute slope / rate
  rate: number; // slope per minute
  timeToThreshold: number | 'Stable'; // minutes until CUS reaches 70 (Red)
  lastCleanedTimestamp: number; // epoch ms
  lastVerifiedTimestamp: number; // epoch ms
  lastVerifiedCleanMinAgo: number;
  isSettling: boolean;
  settlingSecondsRemaining: number;
  verificationState: VerificationState;
  settlingAirBefore: number;
  settlingMoistureBefore: number;
  isWetFloorAfterMop: boolean;
  isLiveHardware: boolean; // true for Washroom 1 (Ground Floor Boys)
  allFineCountSinceClean: number;
  gasDriftDetected: boolean;
  hourlyHistory: HistoryPoint[];
}

export type CleaningReportType =
  | 'floor_wet'
  | 'no_soap'
  | 'bad_smell'
  | 'bin_full'
  | 'something_broken'
  | 'all_fine';

export interface CleaningReport {
  id: string;
  timestamp: number;
  washroomId: string;
  washroomName: string;
  floor?: string;
  type: CleaningReportType;
  text?: string;
  resolved: boolean;
  resolvedAt?: number;
}

export interface MaintenanceItem {
  id: string;
  timestamp: number;
  washroomId: string;
  washroomName: string;
  fault: string;
  detail?: string;
  resolved: boolean;
  resolvedAt?: number;
}

export interface CleaningLogEntry {
  id: string;
  timestamp: number;
  washroomId: string;
  washroomName: string;
  status: 'VERIFIED' | 'UNVERIFIED';
  reason: string;
  airBefore: number;
  airAfter: number;
  moistureBefore: number;
  moistureAfter: number;
}

export interface MopState {
  status: 'docked' | 'away';
  runtimeMinutesToday: number;
}

export interface HardwareSerialData {
  air: number;
  foot: number;
  moist: number;
  supply: number;
  mop: 'docked' | 'away';
  reports: number;
  cus: number;
  status: 'GREEN' | 'AMBER' | 'RED' | 'WET_FLOOR';
  ttt: number;
  verify: VerificationState;
}

export interface HardwareLogEntry {
  time: string;
  message: string;
  type: 'rx' | 'tx' | 'err' | 'info';
}

export type TabType =
  | 'home'
  | 'public'
  | 'staff'
  | 'admin'
  | 'hardware'
  | 'simulator'
  | 'privacy';

export type Language = 'en' | 'hi';
