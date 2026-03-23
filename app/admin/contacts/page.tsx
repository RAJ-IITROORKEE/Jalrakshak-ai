"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";

type ContactStatus = "PENDING" | "RESOLVED";

interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  message: string;
  status: ContactStatus;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 10;

export default function AdminContactsPage() {
  const [items, setItems] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ContactStatus>("ALL");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [selected, setSelected] = useState<ContactInquiry | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContactInquiry | null>(null);
  const [rowLoadingId, setRowLoadingId] = useState<string | null>(null);

  const fetchContacts = useCallback(async (nextPage = pagination.page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
        status: statusFilter,
      });

      if (query.trim()) {
        params.set("q", query.trim());
      }

      const response = await fetch(`/api/admin/contacts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.message || "Failed to fetch contacts");
      }

      setItems(data.data as ContactInquiry[]);
      setPagination(data.pagination as PaginationState);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load contact inquiries");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, query, statusFilter]);

  useEffect(() => {
    fetchContacts(1);
  }, [fetchContacts]);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "PENDING").length,
    [items]
  );

  const resolvedCount = useMemo(
    () => items.filter((item) => item.status === "RESOLVED").length,
    [items]
  );

  const openView = (item: ContactInquiry) => {
    setSelected(item);
    setViewOpen(true);
  };

  const updateStatus = async (item: ContactInquiry, status: ContactStatus) => {
    setRowLoadingId(item.id);
    try {
      const response = await fetch(`/api/admin/contacts/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.message || "Failed to update status");
      }

      toast.success(`Marked as ${status === "RESOLVED" ? "resolved" : "pending"}`);
      await fetchContacts(pagination.page);
      if (selected?.id === item.id) {
        setSelected(data.data as ContactInquiry);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not update status");
    } finally {
      setRowLoadingId(null);
    }
  };

  const confirmDelete = (item: ContactInquiry) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setRowLoadingId(deleteItem.id);
    try {
      const response = await fetch(`/api/admin/contacts/${deleteItem.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.message || "Delete failed");
      }

      toast.success("Inquiry deleted");
      setDeleteOpen(false);
      setDeleteItem(null);
      await fetchContacts(pagination.page);
    } catch (error) {
      console.error(error);
      toast.error("Could not delete inquiry");
    } finally {
      setRowLoadingId(null);
    }
  };

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(searchInput);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pagination.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending (Page)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resolved (Page)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Inquiries</CardTitle>
          <CardDescription>
            Search, review, resolve, or delete contact requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form onSubmit={onSearchSubmit} className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email, message"
                className="pl-8"
              />
            </form>

            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("PENDING")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "RESOLVED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("RESOLVED")}
              >
                Resolved
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading inquiries...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No contact inquiries found for this filter.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.fullName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.email}</TableCell>
                      <TableCell>
                        {item.status === "RESOLVED" ? (
                          <Badge variant="success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock3 className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {item.message}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              {rowLoadingId === item.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="size-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openView(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {item.status === "PENDING" ? (
                              <DropdownMenuItem onClick={() => updateStatus(item, "RESOLVED")}>Mark Resolved</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => updateStatus(item, "PENDING")}>Mark Pending</DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(item)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchContacts(pagination.page - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchContacts(pagination.page + 1)}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Inquiry Details</DialogTitle>
            <DialogDescription>
              Submitted {selected ? formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true }) : ""}
            </DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium">{selected.fullName}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selected.email}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {selected.message}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={selected.status === "RESOLVED" ? "success" : "warning"}>
                  {selected.status === "RESOLVED" ? "Resolved" : "Pending"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Last updated {formatDistanceToNow(new Date(selected.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete inquiry?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!deleteItem}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
