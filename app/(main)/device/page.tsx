import { prisma } from "@/lib/prisma";
import { Droplets, MessageSquareText, ScanSearch, ShieldCheck, Waves } from "lucide-react";
import { AiChatButton } from "@/components/ai-chat-button";

export const dynamic = "force-dynamic";

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DeviceAiChatPage() {
  const devices = await prisma.device.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      deviceId: true,
      deviceName: true,
      isActive: true,
      lastSeen: true,
      totalReadings: true,
      lastPh: true,
      lastTds: true,
      lastTurbidity: true,
      lastTemperature: true,
    },
  });

  const visibleDevices = devices.filter((device) => device.isActive !== false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 px-6 py-10 shadow-sm sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-primary/5 blur-2xl"
        />

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <MessageSquareText className="h-3.5 w-3.5" />
              AI Device Copilot
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Chat with each device context to uncover fast, actionable water-quality insights
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              JalRakshak AI combines historical readings, prediction trends, and latest telemetry so you can quickly detect anomalies, identify likely causes, and choose the right next action for every node.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                <ScanSearch className="h-3.5 w-3.5 text-primary" />
                Device-level anomaly detection
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                <Waves className="h-3.5 w-3.5 text-primary" />
                Trend and drift interpretation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Risk-first recommendations
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available devices</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{visibleDevices.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Choose a device below and start a focused AI chat with its full history and context.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Select a device to start AI chat</h2>
        </div>

        {visibleDevices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No active devices found.</p>
            <p className="mt-1 text-xs text-muted-foreground">Activate a device from admin dashboard and return here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDevices.map((device) => {
              const isOffline = Date.now() - new Date(device.lastSeen).getTime() > 2 * 60 * 1000;

              return (
                <article
                  key={device.deviceId}
                  className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Device ID</p>
                      <h3 className="mt-0.5 text-sm font-semibold text-foreground">
                        {device.deviceName || device.deviceId}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{device.deviceId}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        isOffline
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {isOffline ? "Offline" : "Live"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-2">
                      <p className="text-muted-foreground">pH</p>
                      <p className="font-semibold text-foreground">{device.lastPh ?? "-"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-2">
                      <p className="text-muted-foreground">TDS</p>
                      <p className="font-semibold text-foreground">{device.lastTds ?? "-"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-2">
                      <p className="text-muted-foreground">Turbidity</p>
                      <p className="font-semibold text-foreground">{device.lastTurbidity ?? "-"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-2">
                      <p className="text-muted-foreground">Temperature</p>
                      <p className="font-semibold text-foreground">{device.lastTemperature ?? "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{device.totalReadings} readings</span>
                    <span>Seen {formatTime(device.lastSeen)}</span>
                  </div>

                  <div className="mt-4">
                    <AiChatButton
                      href={`/device/${device.deviceId}/chat`}
                      label="Start AI Chat"
                      fullWidth
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
