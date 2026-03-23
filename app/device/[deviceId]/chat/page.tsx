import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatPageProps {
  params: Promise<{
    deviceId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { deviceId } = await params;

  // Fetch device to verify it exists
  const device = await prisma.device.findUnique({
    where: { deviceId },
  });

  if (!device) {
    notFound();
  }

  return (
    <div className="h-screen">
      <ChatInterface deviceId={deviceId} device={device} />
    </div>
  );
}

export async function generateMetadata({ params }: ChatPageProps) {
  const { deviceId } = await params;
  
  const device = await prisma.device.findUnique({
    where: { deviceId },
  });

  return {
    title: `Chat - ${device?.deviceName || deviceId} | JalRakshak AI`,
    description: `AI-powered chat for water quality analysis of ${
      device?.deviceName || deviceId
    }`,
  };
}
