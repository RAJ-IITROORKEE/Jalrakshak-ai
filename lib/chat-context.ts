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
  return Date.now() - new Date(lastSeen).getTime() > 2 * 60 * 1000; // 2 minutes
}

/**
 * Build comprehensive device context for AI
 * @param device - Device metadata
 * @param readings - Historical readings (sorted by timestamp desc)
 * @param stats - Pre-calculated statistics
 * @returns Formatted context string for AI
 */
export function buildDeviceContext(
  device: Device,
  readings: Reading[],
  stats: DeviceStats
): string {
  if (readings.length === 0) {
    return `
**Device Information**:
- Device Name: ${device.deviceName || device.deviceId}
- Device ID: ${device.deviceId}
- Status: No data available yet
- Last Seen: ${new Date(device.lastSeen).toLocaleString()}

⚠️ **Note**: This device has not sent any readings yet. Once data arrives, you'll be able to analyze trends and provide insights.
`;
  }

  const latestReading = readings[0];
  const oldestReading = readings[readings.length - 1];
  
  return `
**Device Information**:
- Device Name: ${device.deviceName || device.deviceId}
- Device ID: ${device.deviceId}
- Status: ${isOffline(device.lastSeen) ? 'Offline ⚠️' : 'Live ✅'}
- Last Seen: ${new Date(device.lastSeen).toLocaleString()}
- Total Readings: ${device.totalReadings}
- Data Range: ${new Date(oldestReading.timestamp).toLocaleDateString()} to ${new Date(latestReading.timestamp).toLocaleDateString()}

**Latest Readings** (${new Date(latestReading.timestamp).toLocaleString()}):
- pH Level: ${latestReading.ph?.toFixed(2) || 'N/A'}
- TDS: ${latestReading.tds?.toFixed(0) || 'N/A'} ppm
- Turbidity: ${latestReading.turbidity?.toFixed(1) || 'N/A'} NTU
- Conductivity: ${latestReading.conductivity?.toFixed(0) || 'N/A'} μS/cm
- Temperature: ${latestReading.temperature?.toFixed(1) || 'N/A'}°C
- AI Prediction: ${latestReading.predictionStatus || 'N/A'} (Score: ${latestReading.predictionScore || 'N/A'}/100, Risk Level: ${latestReading.predictionRiskLevel || 'N/A'})

**Historical Statistics** (Last ${readings.length} readings):
- Average pH: ${stats.avgPh?.toFixed(2) || 'N/A'}
- Average TDS: ${stats.avgTds?.toFixed(0) || 'N/A'} ppm
- Average Turbidity: ${stats.avgTurbidity?.toFixed(1) || 'N/A'} NTU
- Average Conductivity: ${stats.avgConductivity?.toFixed(0) || 'N/A'} μS/cm
- Safe Readings: ${stats.safeCount} (${readings.length > 0 ? ((stats.safeCount / readings.length) * 100).toFixed(1) : 0}%)
- Unsafe Readings: ${stats.unsafeCount} (${readings.length > 0 ? ((stats.unsafeCount / readings.length) * 100).toFixed(1) : 0}%)

**Recent Trend** (Last 10 readings):
${readings
  .slice(0, Math.min(10, readings.length))
  .map(
    (r, i) =>
      `${i + 1}. ${new Date(r.timestamp).toLocaleDateString()} - pH: ${r.ph?.toFixed(2) || 'N/A'}, TDS: ${r.tds?.toFixed(0) || 'N/A'} ppm, Status: ${r.predictionStatus || 'N/A'}`
  )
  .join('\n')}

${
  stats.unsafeCount > 0
    ? `\n⚠️ **Warning**: This device has ${stats.unsafeCount} unsafe readings in its history.\n**Recent Issues**: ${readings
        .filter((r) => r.predictionStatus === 'Unsafe')
        .slice(0, 3)
        .map((r) => r.predictionCauses?.join(', ') || 'Unknown cause')
        .join('; ')}`
    : '✅ **All Clear**: No unsafe readings detected in recent history.'
}
`;
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
