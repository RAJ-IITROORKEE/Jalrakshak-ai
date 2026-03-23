"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  submitLabel?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask about pH trends, safety concerns, recommendations...",
  value,
  onValueChange,
  submitLabel = "Send message",
}: ChatInputProps) {
  const [internalMessage, setInternalMessage] = useState("");
  const isControlled = typeof value === "string";
  const message = isControlled ? value : internalMessage;

  const setMessage = (nextValue: string) => {
    if (!isControlled) {
      setInternalMessage(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
            "focus-visible:ring-offset-0"
          )}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          aria-label={submitLabel}
          title={submitLabel}
          className="h-[44px] w-[44px] shrink-0 rounded-xl"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="mt-2 px-1 text-xs text-muted-foreground">Enter to send, Shift + Enter for new line</p>
    </div>
  );
}
