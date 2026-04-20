/**
 * GET /api/jalrakshak-ai-data/public
 *
 * Public read-only endpoint for external consumers (e.g. IoT Tracker).
 * Returns the latest sensor readings + saved AI predictions from MongoDB.
 *
 * No authentication required — returns only safe, read-only telemetry data.
 *
 * Response shape:
 * {
 *   status:        "ok"
 *   source:        "mongodb" | "empty" | "error"
 *   count:         number          — number of devices returned
 *   totalReadings: number          — total readings stored across all devices
 *   lastDataAt:    string | null   — ISO timestamp of most recent reading
 *   latest:        PublicReading | null      — single most recent reading across all devices
 *   data:          PublicReading[]           — one per device (most recent reading)
 *   histories:     Record<deviceId, PublicReading[]>  — last 20 readings per device
 * }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const HISTORY_LIMIT = 20;

export const dynamic = "force-dynamic";

interface PublicPrediction {
  status: string;
  score: number;
  riskLevel: string;
  confidence: string;
  causes: string[];
  actions: string[];
  futureRisk: string | null;
}

interface PublicReading {
  id: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  receivedAt: string;
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  turbidity: number | null;
  conductivity: number | null;
  rssi: number | null;
  snr: number | null;
  spreadingFactor: number | null;
  prediction: PublicPrediction | null;
}

function toPublicReading(doc: {
  readingId: string;
  deviceId: string;
  deviceName: string;
  timestamp: Date;
  receivedAt: Date;
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  turbidity: number | null;
  conductivity: number | null;
  rssi: number | null;
  snr: number | null;
  spreadingFactor: number | null;
  predictionStatus: string | null;
  predictionScore: number | null;
  predictionRiskLevel: string | null;
  predictionConfidence: string | null;
  predictionCauses: string[];
  predictionActions: string[];
  predictionFutureRisk: string | null;
}): PublicReading {
  const hasPred = doc.predictionStatus != null && doc.predictionScore != null;
  return {
    id:              doc.readingId,
    deviceId:        doc.deviceId,
    deviceName:      doc.deviceName || doc.deviceId,
    timestamp:       doc.timestamp.toISOString(),
    receivedAt:      doc.receivedAt.toISOString(),
    temperature:     doc.temperature,
    ph:              doc.ph,
    tds:             doc.tds,
    turbidity:       doc.turbidity,
    conductivity:    doc.conductivity,
    rssi:            doc.rssi,
    snr:             doc.snr,
    spreadingFactor: doc.spreadingFactor,
    prediction: hasPred ? {
      status:     doc.predictionStatus as string,
      score:      doc.predictionScore as number,
      riskLevel:  doc.predictionRiskLevel ?? "Unknown",
      confidence: doc.predictionConfidence ?? "N/A",
      causes:     doc.predictionCauses ?? [],
      actions:    doc.predictionActions ?? [],
      futureRisk: doc.predictionFutureRisk ?? null,
    } : null,
  };
}

export async function GET() {
  // CORS headers so external sites can call this endpoint
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const deviceDocs = await prisma.device.findMany({
      orderBy: { lastSeen: "desc" },
    });

    if (deviceDocs.length === 0) {
      return NextResponse.json(
        {
          status: "ok",
          source: "empty",
          count: 0,
          totalReadings: 0,
          lastDataAt: null,
          latest: null,
          data: [],
          histories: {},
        },
        { headers: corsHeaders }
      );
    }

    const historyMap: Record<string, PublicReading[]> = {};
    const latestReadingMap: Record<string, PublicReading> = {};

    await Promise.all(
      deviceDocs.map(async (device) => {
        const readings = await prisma.reading.findMany({
          where:   { deviceId: device.deviceId },
          orderBy: { receivedAt: "desc" },
          take:    HISTORY_LIMIT,
        });
        const dtos = readings.map(toPublicReading);
        historyMap[device.deviceId] = dtos;
        if (dtos.length > 0) latestReadingMap[device.deviceId] = dtos[0];
      })
    );

    const data: PublicReading[] = deviceDocs
      .filter((d) => latestReadingMap[d.deviceId])
      .map((d) => latestReadingMap[d.deviceId]);

    // Global latest reading across all devices
    const allReadings = Object.values(latestReadingMap);
    const latest = allReadings.length > 0
      ? allReadings.sort(
          (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        )[0]
      : null;

    const totalReadings = deviceDocs.reduce((s, d) => s + (d.totalReadings ?? 0), 0);
    const lastDataAt    = latest?.receivedAt ?? null;

    return NextResponse.json(
      {
        status: "ok",
        source: "mongodb",
        count: data.length,
        totalReadings,
        lastDataAt,
        latest,
        data,
        histories: historyMap,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("[jalrakshak-ai-data/public] DB error:", err);
    return NextResponse.json(
      {
        status: "error",
        source: "error",
        count: 0,
        totalReadings: 0,
        lastDataAt: null,
        latest: null,
        data: [],
        histories: {},
        error: "Internal server error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
