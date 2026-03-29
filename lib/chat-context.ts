/**
 * AI Context Builder for JalRakshak AI Chat
 * 
 * Builds rich context from device data to provide to the AI assistant
 */

import { Device, Reading } from "@prisma/client";

interface DeviceStats {
  totalReadings: number;
  avgPh: number;
  avgTds: number;
  avgTurbidity: number;
  avgConductivity: number;
  safeCount: number;
  unsafeCount: number;
}

/**
 * Check if device is offline (no data in last 2 minutes)
 */
function isOffline(lastSeen: Date): boolean {
  return Date.now() - new Date(lastSeen).getTime() > 2 * 60 * 1000;
}

/**
 * Format number with fallback
 */
function fmt(val: number | null, decimals = 1): string {
  return val != null ? val.toFixed(decimals) : "N/A";
}

/**
 * Build comprehensive device context for AI (optimized for token efficiency)
 */
export function buildDeviceContext(
  device: Device,
  readings: Reading[],
  stats: DeviceStats
): string {
  if (readings.length === 0) {
    return `**Device**: ${device.deviceName || device.deviceId} | Status: No data yet | Last seen: ${new Date(device.lastSeen).toLocaleString()}`;
  }

  const latest = readings[0];
  const status = isOffline(device.lastSeen) ? "Offline" : "Live";
  
  // Build compact context
  const lines = [
    `**Device**: ${device.deviceName || device.deviceId} | ${status} | ${device.totalReadings} readings`,
    `**Latest** (${new Date(latest.timestamp).toLocaleString()}): pH=${fmt(latest.ph, 2)}, TDS=${fmt(latest.tds, 0)}ppm, Turb=${fmt(latest.turbidity)}NTU, Cond=${fmt(latest.conductivity, 0)}μS/cm, Temp=${fmt(latest.temperature)}°C`,
    `**Prediction**: ${latest.predictionStatus || "N/A"} (Score: ${latest.predictionScore ?? "N/A"}/100, Risk: ${latest.predictionRiskLevel || "N/A"})`,
    `**Averages** (${readings.length} readings): pH=${fmt(stats.avgPh, 2)}, TDS=${fmt(stats.avgTds, 0)}ppm, Turb=${fmt(stats.avgTurbidity)}NTU`,
    `**History**: ${stats.safeCount} Safe (${readings.length > 0 ? ((stats.safeCount / readings.length) * 100).toFixed(0) : 0}%), ${stats.unsafeCount} Unsafe`,
  ];

  // Add recent trend (last 5 only for efficiency)
  const recentReadings = readings.slice(0, 5);
  if (recentReadings.length > 1) {
    const trend = recentReadings.map((r, i) => 
      `${i + 1}. ${new Date(r.timestamp).toLocaleDateString()}: pH=${fmt(r.ph, 1)}, TDS=${fmt(r.tds, 0)}, ${r.predictionStatus || "?"}`
    ).join(" | ");
    lines.push(`**Recent**: ${trend}`);
  }

  // Add warning if unsafe readings exist
  if (stats.unsafeCount > 0) {
    const recentUnsafe = readings.filter(r => r.predictionStatus === "Unsafe").slice(0, 2);
    const causes = recentUnsafe.flatMap(r => r.predictionCauses || []).slice(0, 3).join("; ");
    lines.push(`⚠️ ${stats.unsafeCount} unsafe readings. Recent issues: ${causes || "Unknown"}`);
  }

  return lines.join("\n");
}

/**
 * Calculate device statistics from readings
 * @param readings - Array of readings
 * @returns Calculated statistics
 */
export function calculateDeviceStats(readings: Reading[]): DeviceStats {
  if (readings.length === 0) {
    return {
      totalReadings: 0,
      avgPh: 0,
      avgTds: 0,
      avgTurbidity: 0,
      avgConductivity: 0,
      safeCount: 0,
      unsafeCount: 0,
    };
  }

  const stats: DeviceStats = {
    totalReadings: readings.length,
    avgPh: 0,
    avgTds: 0,
    avgTurbidity: 0,
    avgConductivity: 0,
    safeCount: 0,
    unsafeCount: 0,
  };

  let phSum = 0, phCount = 0;
  let tdsSum = 0, tdsCount = 0;
  let turbiditySum = 0, turbidityCount = 0;
  let conductivitySum = 0, conductivityCount = 0;

  readings.forEach((r) => {
    if (r.ph != null) {
      phSum += r.ph;
      phCount++;
    }
    if (r.tds != null) {
      tdsSum += r.tds;
      tdsCount++;
    }
    if (r.turbidity != null) {
      turbiditySum += r.turbidity;
      turbidityCount++;
    }
    if (r.conductivity != null) {
      conductivitySum += r.conductivity;
      conductivityCount++;
    }

    if (r.predictionStatus === 'Safe') stats.safeCount++;
    if (r.predictionStatus === 'Unsafe') stats.unsafeCount++;
  });

  stats.avgPh = phCount > 0 ? phSum / phCount : 0;
  stats.avgTds = tdsCount > 0 ? tdsSum / tdsCount : 0;
  stats.avgTurbidity = turbidityCount > 0 ? turbiditySum / turbidityCount : 0;
  stats.avgConductivity = conductivityCount > 0 ? conductivitySum / conductivityCount : 0;

  return stats;
}

/**
 * Extract key insights from readings (trend detection)
 * @param readings - Array of readings (sorted by timestamp desc)
 * @returns Trend insights
 */
export function extractTrendInsights(readings: Reading[]): {
  phTrend: 'rising' | 'falling' | 'stable';
  tdsTrend: 'rising' | 'falling' | 'stable';
  turbidityTrend: 'rising' | 'falling' | 'stable';
} {
  const trends = {
    phTrend: calculateTrend(readings.map((r) => r.ph || 0)),
    tdsTrend: calculateTrend(readings.map((r) => r.tds || 0)),
    turbidityTrend: calculateTrend(readings.map((r) => r.turbidity || 0)),
  };

  return trends;
}

/**
 * Calculate trend direction for a parameter
 * @param values - Array of values (sorted by time desc)
 * @returns Trend direction
 */
function calculateTrend(values: number[]): 'rising' | 'falling' | 'stable' {
  if (values.length < 5) return 'stable';

  // Compare recent half to older half
  const midpoint = Math.floor(values.length / 2);
  const recent = values.slice(0, midpoint);
  const older = values.slice(midpoint);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (percentChange > 5) return 'rising';
  if (percentChange < -5) return 'falling';
  return 'stable';
}
