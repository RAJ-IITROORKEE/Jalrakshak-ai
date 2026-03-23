/**
 * Chat History API Route
 * GET /api/chat/history/[deviceId]
 * 
 * Returns chat message history for a specific device
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    // Fetch chat messages (last 100)
    const messages = await prisma.chatMessage.findMany({
      where: { deviceId },
      orderBy: { timestamp: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
