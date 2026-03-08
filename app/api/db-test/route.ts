/**
 * GET /api/db-test
 * Quick connectivity check — returns DB state and a device + reading count.
 * Remove or protect this endpoint before going to production.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Device } from "@/models/Device";
import { Reading } from "@/models/Reading";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [deviceCount, readingCount] = await Promise.all([
      Device.countDocuments(),
      Reading.countDocuments(),
    ]);

    return NextResponse.json({
      status: "ok",
      db: "connected",
      devices: deviceCount,
      readings: readingCount,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}
