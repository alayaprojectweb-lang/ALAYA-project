export type WashroomStatus = 'GREEN' | 'AMBER' | 'RED' | 'WET_FLOOR';

export type VerificationState = 'IDLE' | 'SETTLING' | 'VERIFIED' | 'UNVERIFIED';

export type WashroomType = 'Boys' | 'Girls' | 'Staff' | 'Unisex' | 'Accessible';

export interface HistoryPoint {
  time: string;
  cus: number;
  air: number;
  foot: number;
}

export interface Floor {
  id: string;
  name: string;
  nameHi?: string;
  janitorName?: string;
  janitorPhone: string; // stored as +91XXXXXXXXXX
  smsAlertsActive: boolean;
}

export interface Washroom {
  id: string;
  name: string;
  nameHi: string;
  floor: string; // e.g. "Ground Floor", "First Floor"
  floorId?: string;
  floorHi: string;
  washroomType?: WashroomType;
  janitorPhoneOverride?: string; // optional override for this specific washroom
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
  floor?: string;
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
  | 'admin'
  | 'hardware'
  | 'simulator'
  | 'privacy';

export type Language = 'en' | 'hi';

export type SmsDeliveryMode = 'DEMO' | 'FAST2SMS' | 'LINK' | 'API';

export interface SmsSettings {
  mode: SmsDeliveryMode;
  provider?: 'fast2sms' | 'twilio' | 'custom';
  fast2smsApiKey?: string;
  twilioSid?: string;
  twilioToken?: string;
  twilioFrom?: string;
  backendEndpointUrl: string;
  backendAccessKey: string;
  dailyCap: number;
  minGapMinutes: number;
  maintenancePhone?: string;
}

export interface SmsLogEntry {
  id: string;
  timestamp: number;
  floor: string;
  washroom: string;
  phone: string; // masked in UI (+91 98••••••12)
  rawPhone: string; // 10-digit plain mobile
  message: string;
  status: 'Simulated' | 'Opened in app' | 'Sent' | 'Failed';
  error?: string;
  isTest?: boolean;
}

export interface ScoreFactorDiff {
  name: string;
  oldVal: number | string;
  newVal: number | string;
  weight: number;
  pointsChange: number;
  color: string;
  desc: string;
}

export interface ScoreTimelineEvent {
  id: string;
  time: string;
  timestamp: number;
  washroomId: string;
  washroomName: string;
  oldScore: number;
  newScore: number;
  oldStatus: WashroomStatus;
  newStatus: WashroomStatus;
  reasonEn: string;
  reasonHi: string;
  topFactor?: string;
  factors: ScoreFactorDiff[];
  trigger?: string;
}
