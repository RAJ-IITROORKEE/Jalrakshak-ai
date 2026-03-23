import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const markRead = body?.isRead !== false;

    const updated = await prisma.alertNotification.update({
      where: { id },
      data: {
        isRead: markRead,
        readAt: markRead ? new Date() : null,
      },
    });

    return NextResponse.json({ status: "ok", data: updated });
  } catch (error) {
    console.error("[admin][notifications][PATCH]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.alertNotification.delete({ where: { id } });

    return NextResponse.json({ status: "ok", message: "Notification deleted" });
  } catch (error) {
    console.error("[admin][notifications][DELETE]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
