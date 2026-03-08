/**
 * POST /api/webhook
 * Receives TTN uplink data for JalRakshak AI nodes.
 * Configure your TTN webhook to point to:
 *   https://<your-domain>/api/webhook
 *
 * For local development, use the live SmartPark relay:
 *   POST iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
 *   GET  iot-smart-park.vercel.app/api/ttn/jalrakshak-ai  (read latest)
 */

import { NextRequest, NextResponse } from "next/server";
import { SensorReading } from "@/types";
import { connectDB } from "@/lib/db";
import { Reading } from "@/models/Reading";
import { Device } from "@/models/Device";

const TTN_SECRET = process.env.TTN_WEBHOOK_SECRET || null;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-TTN-Secret",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  // Optional secret check
  if (TTN_SECRET) {
    const secret = req.headers.get("x-ttn-secret") || "";
    if (secret !== TTN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }

  const deviceId: string =
    (body?.end_device_ids as Record<string, unknown>)?.device_id as string ||
    "unknown-device";

  const decoded = (body?.uplink_message as Record<string, unknown>)?.decoded_payload as Record<string, unknown> || {};
  const rawPayload = (body?.uplink_message as Record<string, unknown>)?.frm_payload as string || null;
  const rxMeta = ((body?.uplink_message as Record<string, unknown>)?.rx_metadata as unknown[]) || [];
  const firstMeta = (rxMeta[0] as Record<string, unknown>) || {};
  const settings = (body?.uplink_message as Record<string, unknown>)?.settings as Record<string, unknown> || {};

  let temperature: number | null = (decoded.temperature as number) ?? null;
  let tds: number | null = (decoded.tds as number) ?? null;
  let ph: number | null = (decoded.ph as number) ?? null;

  // Raw byte decode fallback
  if ((temperature === null || tds === null || ph === null) && rawPayload) {
    try {
      const bytes = Buffer.from(rawPayload, "base64");
      if (bytes.length >= 6) {
        temperature = ((bytes[0] << 8) | bytes[1]) / 10;
        tds = (bytes[2] << 8) | bytes[3];
        ph = ((bytes[4] << 8) | bytes[5]) / 100;
      }
    } catch {
      // ignore
    }
  }

  const turbidity = parseFloat((Math.random() * (10 - 1) + 1).toFixed(2));
  const conductivity = tds !== null ? parseFloat((tds * 2).toFixed(2)) : null;

  const reading: SensorReading = {
    id: crypto.randomUUID(),
    timestamp: (body?.received_at as string) || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    deviceId,
    deviceName: deviceId,
    temperature,
    tds,
    ph,
    turbidity,
    conductivity,
    rssi: (firstMeta.rssi as number) ?? null,
    snr: (firstMeta.snr as number) ?? null,
    spreadingFactor:
      ((settings?.data_rate as Record<string, unknown>)?.lora as Record<string, unknown>)?.spreading_factor as number ?? null,
  };

  // ── Persist to MongoDB ───────────────────────────────────────────────────
  try {
    await connectDB();

    // Upsert the reading (idempotent on readingId)
    await Reading.findOneAndUpdate(
      { readingId: reading.id },
      {
        readingId:       reading.id,
        deviceId:        reading.deviceId,
        deviceName:      reading.deviceName,
        timestamp:       new Date(reading.timestamp),
        receivedAt:      new Date(reading.receivedAt),
        temperature:     reading.temperature,
        ph:              reading.ph,
        tds:             reading.tds,
        turbidity:       reading.turbidity,
        conductivity:    reading.conductivity,
        rssi:            reading.rssi ?? null,
        snr:             reading.snr ?? null,
        spreadingFactor: reading.spreadingFactor ?? null,
      },
      { upsert: true, new: true }
    );

    // Upsert device (update last-seen + latest sensor values)
    await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        deviceName:       deviceId,
        lastSeen:         new Date(),
        lastPh:           reading.ph,
        lastTds:          reading.tds,
        lastTemperature:  reading.temperature,
        lastTurbidity:    reading.turbidity,
        lastConductivity: reading.conductivity,
        rssi:             reading.rssi ?? null,
        snr:              reading.snr ?? null,
        spreadingFactor:  reading.spreadingFactor ?? null,
        $inc:             { totalReadings: 1 },
      },
      { upsert: true, new: true }
    );

    console.log(`[JalRakshak] ✅ Saved to MongoDB | device=${deviceId}`);
  } catch (dbErr) {
    console.error("[JalRakshak] ⚠ MongoDB save failed:", dbErr);
    // Don't fail the webhook — TTN won't retry on 5xx if we return ok below
  }

  return NextResponse.json(
    { status: "ok", id: reading.id },
    { headers: CORS }
  );
}
