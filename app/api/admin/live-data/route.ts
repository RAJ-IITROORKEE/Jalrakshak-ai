/**
 * GET /api/admin/live-data
 * Returns the last N readings across all devices, newest first.
 * Used by the admin live-data log page.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 200);

  try {
    const readings = await prisma.reading.findMany({
      orderBy: { receivedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      status: "ok",
      count: readings.length,
      fetchedAt: new Date().toISOString(),
      data: readings,
    });
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}
