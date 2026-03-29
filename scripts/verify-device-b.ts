import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("📊 Verifying Device B data...\n");

  const device = await prisma.device.findUnique({ 
    where: { deviceId: "device-b" } 
  });
  
  if (!device) {
    console.log("❌ Device B not found!");
    return;
  }

  console.log("✅ Device B found:");
  console.log(`   Name: ${device.deviceName}`);
  console.log(`   Last Seen: ${device.lastSeen}`);
  console.log(`   Total Readings: ${device.totalReadings}`);
  console.log(`   Latest pH: ${device.lastPh}`);
  console.log(`   Latest TDS: ${device.lastTds}`);

  const total = await prisma.reading.count({ where: { deviceId: "device-b" } });
  const safe = await prisma.reading.count({ where: { deviceId: "device-b", predictionStatus: "Safe" } });
  const unsafe = await prisma.reading.count({ where: { deviceId: "device-b", predictionStatus: "Unsafe" } });

  console.log("\n📈 Reading Statistics:");
  console.log(`   Total: ${total}`);
  console.log(`   Safe: ${safe}`);
  console.log(`   Unsafe: ${unsafe}`);

  const recent = await prisma.reading.findMany({
    where: { deviceId: "device-b" },
    orderBy: { receivedAt: "desc" },
    take: 5,
  });

  console.log("\n🕐 Recent 5 Readings:");
  recent.forEach((r, i) => {
    console.log(`   ${i+1}. ${r.predictionStatus} (${r.predictionScore}/100) - pH:${r.ph}, TDS:${r.tds}, Turb:${r.turbidity}`);
  });

  await prisma.$disconnect();
}

verify().catch(console.error);
