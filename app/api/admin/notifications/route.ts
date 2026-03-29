import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH() {
  try {
    // Mark all unread notifications as read
    const result = await prisma.alertNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      status: "ok",
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    });
  } catch (error) {
    console.error("[admin][notifications][PATCH]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const pageSize = Math.min(Number(req.nextUrl.searchParams.get("pageSize") ?? "10"), 50);
    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") === "1";

    const where = {
      ...(unreadOnly ? { isRead: false } : {}),
      ...(query
        ? {
            OR: [
              { deviceId: { contains: query, mode: "insensitive" as const } },
              { deviceName: { contains: query, mode: "insensitive" as const } },
              { summary: { contains: query, mode: "insensitive" as const } },
              { title: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, unreadCount, items] = await Promise.all([
      prisma.alertNotification.count({ where }),
      prisma.alertNotification.count({ where: { isRead: false } }),
      prisma.alertNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Math.max(1, page) - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      status: "ok",
      data: items,
      unreadCount,
      pagination: {
        page: Math.max(1, page),
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("[admin][notifications][GET]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
