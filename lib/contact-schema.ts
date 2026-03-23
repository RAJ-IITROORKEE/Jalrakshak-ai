import { z } from "zod";

export const contactInquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(160, "Email must be at most 160 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});

export const adminContactListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
  status: z.enum(["PENDING", "RESOLVED", "ALL"]).default("ALL"),
});

export const adminContactUpdateSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED"]),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
