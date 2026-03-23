/**
 * Chat Completion API Route
 * POST /api/chat
 * 
 * Handles chat messages and calls OpenRouter API with device context
 */

import { prisma } from "@/lib/prisma";
import { createChatCompletion, ChatMessage } from "@/lib/openrouter";
import { buildDeviceContext, calculateDeviceStats } from "@/lib/chat-context";
import { JALRAKSHAK_SYSTEM_PROMPT } from "@/lib/chat-prompts";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for AI response

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, message, conversationHistory } = body;

    // Validate input
    if (!deviceId || !message) {
      return NextResponse.json(
        { error: "Missing deviceId or message" },
        { status: 400 }
      );
    }

    // Fetch device context
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    // Fetch readings
    const readings = await prisma.reading.findMany({
      where: { deviceId },
      orderBy: { receivedAt: "desc" },
      take: 500,
    });

    // Calculate stats
    const stats = calculateDeviceStats(readings);

    // Build context string
    const contextStr = buildDeviceContext(device, readings, stats);

    // Prepare messages for OpenRouter
    const messages: ChatMessage[] = [
      { role: "system", content: JALRAKSHAK_SYSTEM_PROMPT },
      { role: "system", content: contextStr },
    ];

    // Add conversation history (limit to last 10 messages to avoid token limit)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory
        .slice(-10)
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map((m: any) => ({
          role: m.role,
          content: m.content,
        }));
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: "user", content: message });

    // Call OpenRouter API
    const completion = await createChatCompletion(messages);
    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        messageId: crypto.randomUUID(),
        deviceId,
        role: "user",
        content: message,
        model: completion.model,
      },
    });

    // Save assistant response to database
    await prisma.chatMessage.create({
      data: {
        messageId: crypto.randomUUID(),
        deviceId,
        role: "assistant",
        content: assistantMessage,
        tokensUsed: completion.usage?.total_tokens,
        model: completion.model,
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      tokensUsed: completion.usage?.total_tokens,
      model: completion.model,
    });
  } catch (error: any) {
    console.error("Error in chat completion:", error);
    
    // Provide helpful error messages
    if (error.message?.includes("OPENROUTER_API_KEY")) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
