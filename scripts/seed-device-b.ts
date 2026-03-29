/**
 * Script to seed Device B with 80 readings
 * Run with: npx tsx scripts/seed-device-b.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEVICE_ID = "device-b";
const DEVICE_NAME = "Device B - Demo Unit";
const TOTAL_READINGS = 80;
const UNSAFE_READINGS = 20;

// Spread readings over the last 7 days
const HISTORY_SPAN_MS = 7 * 24 * 60 * 60 * 1000;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// Calculate safety score (matching lib/predict.ts logic)
function calculateSafetyScore(
  ph: number,
  tds: number,
  conductivity: number,
  turbidity: number
): number {
  let score = 100;
  if (turbidity > 5) score -= 30;
  if (tds > 500) score -= 25;
  if (ph < 6.5 || ph > 8.5) score -= 20;
  if (conductivity > 600) score -= 15;
  return Math.max(score, 0);
}

function detectCauses(ph: number, tds: number, conductivity: number, turbidity: number): string[] {
  const causes: string[] = [];
  if (turbidity > 5) causes.push("High turbidity detected (possible sediment contamination or soil runoff)");
  if (tds > 500) causes.push("High TDS detected (possible industrial waste or mineral contamination)");
  if (ph < 6.5) causes.push("Water is acidic (possible chemical contamination or acid rain)");
  if (ph > 8.5) causes.push("Water is alkaline (possible waste discharge or mineral imbalance)");
  if (conductivity > 600) causes.push("High conductivity detected (excess dissolved salts in water)");
  if (causes.length === 0) causes.push("No major contamination indicators detected");
  return causes;
}

function recommendActions(ph: number, tds: number, conductivity: number, turbidity: number): string[] {
  const actions: string[] = [];
  if (turbidity > 5) actions.push("Use sediment filtration or allow water to settle before use");
  if (tds > 500) actions.push("Install reverse osmosis (RO) purification system");
  if (ph < 6.5 || ph > 8.5) actions.push("Test water for chemical pollutants and adjust pH levels");
  if (conductivity > 600) actions.push("Investigate possible industrial discharge near the water source");
  if (actions.length === 0) actions.push("Water quality appears stable. Continue regular monitoring.");
  return actions;
}

function getRiskLevel(score: number): "Low" | "Moderate" | "High" {
  if (score >= 80) return "Low";
  if (score >= 50) return "Moderate";
  return "High";
}

function calculateConfidence(score: number): string {
  const distFromBoundary = Math.abs(score - 50);
  const confidence = Math.min(50 + distFromBoundary * 0.8, 97);
  return `${confidence.toFixed(1)}%`;
}

// Generate safe sensor values
function generateSafeValues() {
  return {
    ph: Number((6.8 + Math.random() * 1.2).toFixed(2)),
    tds: Number((120 + Math.random() * 150).toFixed(1)),
    turbidity: Number((0.5 + Math.random() * 2.5).toFixed(2)),
    temperature: Number((22 + Math.random() * 8).toFixed(1)),
  };
}

// Generate unsafe sensor values - ALWAYS guaranteed to get score < 50
function generateUnsafeValues(anomalyType: number) {
  // All unsafe values combine multiple issues to guarantee score < 50
  switch (anomalyType % 5) {
    case 0: // High turbidity + TDS (score = 100 - 30 - 25 = 45)
      return { 
        ph: Number((7.0 + Math.random() * 0.5).toFixed(2)),
        turbidity: Number((8 + Math.random() * 5).toFixed(2)),    // 8 - 13 NTU (-30)
        tds: Number((550 + Math.random() * 100).toFixed(1)),      // 550 - 650 ppm (-25)
        temperature: Number((24 + Math.random() * 6).toFixed(1)),
      };
    case 1: // High TDS + turbidity + conductivity (score = 100 - 30 - 25 - 15 = 30)
      return { 
        ph: Number((7.2 + Math.random() * 0.5).toFixed(2)),
        tds: Number((600 + Math.random() * 150).toFixed(1)),      // 600 - 750 ppm (-25)
        turbidity: Number((7 + Math.random() * 4).toFixed(2)),    // 7 - 11 NTU (-30)
        temperature: Number((26 + Math.random() * 5).toFixed(1)),
      };
    case 2: // Low pH + high turbidity (score = 100 - 20 - 30 = 50, edge case so add TDS)
      return { 
        ph: Number((5.5 + Math.random() * 0.8).toFixed(2)),       // 5.5 - 6.3 (-20)
        turbidity: Number((8 + Math.random() * 5).toFixed(2)),    // 8 - 13 NTU (-30)
        tds: Number((520 + Math.random() * 80).toFixed(1)),       // 520 - 600 ppm (-25)
        temperature: Number((23 + Math.random() * 5).toFixed(1)),
      };
    case 3: // High pH + high TDS + turbidity (score = 100 - 20 - 25 - 30 = 25)
      return { 
        ph: Number((9.0 + Math.random() * 0.5).toFixed(2)),       // 9.0 - 9.5 (-20)
        tds: Number((550 + Math.random() * 150).toFixed(1)),      // 550 - 700 ppm (-25)
        turbidity: Number((6 + Math.random() * 4).toFixed(2)),    // 6 - 10 NTU (-30)
        temperature: Number((28 + Math.random() * 6).toFixed(1)),
      };
    case 4: // Severe contamination - all factors (score = 100 - 30 - 25 - 20 - 15 = 10)
      return {
        ph: Number((5.0 + Math.random() * 0.5).toFixed(2)),       // 5.0 - 5.5 (-20)
        tds: Number((700 + Math.random() * 200).toFixed(1)),      // 700 - 900 ppm (-25)
        turbidity: Number((12 + Math.random() * 5).toFixed(2)),   // 12 - 17 NTU (-30)
        temperature: Number((35 + Math.random() * 5).toFixed(1)), // 35 - 40°C
      };
    default:
      return {
        ph: 7.0,
        tds: 600,
        turbidity: 10,
        temperature: 30,
      };
  }
}

async function main() {
  console.log("🚀 Starting Device B seeding...\n");

  // Check existing readings
  const existingReadings = await prisma.reading.count({
    where: { deviceId: DEVICE_ID },
  });

  console.log(`📊 Current Device B readings: ${existingReadings}`);

  // Always delete existing to reseed fresh
  if (existingReadings > 0) {
    console.log(`🗑️  Deleting ${existingReadings} existing readings for fresh seed...`);
    await prisma.reading.deleteMany({ where: { deviceId: DEVICE_ID } });
    await prisma.alertNotification.deleteMany({ where: { deviceId: DEVICE_ID } });
  }

  const now = Date.now();
  const readings: any[] = [];

  // Create timestamps
  const timestamps: Date[] = [];
  for (let i = 0; i < TOTAL_READINGS; i++) {
    const offset = HISTORY_SPAN_MS - (HISTORY_SPAN_MS / TOTAL_READINGS) * i;
    timestamps.push(new Date(now - offset));
  }

  // Determine unsafe indices - spread throughout but NOT in the last 5 readings
  const unsafeIndices = new Set<number>();
  while (unsafeIndices.size < UNSAFE_READINGS) {
    // Only pick from first 75 readings, keeping last 5 safe for demo
    const idx = Math.floor(Math.random() * (TOTAL_READINGS - 5));
    unsafeIndices.add(idx);
  }

  let unsafeCounter = 0;

  console.log("\n📝 Generating readings...");

  for (let i = 0; i < TOTAL_READINGS; i++) {
    const isUnsafe = unsafeIndices.has(i);
    const values = isUnsafe ? generateUnsafeValues(unsafeCounter++) : generateSafeValues();
    const conductivity = Number((values.tds * 2 * (0.95 + Math.random() * 0.1)).toFixed(2));

    const score = calculateSafetyScore(values.ph, values.tds, conductivity, values.turbidity);
    const status = score < 50 ? "Unsafe" : "Safe";
    const riskLevel = getRiskLevel(score);
    const confidence = calculateConfidence(score);
    const causes = detectCauses(values.ph, values.tds, conductivity, values.turbidity);
    const actions = recommendActions(values.ph, values.tds, conductivity, values.turbidity);

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
      predictionStatus: status,
      predictionScore: score,
      predictionRiskLevel: riskLevel,
      predictionConfidence: confidence,
      predictionCauses: causes,
      predictionActions: actions,
      predictionFutureRisk: "Water parameters stable",
    });

    if ((i + 1) % 20 === 0) {
      console.log(`   Generated ${i + 1}/${TOTAL_READINGS} readings...`);
    }
  }

  // Insert readings
  console.log("\n💾 Inserting readings into database...");
  await prisma.reading.createMany({ data: readings });

  // Update/create device
  const latest = readings[readings.length - 1];
  
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

  // Count results
  const safeCount = readings.filter(r => r.predictionStatus === "Safe").length;
  const unsafeCount = readings.filter(r => r.predictionStatus === "Unsafe").length;

  console.log("\n✅ Device B seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📱 Device ID:      ${DEVICE_ID}`);
  console.log(`📛 Device Name:    ${DEVICE_NAME}`);
  console.log(`📊 Total Readings: ${readings.length}`);
  console.log(`✅ Safe Readings:  ${safeCount}`);
  console.log(`⚠️  Unsafe Readings: ${unsafeCount}`);
  console.log(`📅 Date Range:     ${readings[0].timestamp.toLocaleDateString()} - ${latest.timestamp.toLocaleDateString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Latest Reading:");
  console.log(`   pH:          ${latest.ph}`);
  console.log(`   TDS:         ${latest.tds} ppm`);
  console.log(`   Turbidity:   ${latest.turbidity} NTU`);
  console.log(`   Temperature: ${latest.temperature}°C`);
  console.log(`   Status:      ${latest.predictionStatus}`);
  console.log(`   Score:       ${latest.predictionScore}/100`);
  console.log(`   Risk Level:  ${latest.predictionRiskLevel}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
