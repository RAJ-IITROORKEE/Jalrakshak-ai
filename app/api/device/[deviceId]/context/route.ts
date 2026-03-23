/**
 * Device Context API Route
 * GET /api/device/[deviceId]/context
 * 
 * Returns comprehensive device data for AI context including:
 * - Device metadata
 * - Historical readings (last 500)
 * - Calculated statistics
 */

import { prisma } from "@/lib/prisma";
import { calculateDeviceStats } from "@/lib/chat-context";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    // Fetch device
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    // Fetch readings (limit to last 500 for performance)
    const readings = await prisma.reading.findMany({
      where: { deviceId },
      orderBy: { receivedAt: "desc" },
      take: 500,
    });

    // Calculate statistics
    const stats = calculateDeviceStats(readings);

    return NextResponse.json({
      device,
      readings,
      stats,
    });
  } catch (error) {
    console.error("Error fetching device context:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
