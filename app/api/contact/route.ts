import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactInquirySchema } from "@/lib/contact-schema";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const parsed = contactInquirySchema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          status: "error",
          message: "Please correct the highlighted fields",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        message: parsed.data.message,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: "ok",
      message: "Your message has been submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("[contact][POST]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to submit your message. Please try again.",
      },
      { status: 500 }
    );
  }
}
