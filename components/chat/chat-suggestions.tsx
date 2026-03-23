"use client";

import { SUGGESTED_QUESTIONS } from "@/lib/chat-prompts";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ChatSuggestionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatSuggestions({
  onSelect,
  disabled = false,
}: ChatSuggestionsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SUGGESTED_QUESTIONS.map((suggestion, i) => (
        <Button
          key={i}
          variant="outline"
          size="default"
          onClick={() => onSelect(suggestion.prompt)}
          disabled={disabled}
          className="h-auto cursor-pointer justify-start gap-2 border-border bg-background px-3 py-2 text-left text-xs hover:bg-accent"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{suggestion.text}</span>
        </Button>
      ))}
    </div>
  );
}
