import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminContactListQuerySchema } from "@/lib/contact-schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const query = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = adminContactListQuerySchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid query parameters",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { q, page, pageSize, status } = parsed.data;
    const where = {
      ...(status !== "ALL" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { message: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.contactInquiry.count({ where }),
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      status: "ok",
      data: items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("[admin][contacts][GET]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch contact inquiries",
      },
      { status: 500 }
    );
  }
}
