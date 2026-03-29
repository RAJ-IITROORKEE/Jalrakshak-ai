/**
 * POST /api/seed-device-b
 *
 * Seeds Device B with 80 realistic readings for demo/presentation:
 * - 60 Safe readings with normal sensor values
 * - 20 Unsafe readings with varied anomalies (pH, TDS, turbidity changes)
 * 
 * Each reading includes proper prediction data stored in the database.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { predictWaterQuality } from "@/lib/predict";
import { invalidateDeviceContextCache } from "@/lib/device-context-cache";

export const dynamic = "force-dynamic";

const DEVICE_ID = "device-b";
const DEVICE_NAME = "Device B - Demo Unit";
const TOTAL_READINGS = 80;
const SAFE_READINGS = 60;
const UNSAFE_READINGS = 20;

// Spread readings over the last 7 days
const HISTORY_SPAN_MS = 7 * 24 * 60 * 60 * 1000;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// Generate safe sensor values (within WHO guidelines)
function generateSafeValues() {
  return {
    ph: Number((6.8 + Math.random() * 1.2).toFixed(2)),           // 6.8 - 8.0 (safe range)
    tds: Number((120 + Math.random() * 150).toFixed(1)),          // 120 - 270 ppm (excellent)
    turbidity: Number((0.5 + Math.random() * 2.5).toFixed(2)),    // 0.5 - 3.0 NTU (safe)
    temperature: Number((22 + Math.random() * 8).toFixed(1)),     // 22 - 30°C (normal)
  };
}

// Generate unsafe sensor values with varied anomalies
function generateUnsafeValues(anomalyType: number) {
  const base = generateSafeValues();
  
  switch (anomalyType % 5) {
    case 0: // High turbidity (sediment/contamination)
      return {
        ...base,
        turbidity: Number((6 + Math.random() * 6).toFixed(2)),    // 6 - 12 NTU (high)
      };
    case 1: // High TDS (industrial/mineral contamination)
      return {
        ...base,
        tds: Number((520 + Math.random() * 200).toFixed(1)),      // 520 - 720 ppm (poor)
      };
    case 2: // Low pH (acidic - chemical contamination)
      return {
        ...base,
        ph: Number((5.5 + Math.random() * 0.8).toFixed(2)),       // 5.5 - 6.3 (acidic)
      };
    case 3: // High pH (alkaline - waste discharge)
      return {
        ...base,
        ph: Number((8.8 + Math.random() * 0.7).toFixed(2)),       // 8.8 - 9.5 (alkaline)
      };
    case 4: // Multiple issues (high TDS + turbidity)
      return {
        ...base,
        tds: Number((550 + Math.random() * 150).toFixed(1)),
        turbidity: Number((5.5 + Math.random() * 4).toFixed(2)),
        temperature: Number((32 + Math.random() * 8).toFixed(1)), // 32 - 40°C (warm)
      };
    default:
      return base;
  }
}

export async function POST() {
  try {
    // Check if device-b already has readings
    const existingReadings = await prisma.reading.count({
      where: { deviceId: DEVICE_ID },
    });

    if (existingReadings >= 80) {
      return NextResponse.json({
        status: "skipped",
        message: `Device B already has ${existingReadings} readings. No seeding needed.`,
        existingReadings,
      });
    }

    // If some readings exist, delete them to start fresh
    if (existingReadings > 0) {
      await prisma.reading.deleteMany({ where: { deviceId: DEVICE_ID } });
      await prisma.alertNotification.deleteMany({ where: { deviceId: DEVICE_ID } });
    }

    const now = Date.now();
    const readings: Array<{
      readingId: string;
      deviceId: string;
      deviceName: string;
      timestamp: Date;
      receivedAt: Date;
      temperature: number;
      ph: number;
      tds: number;
      turbidity: number;
      conductivity: number;
      rssi: number;
      snr: number;
      spreadingFactor: number;
      predictionStatus: string;
      predictionScore: number;
      predictionRiskLevel: string;
      predictionConfidence: string;
      predictionCauses: string[];
      predictionActions: string[];
      predictionFutureRisk: string;
    }> = [];

    // Create timestamps spread over the history span (oldest first)
    const timestamps: Date[] = [];
    for (let i = 0; i < TOTAL_READINGS; i++) {
      const offset = HISTORY_SPAN_MS - (HISTORY_SPAN_MS / TOTAL_READINGS) * i;
      timestamps.push(new Date(now - offset));
    }

    // Determine which readings will be unsafe (spread throughout the history)
    const unsafeIndices = new Set<number>();
    while (unsafeIndices.size < UNSAFE_READINGS) {
      // Spread unsafe readings throughout, with slight clustering for realism
      const idx = Math.floor(Math.random() * TOTAL_READINGS);
      unsafeIndices.add(idx);
    }

    let unsafeCounter = 0;

    for (let i = 0; i < TOTAL_READINGS; i++) {
      const isUnsafe = unsafeIndices.has(i);
      const values = isUnsafe 
        ? generateUnsafeValues(unsafeCounter++) 
        : generateSafeValues();

      const conductivity = Number((values.tds * 2 * (0.95 + Math.random() * 0.1)).toFixed(2));

      // Run prediction
      const prediction = predictWaterQuality({
        ph: values.ph,
        tds: values.tds,
        turbidity: values.turbidity,
        conductivity,
      });

      readings.push({
        readingId: crypto.randomUUID(),
        deviceId: DEVICE_ID,
        deviceName: DEVICE_NAME,
        timestamp: timestamps[i],
        receivedAt: timestamps[i],
        temperature: values.temperature,
        ph: values.ph,
        tds: values.tds,
        turbidity: values.turbidity,
        conductivity,
        rssi: -70 + Math.floor(Math.random() * 25),
        snr: Number((6 + Math.random() * 6).toFixed(1)),
        spreadingFactor: 7,
        predictionStatus: prediction.water_status,
        predictionScore: prediction.safety_score,
        predictionRiskLevel: prediction.risk_level,
        predictionConfidence: prediction.confidence,
        predictionCauses: prediction.possible_causes,
        predictionActions: prediction.recommended_actions,
        predictionFutureRisk: prediction.future_risk,
      });
    }

    // Batch create readings
    await prisma.reading.createMany({ data: readings });

    // Get the latest reading for device summary
    const latest = readings[readings.length - 1];

    // Upsert device
    await prisma.device.upsert({
      where: { deviceId: DEVICE_ID },
      create: {
        deviceId: DEVICE_ID,
        deviceName: DEVICE_NAME,
        isActive: true,
        lastSeen: latest.receivedAt,
        lastPh: latest.ph,
        lastTds: latest.tds,
        lastTemperature: latest.temperature,
        lastTurbidity: latest.turbidity,
        lastConductivity: latest.conductivity,
        rssi: latest.rssi,
        snr: latest.snr,
        spreadingFactor: latest.spreadingFactor,
        totalReadings: readings.length,
      },
      update: {
        deviceName: DEVICE_NAME,
        isActive: true,
        lastSeen: latest.receivedAt,
        lastPh: latest.ph,
        lastTds: latest.tds,
        lastTemperature: latest.temperature,
        lastTurbidity: latest.turbidity,
        lastConductivity: latest.conductivity,
        rssi: latest.rssi,
        snr: latest.snr,
        spreadingFactor: latest.spreadingFactor,
        totalReadings: readings.length,
      },
    });

    // Invalidate cache
    invalidateDeviceContextCache(DEVICE_ID);

    // Count actual safe/unsafe from predictions
    const safeCount = readings.filter(r => r.predictionStatus === "Safe").length;
    const unsafeCount = readings.filter(r => r.predictionStatus === "Unsafe").length;

    return NextResponse.json({
      status: "success",
      message: `Device B seeded with ${TOTAL_READINGS} readings for demo/presentation.`,
      deviceId: DEVICE_ID,
      deviceName: DEVICE_NAME,
      totalReadings: readings.length,
      safeReadings: safeCount,
      unsafeReadings: unsafeCount,
      latestReading: {
        timestamp: latest.timestamp,
        ph: latest.ph,
        tds: latest.tds,
        turbidity: latest.turbidity,
        temperature: latest.temperature,
        status: latest.predictionStatus,
        score: latest.predictionScore,
      },
      oldestReading: {
        timestamp: readings[0].timestamp,
      },
    });
  } catch (err) {
    console.error("[seed-device-b]", err);
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}

// GET endpoint to check current Device B status
export async function GET() {
  try {
    const device = await prisma.device.findUnique({
      where: { deviceId: DEVICE_ID },
    });

    const readingCount = await prisma.reading.count({
      where: { deviceId: DEVICE_ID },
    });

    const safeCount = await prisma.reading.count({
      where: { deviceId: DEVICE_ID, predictionStatus: "Safe" },
    });

    const unsafeCount = await prisma.reading.count({
      where: { deviceId: DEVICE_ID, predictionStatus: "Unsafe" },
    });

    const recentReadings = await prisma.reading.findMany({
      where: { deviceId: DEVICE_ID },
      orderBy: { receivedAt: "desc" },
      take: 5,
      select: {
        timestamp: true,
        ph: true,
        tds: true,
        turbidity: true,
        temperature: true,
        predictionStatus: true,
        predictionScore: true,
        predictionRiskLevel: true,
      },
    });

    return NextResponse.json({
      status: "ok",
      device: device ? {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        isActive: device.isActive,
        lastSeen: device.lastSeen,
        totalReadings: device.totalReadings,
      } : null,
      readingStats: {
        total: readingCount,
        safe: safeCount,
        unsafe: unsafeCount,
      },
      recentReadings,
    });
  } catch (err) {
    console.error("[seed-device-b] GET error:", err);
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}
