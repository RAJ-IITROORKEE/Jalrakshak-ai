"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { cn } from "@/lib/utils";

interface AiChatButtonProps {
  href: string;
  label?: string;
  className?: string;
  fullWidth?: boolean;
}

export function AiChatButton({
  href,
  label = "AI Chat",
  className,
  fullWidth = false,
}: AiChatButtonProps) {
  return (
    <Link href={href} className={cn(fullWidth ? "block w-full" : "inline-block", className)}>
      <HoverBorderGradient
        as="div"
        containerClassName={cn("rounded-full", fullWidth && "w-full")}
        className={cn(
          "rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground",
          "flex items-center justify-center gap-2",
          fullWidth && "w-full"
        )}
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </HoverBorderGradient>
    </Link>
  );
}
