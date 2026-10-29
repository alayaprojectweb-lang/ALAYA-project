import { WashroomStatus, VerificationState } from '../types';

export interface CUSInputs {
  airQuality: number; // 0-100
  userReportsCount: number; // 0-4+
  timeSinceLastClean: number; // 0-100 (minutes normalized)
  footfall: number; // 0-100
  moistureFlag: 0 | 1;
  supplyLevel: number; // 0-100
  previousStatus?: WashroomStatus;
  isWetFloorAfterMop?: boolean;
}

export interface CUSFactorBreakdown {
  airQualityScore: number; // 0.25 * air
  userReportsScore: number; // 0.20 * reports
  timeScore: number; // 0.15 * time
  footfallScore: number; // 0.15 * footfall
  moistureScore: number; // 0.15 * (moist * 100)
  supplyDeduction: number; // 0.10 * supply
  rawTotal: number;
  clampedTotal: number;
  userReportsNormalized: number;
}

/**
 * Calculates Cleanliness & Urgency Score (CUS)
 * CUS = 0.25×AirQuality + 0.20×UserReports + 0.15×TimeSinceLastClean + 0.15×FootfallSinceLastClean + 0.15×(MoistureFlag×100) − 0.10×SupplyLevel
 */
export function calculateCUS(inputs: CUSInputs): {
  cus: number;
  breakdown: CUSFactorBreakdown;
  status: WashroomStatus;
} {
  const {
    airQuality,
    userReportsCount,
    timeSinceLastClean,
    footfall,
    moistureFlag,
    supplyLevel,
    previousStatus = 'GREEN',
    isWetFloorAfterMop = false,
  } = inputs;

  // UserReports saturates at 4 reports (each adds 25 points, up to 100)
  const userReportsNormalized = Math.min(Math.max(userReportsCount, 0) * 25, 100);

  const clampedAir = Math.min(Math.max(airQuality, 0), 100);
  const clampedTime = Math.min(Math.max(timeSinceLastClean, 0), 100);
  const clampedFootfall = Math.min(Math.max(footfall, 0), 100);
  const clampedSupply = Math.min(Math.max(supplyLevel, 0), 100);
  const moistValue = moistureFlag === 1 ? 100 : 0;

  const airQualityScore = 0.25 * clampedAir;
  const userReportsScore = 0.20 * userReportsNormalized;
  const timeScore = 0.15 * clampedTime;
  const footfallScore = 0.15 * clampedFootfall;
  const moistureScore = 0.15 * moistValue;
  const supplyDeduction = 0.10 * clampedSupply;

  const rawTotal =
    airQualityScore +
    userReportsScore +
    timeScore +
    footfallScore +
    moistureScore -
    supplyDeduction;

  const clampedTotal = Math.round(Math.min(Math.max(rawTotal, 0), 100) * 10) / 10;

  // Determine status with Hysteresis
  let status: WashroomStatus;

  // Special state: After mopping, if moisture is 1 show separate WET FLOOR state (Cobalt)
  if (isWetFloorAfterMop && moistureFlag === 1) {
    status = 'WET_FLOOR';
  } else if (previousStatus === 'AMBER' || previousStatus === 'RED') {
    // Return to Green only below 35 (hysteresis)
    if (clampedTotal < 35) {
      status = 'GREEN';
    } else if (clampedTotal >= 70) {
      status = 'RED';
    } else {
      status = 'AMBER';
    }
  } else {
    // Default initial / from Green
    if (clampedTotal >= 70) {
      status = 'RED';
    } else if (clampedTotal >= 40) {
      status = 'AMBER';
    } else {
      status = 'GREEN';
    }
  }

  const breakdown: CUSFactorBreakdown = {
    airQualityScore,
    userReportsScore,
    timeScore,
    footfallScore,
    moistureScore,
    supplyDeduction,
    rawTotal,
    clampedTotal,
    userReportsNormalized,
  };

  return { cus: clampedTotal, breakdown, status };
}

/**
 * Calculates rate of increase (slope per minute) from the last 5 CUS values.
 */
export function calculateRateAndTTT(
  cusHistory: number[],
  currentCUS: number
): { rate: number; timeToThreshold: number | 'Stable' } {
  if (!cusHistory || cusHistory.length < 2) {
    return { rate: 0, timeToThreshold: 'Stable' };
  }

  // Calculate simple linear regression slope or delta over points
  // Assuming measurements arrive at ~1 minute intervals (or normalized intervals)
  const n = cusHistory.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = cusHistory[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const roundedSlope = Math.round(slope * 100) / 100;

  if (roundedSlope <= 0.05) {
    return { rate: Math.max(0, roundedSlope), timeToThreshold: 'Stable' };
  }

  if (currentCUS >= 70) {
    return { rate: roundedSlope, timeToThreshold: 0 };
  }

  const tttMinutes = Math.round((70 - currentCUS) / roundedSlope);
  return {
    rate: roundedSlope,
    timeToThreshold: tttMinutes > 0 ? tttMinutes : 'Stable',
  };
}

/**
 * Evaluates whether a clean was VERIFIED or UNVERIFIED
 * Rule: (air_before - air_after) > margin (8) OR moisture went 1 -> 0
 */
export function verifyCleanResult(
  airBefore: number,
  airAfter: number,
  moistureBefore: number,
  moistureAfter: number,
  margin = 8
): { isVerified: boolean; reason: string } {
  const airDelta = Math.round((airBefore - airAfter) * 10) / 10;
  const moistureDried = moistureBefore === 1 && moistureAfter === 0;

  if (airDelta > margin && moistureDried) {
    return {
      isVerified: true,
      reason: `Ammonia & odor dropped by ${airDelta} pts and floor dried completely.`,
    };
  }

  if (airDelta > margin) {
    return {
      isVerified: true,
      reason: `Air quality improved significantly (Ammonia/VOC dropped by ${airDelta} points, > ${margin} threshold).`,
    };
  }

  if (moistureDried) {
    return {
      isVerified: true,
      reason: `Floor dried effectively (moisture cleared from 1 → 0).`,
    };
  }

  return {
    isVerified: false,
    reason: `No measurable sensor change detected (Air delta: ${airDelta} pts ≤ ${margin}, moisture unchanged). Stored as unverified.`,
  };
}
