import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminContactUpdateSchema } from "@/lib/contact-schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = adminContactUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid payload",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: {
        status: parsed.data.status,
        resolvedAt: parsed.data.status === "RESOLVED" ? new Date() : null,
      },
    });

    return NextResponse.json({ status: "ok", data: updated });
  } catch (error) {
    console.error("[admin][contacts][PATCH]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update contact status",
      },
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

    await prisma.contactInquiry.delete({ where: { id } });

    return NextResponse.json({
      status: "ok",
      message: "Contact inquiry deleted",
    });
  } catch (error) {
    console.error("[admin][contacts][DELETE]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete contact inquiry",
      },
      { status: 500 }
    );
  }
}
