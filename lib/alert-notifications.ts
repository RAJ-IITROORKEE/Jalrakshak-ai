import { prisma } from "@/lib/prisma";

interface AlertPayload {
  readingId: string;
  deviceId: string;
  deviceName: string;
  predictionStatus?: string | null;
  predictionRiskLevel?: string | null;
  predictionScore?: number | null;
  predictionConfidence?: string | null;
  predictionCauses?: string[];
  predictionActions?: string[];
  predictionFutureRisk?: string | null;
}

export async function createAlertNotification(payload: AlertPayload) {
  const isUnsafe = payload.predictionStatus === "Unsafe";
  const hasElevatedRisk =
    payload.predictionRiskLevel === "High" || payload.predictionRiskLevel === "Moderate";

  if (!isUnsafe && !hasElevatedRisk) {
    return;
  }

  const causesPreview = payload.predictionCauses?.[0] || "Potential contamination risk detected";
  const summary = `${payload.deviceName} flagged ${payload.predictionStatus ?? "Alert"} (${payload.predictionRiskLevel ?? "Unknown risk"})`;

  await prisma.alertNotification.upsert({
    where: { readingId: payload.readingId },
    create: {
      readingId: payload.readingId,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      title: `Water quality alert on ${payload.deviceName}`,
      summary,
      predictionStatus: payload.predictionStatus ?? null,
      predictionRiskLevel: payload.predictionRiskLevel ?? null,
      predictionScore: payload.predictionScore ?? null,
      predictionConfidence: payload.predictionConfidence ?? null,
      predictionCauses: payload.predictionCauses ?? [],
      predictionActions: payload.predictionActions ?? [],
      predictionFutureRisk: payload.predictionFutureRisk ?? causesPreview,
      isRead: false,
    },
    update: {
      summary,
      predictionStatus: payload.predictionStatus ?? null,
      predictionRiskLevel: payload.predictionRiskLevel ?? null,
      predictionScore: payload.predictionScore ?? null,
      predictionConfidence: payload.predictionConfidence ?? null,
      predictionCauses: payload.predictionCauses ?? [],
      predictionActions: payload.predictionActions ?? [],
      predictionFutureRisk: payload.predictionFutureRisk ?? causesPreview,
    },
  });
}
