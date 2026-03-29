"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Loader2, MessageSquare, TriangleAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AlertItem {
  id: string;
  deviceId: string;
  deviceName: string;
  summary: string;
  predictionRiskLevel: string | null;
  createdAt: string;
  isRead: boolean;
}

export function AdminNotificationsBell() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?page=1&pageSize=8");
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setItems(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const timer = window.setInterval(fetchItems, 20000);
    return () => window.clearInterval(timer);
  }, [fetchItems]);

  const markAsRead = async (item: AlertItem) => {
    if (item.isRead) return;
    setMarkingId(item.id);
    try {
      await fetch(`/api/admin/notifications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
      });
      if (res.ok) {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadBadge = useMemo(() => {
    if (unreadCount <= 0) return null;
    return unreadCount > 9 ? "9+" : String(unreadCount);
  }, [unreadCount]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4.5 w-4.5" />
          {unreadBadge ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadBadge}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alert Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                disabled={markingAll}
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </Button>
            )}
            <Badge variant="outline" className="text-[10px]">
              {unreadCount} unread
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading alerts...
          </div>
        ) : items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No alert notifications yet.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="flex cursor-pointer items-start gap-3 px-3 py-2"
                onSelect={(event) => {
                  event.preventDefault();
                  markAsRead(item);
                }}
              >
                <span className="mt-0.5 rounded-full bg-destructive/10 p-1">
                  <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{item.deviceName || item.deviceId}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {item.predictionRiskLevel || "Risk"} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Link href={`/device/${item.deviceId}/chat`} className="shrink-0">
                  <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[10px]">
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </Button>
                </Link>
                {markingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/notifications" className="text-xs font-medium">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
