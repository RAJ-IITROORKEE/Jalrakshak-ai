"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MessageSquare,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";

interface AlertNotification {
  id: string;
  readingId: string;
  deviceId: string;
  deviceName: string;
  title: string;
  summary: string;
  predictionStatus: string | null;
  predictionRiskLevel: string | null;
  predictionScore: number | null;
  predictionConfidence: string | null;
  predictionCauses: string[];
  predictionActions: string[];
  predictionFutureRisk: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [selected, setSelected] = useState<AlertNotification | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "10",
          unreadOnly: unreadOnly ? "1" : "0",
        });
        if (query.trim()) {
          params.set("q", query.trim());
        }

        const response = await fetch(`/api/admin/notifications?${params.toString()}`);
        const data = await response.json();

        if (!response.ok || data.status !== "ok") {
          throw new Error(data.message || "Failed to fetch notifications");
        }

        setItems(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [query, unreadOnly]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const markAsRead = async (item: AlertNotification) => {
    if (item.isRead) return;
    try {
      const response = await fetch(`/api/admin/notifications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== "ok") {
        throw new Error(data.message || "Failed to mark as read");
      }

      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error(error);
      toast.error("Could not update notification status");
    }
  };

  const openDetails = async (item: AlertNotification) => {
    await markAsRead(item);
    setSelected(item);
    setViewOpen(true);
  };

  const deleteNotification = async (item: AlertNotification) => {
    setDeleting(item.id);
    try {
      const response = await fetch(`/api/admin/notifications/${item.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.message || "Failed to delete notification");
      }

      toast.success("Notification deleted");
      await fetchNotifications(pagination.page);
    } catch (error) {
      console.error(error);
      toast.error("Could not delete notification");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Alert Notifications
          </CardTitle>
          <CardDescription>
            Unsafe and risk alerts with prediction context and direct AI chat actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(searchInput);
              }}
              className="relative w-full md:max-w-sm"
            >
              <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search device or summary"
                className="pl-8"
              />
            </form>

            <Button
              variant={unreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setUnreadOnly((prev) => !prev)}
            >
              {unreadOnly ? "Unread only" : "Show all"}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No notifications found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className={!item.isRead ? "bg-destructive/5" : ""}>
                      <TableCell>
                        <p className="font-medium">{item.deviceName || item.deviceId}</p>
                        <p className="text-xs text-muted-foreground">{item.deviceId}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.predictionStatus === "Unsafe" ? "destructive" : "warning"}>
                          {item.predictionStatus || "Alert"}
                        </Badge>
                        {!item.isRead ? (
                          <span className="mt-1 block text-[10px] font-medium text-primary">Unread</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
                        {item.summary}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openDetails(item)}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Link href={`/device/${item.deviceId}/chat`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              AI Chat
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={deleting === item.id}
                            onClick={() => deleteNotification(item)}
                          >
                            {deleting === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchNotifications(pagination.page - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchNotifications(pagination.page + 1)}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.summary}</DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="font-semibold">{selected.deviceName || selected.deviceId}</p>
                  <p className="text-xs text-muted-foreground">{selected.deviceId}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Prediction</p>
                  <p className="font-semibold">
                    {selected.predictionStatus || "Alert"} · {selected.predictionRiskLevel || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score: {selected.predictionScore ?? "N/A"} · Confidence: {selected.predictionConfidence || "N/A"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Likely Causes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {(selected.predictionCauses || []).length > 0 ? (
                    selected.predictionCauses.map((cause, index) => <li key={index}>{cause}</li>)
                  ) : (
                    <li>Not available</li>
                  )}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Recommended Actions</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {(selected.predictionActions || []).length > 0 ? (
                    selected.predictionActions.map((action, index) => <li key={index}>{action}</li>)
                  ) : (
                    <li>Not available</li>
                  )}
                </ul>
              </div>

              {selected.predictionFutureRisk ? (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Future Risk</p>
                  <p className="mt-2 text-sm">{selected.predictionFutureRisk}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            {selected ? (
              <Link href={`/device/${selected.deviceId}/chat`}>
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Open AI Chat for this alert
                </Button>
              </Link>
            ) : null}
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
