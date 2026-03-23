"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Loader2,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  startedAt: Date;
  updatedAt: Date;
  messages: Message[];
}

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  lastSeen: string | Date;
  totalReadings: number;
}

interface ContextStats {
  safeCount: number;
  unsafeCount: number;
  totalReadings: number;
}

interface ContextReading {
  predictionStatus: string | null;
  predictionRiskLevel: string | null;
}

interface DeviceContextResponse {
  stats?: ContextStats;
  readings?: ContextReading[];
}

interface ChatInterfaceProps {
  deviceId: string;
  device: DeviceInfo;
}

const SESSION_BREAK_MS = 45 * 60 * 1000;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatChatTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatSidebarTime(value: Date): string {
  const now = new Date();
  const sameDay =
    now.getFullYear() === value.getFullYear() &&
    now.getMonth() === value.getMonth() &&
    now.getDate() === value.getDate();

  if (sameDay) return formatChatTime(value);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function buildSessionTitle(messages: Message[]): string {
  const firstPrompt = messages.find((m) => m.role === "user")?.content;
  if (!firstPrompt) return "New chat";

  const trimmed = firstPrompt.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 48)}...`;
}

function groupMessagesIntoSessions(messages: Message[]): ChatSession[] {
  if (messages.length === 0) return [];

  const ordered = [...messages].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  const sessions: ChatSession[] = [];
  let current: ChatSession | null = null;
  let previousAt = 0;

  for (const message of ordered) {
    const currentAt = message.timestamp.getTime();
    const shouldSplit =
      current &&
      message.role === "user" &&
      currentAt - previousAt > SESSION_BREAK_MS;

    if (!current || shouldSplit) {
      current = {
        id: `session-${message.id}`,
        title: "New chat",
        startedAt: message.timestamp,
        updatedAt: message.timestamp,
        messages: [],
      };
      sessions.push(current);
    }

    current.messages.push(message);
    current.updatedAt = message.timestamp;
    previousAt = currentAt;
  }

  return sessions
    .map((session) => ({
      ...session,
      title: buildSessionTitle(session.messages),
    }))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function emptySession(): ChatSession {
  const now = new Date();
  return {
    id: `session-local-${crypto.randomUUID()}`,
    title: "New chat",
    startedAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function ChatInterface({ deviceId, device }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [context, setContext] = useState<DeviceContextResponse | null>(null);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const query = search.toLowerCase();
    return sessions.filter((session) => {
      if (session.title.toLowerCase().includes(query)) return true;
      return session.messages.some((message) =>
        message.content.toLowerCase().includes(query)
      );
    });
  }, [search, sessions]);

  const isOffline =
    Date.now() - toDate(device.lastSeen).getTime() > 2 * 60 * 1000;

  const latestPrediction = context?.readings?.[0]?.predictionStatus ?? null;
  const latestRiskLevel = context?.readings?.[0]?.predictionRiskLevel ?? null;

  const safeCount = context?.stats?.safeCount ?? 0;
  const unsafeCount = context?.stats?.unsafeCount ?? 0;

  useEffect(() => {
    const loadHistoryAndContext = async () => {
      try {
        const [historyRes, contextRes] = await Promise.all([
          fetch(`/api/chat/history/${deviceId}`),
          fetch(`/api/device/${deviceId}/context`),
        ]);

        const historyData = (await historyRes.json()) as {
          messages?: Array<{
            messageId: string;
            role: "user" | "assistant" | "system";
            content: string;
            timestamp: string;
          }>;
        };

        if (contextRes.ok) {
          const contextData = (await contextRes.json()) as DeviceContextResponse;
          setContext(contextData);
        }

        if (historyData.messages && historyData.messages.length > 0) {
          const parsedMessages = historyData.messages.map((m) => ({
            id: m.messageId,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
          }));
          const nextSessions = groupMessagesIntoSessions(parsedMessages);

          setSessions(nextSessions);
          setActiveSessionId(nextSessions[0]?.id ?? "");
        } else {
          const fresh = emptySession();
          setSessions([fresh]);
          setActiveSessionId(fresh.id);
        }
      } catch (error) {
        console.error("Failed to load chat data:", error);
        const fresh = emptySession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistoryAndContext();
  }, [deviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, isLoading]);

  const createNewChat = () => {
    const fresh = emptySession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setSearch("");
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSession || isLoading) return;

    const targetSessionId = activeSession.id;
    const previousMessages = activeSession.messages;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev
        .map((session) => {
          if (session.id !== targetSessionId) return session;
          const updatedMessages = [...session.messages, userMessage];
          return {
            ...session,
            title:
              session.title === "New chat"
                ? buildSessionTitle(updatedMessages)
                : session.title,
            updatedAt: userMessage.timestamp,
            messages: updatedMessages,
          };
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    );

    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          message: content,
          conversationHistory: previousMessages.filter(
            (message) => message.role === "user" || message.role === "assistant"
          ),
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = (await res.json()) as { message: string };
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev
          .map((session) =>
            session.id === targetSessionId
              ? {
                  ...session,
                  updatedAt: assistantMessage.timestamp,
                  messages: [...session.messages, assistantMessage],
                }
              : session
          )
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Sorry, I encountered an error processing your request. Please try again.";

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: message,
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev
          .map((session) =>
            session.id === targetSessionId
              ? {
                  ...session,
                  updatedAt: errorMessage.timestamp,
                  messages: [...session.messages, errorMessage],
                }
              : session
          )
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-4">
        <Button
          onClick={createNewChat}
          className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chats"
            className="h-9 border-sidebar-border bg-sidebar pl-8"
          />
        </div>
      </div>

      <div className="space-y-3 border-b border-sidebar-border p-4">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Device context
          </p>
          <p className="mt-1 truncate text-sm font-semibold">
            {device.deviceName || device.deviceId}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={isOffline ? "outline" : "success"} className="text-[11px]">
              {isOffline ? "Offline" : "Live"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {device.totalReadings} readings
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last seen {toDate(device.lastSeen).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Predictions snapshot
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5">
              <span className="block text-muted-foreground">Safe</span>
              <span className="font-semibold">{safeCount}</span>
            </div>
            <div className="rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5">
              <span className="block text-muted-foreground">Unsafe</span>
              <span className="font-semibold">{unsafeCount}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            {latestPrediction === "Unsafe" ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-muted-foreground">Latest:</span>
            <span className="font-medium">{latestPrediction ?? "No prediction"}</span>
            {latestRiskLevel ? (
              <span className="text-muted-foreground">({latestRiskLevel})</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Chats
        </p>

        <div className="space-y-1">
          {filteredSessions.map((session) => {
            const last = session.messages[session.messages.length - 1];
            const isActive = session.id === activeSessionId;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full cursor-pointer rounded-lg border border-transparent px-3 py-2 text-left transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/70"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{session.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatSidebarTime(session.updatedAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {last ? last.content : "Start a fresh conversation for this device"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      <aside className="hidden w-80 border-r border-sidebar-border bg-sidebar md:block">
        {sidebarContent}
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[320px] max-w-[85vw] p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Chat sessions</SheetTitle>
            <SheetDescription>Browse chat history and device context</SheetDescription>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold md:text-base">
                {device.deviceName || device.deviceId}
              </p>
              <p className="truncate text-xs text-muted-foreground">Device {device.deviceId}</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              {device.totalReadings} readings
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              {latestPrediction ?? "No prediction"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {toDate(device.lastSeen).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/20">
          <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-6 pt-6 md:px-6">
            {activeSession && activeSession.messages.length > 0 ? (
              <div className="space-y-5">
                {activeSession.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight">Ask about this device</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  This chat is grounded in the selected device context, historical readings, and prediction history. Ask for analysis, anomaly detection, risk explanation, or action recommendations.
                </p>
                <div className="mt-5">
                  <ChatSuggestions onSelect={handleSendMessage} disabled={isLoading} />
                </div>
              </div>
            )}

            {isLoading && (
              <div className="mt-5 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
                  <p className="text-sm text-muted-foreground">Analyzing device history and predictions...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
