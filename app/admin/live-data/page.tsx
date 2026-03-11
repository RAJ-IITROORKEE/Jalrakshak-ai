"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RefreshCw, Wifi, WifiOff, Activity, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface LiveReading {
  id: string;
  readingId: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  receivedAt: string;
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  turbidity: number | null;
  conductivity: number | null;
  rssi: number | null;
  snr: number | null;
  spreadingFactor: number | null;
  predictionStatus: string | null;
  predictionScore: number | null;
  predictionRiskLevel: string | null;
  predictionConfidence: string | null;
  predictionCauses: string[];
  predictionActions: string[];
  predictionFutureRisk: string | null;
  createdAt?: string;
}

const STALE_MS = 2 * 60 * 1000;
const DEVICE_COLORS = [
  "bg-cyan-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-pink-500",
];

function useDeviceColor() {
  const map = useRef<Map<string, string>>(new Map());
  let idx = 0;
  return (deviceId: string) => {
    if (!map.current.has(deviceId)) {
      map.current.set(deviceId, DEVICE_COLORS[idx % DEVICE_COLORS.length]);
      idx++;
    }
    return map.current.get(deviceId) ?? ""; 
  };
}

function SensorPill({ label, value, unit }: { readonly label: string; readonly value: number | null; readonly unit?: string }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-mono">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value.toFixed(2)}{unit}</span>
    </span>
  );
}

export default function LiveDataPage() {
  const [readings, setReadings] = useState<LiveReading[]>([]);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const getColor = useDeviceColor();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(tick);
  }, []);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/live-data?limit=100");
      const json = await res.json();
      if (json.status === "ok") {
        setReadings(json.data);
        setFetchedAt(new Date(json.fetchedAt));
      }
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(), 15_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Group by deviceId for the unique device count
  const uniqueDevices = new Set(readings.map((r) => r.deviceId)).size;
  const liveDevices = new Set(
    readings
      .filter((r) => now - new Date(r.receivedAt).getTime() < STALE_MS)
      .map((r) => r.deviceId)
  ).size;

  return (
    <div className="space-y-5">
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Live Data Log</h2>
          <p className="text-sm text-muted-foreground">
            Incoming webhook readings from all TTN devices
            {fetchedAt && (
              <> — last fetched <strong>{formatDistanceToNow(fetchedAt, { addSuffix: true })}</strong></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh((v) => !v)}
            className={cn(autoRefresh && "border-green-500 text-green-600 dark:border-green-600 dark:text-green-400")}
          >
            <span className={cn("mr-1.5 inline-block size-2 rounded-full", autoRefresh ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
            {autoRefresh ? "Auto (15s)" : "Auto off"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <Activity className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{readings.length}</p>
              <p className="text-xs text-muted-foreground">Readings loaded</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <Wifi className="size-5 text-green-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-green-600">{liveDevices}</p>
              <p className="text-xs text-muted-foreground">Live devices</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4 py-0">
            <WifiOff className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{uniqueDevices}</p>
              <p className="text-xs text-muted-foreground">Total devices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Reading log ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Uplink Log</CardTitle>
          <CardDescription>Latest 100 readings — click any row to expand raw JSON</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <p className="text-sm text-muted-foreground p-6 text-center">Loading…</p>
          )}
          {!loading && readings.length === 0 && (
            <p className="text-sm text-muted-foreground p-8 text-center">
              No readings yet. Waiting for the first TTN uplink…
            </p>
          )}
          {!loading && readings.length > 0 && (
            <Accordion type="multiple" className="divide-y divide-border">
              {readings.map((r, idx) => {
                const age = now - new Date(r.receivedAt).getTime();
                const live = age < STALE_MS;
                const dotColor = getColor(r.deviceId);
                const isNew = idx === 0;

                return (
                  <AccordionItem
                    key={r.readingId}
                    value={r.readingId}
                    className={cn(
                      "px-4 transition-colors",
                      isNew && "bg-cyan-50/50 dark:bg-cyan-950/20"
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline py-3 gap-3 [&>svg]:hidden">
                      <div className="flex flex-1 items-center gap-3 min-w-0 text-left">
                        {/* Index */}
                        <span className="w-7 shrink-0 text-xs font-mono text-muted-foreground text-right">
                          #{readings.length - idx}
                        </span>

                        {/* Device badge */}
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shrink-0", dotColor)}>
                          {live && <span className="inline-block size-1.5 rounded-full bg-white/80 animate-pulse" />}
                          {r.deviceId}
                        </span>

                        {/* Sensor pills */}
                        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                          <SensorPill label="pH" value={r.ph} />
                          <SensorPill label="TDS" value={r.tds} unit=" ppm" />
                          <SensorPill label="T" value={r.temperature} unit="°C" />
                          <SensorPill label="Turb" value={r.turbidity} unit=" NTU" />
                        </div>

                        {/* Prediction badge */}
                        {r.predictionStatus && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-auto shrink-0 text-xs",
                              r.predictionStatus === "Safe"
                                ? "border-green-400 text-green-600 dark:text-green-400"
                                : "border-red-400 text-red-600 dark:text-red-400"
                            )}
                          >
                            {r.predictionStatus}
                          </Badge>
                        )}

                        {/* Timestamp */}
                        <span className="shrink-0 text-xs text-muted-foreground ml-auto tabular-nums">
                          {format(new Date(r.receivedAt), "HH:mm:ss")}
                          <span className="hidden sm:inline text-muted-foreground/60">
                            {" "}· {formatDistanceToNow(new Date(r.receivedAt), { addSuffix: true })}
                          </span>
                        </span>

                        <ChevronRight className="size-3.5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]/accordion-item:rotate-90" />
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4 pt-0">
                      <div className="rounded-lg bg-muted/60 border border-border overflow-auto max-h-80">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-xs text-muted-foreground">
                          <span className="font-mono font-semibold text-foreground">{r.deviceId}</span>
                          <span className="font-mono">{r.readingId}</span>
                        </div>
                        <pre className="p-3 text-xs font-mono leading-relaxed text-foreground overflow-auto">
                          {JSON.stringify(r, null, 2)}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
