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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const body = await req.json().catch(() => ({}));
    const sessionMessageIds = Array.isArray(body?.sessionMessageIds)
      ? (body.sessionMessageIds as string[])
      : [];

    if (sessionMessageIds.length === 0) {
      return NextResponse.json(
        { error: "sessionMessageIds are required" },
        { status: 400 }
      );
    }

    const result = await prisma.chatMessage.deleteMany({
      where: {
        deviceId,
        messageId: { in: sessionMessageIds },
      },
    });

    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
