import { CHAT_MODEL_OPTIONS, DEFAULT_CHAT_MODEL } from "@/lib/chat-models";

/**
 * OpenRouter API Client for JalRakshak AI Chat
 * 
 * Handles communication with OpenRouter API using Llama 3.3 70B Instruct model
 * Documentation: https://openrouter.ai/docs
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "https://jalrakshak-ai.vercel.app";
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME || "JalRakshak AI";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Create a chat completion using OpenRouter API
 * @param messages - Array of chat messages (system, user, assistant)
 * @param model - Model to use (default: DEFAULT_CHAT_MODEL)
 * @returns Chat completion response
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  model: string = DEFAULT_CHAT_MODEL
): Promise<ChatCompletionResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Please add it to your .env.local file.\n" +
      "Get your API key from: https://openrouter.ai/keys"
    );
  }

  const fallbackModels = CHAT_MODEL_OPTIONS.map((option) => option.id);
  const modelQueue = Array.from(new Set([model, ...fallbackModels]));
  let lastError: Error | null = null;

  for (const candidateModel of modelQueue) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": OPENROUTER_SITE_URL,
          "X-Title": OPENROUTER_SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: candidateModel,
          messages,
        }),
      });

      if (response.ok) {
        const data: ChatCompletionResponse = await response.json();
        return data;
      }

      const errorText = await response.text();
      const isRetriable = response.status === 429 || response.status === 400;

      lastError = new Error(
        `OpenRouter API error (${response.status}) [${candidateModel}]: ${errorText}`
      );

      if (!isRetriable) {
        throw lastError;
      }
    } catch (error) {
      const typedError =
        error instanceof Error
          ? error
          : new Error("Unknown OpenRouter request error");
      lastError = typedError;
    }
  }

  const fallbackError =
    lastError ?? new Error("All configured OpenRouter models failed");
  console.error("OpenRouter API error after fallback attempts:", fallbackError);
  throw fallbackError;
}

/**
 * Test the OpenRouter API connection
 * @returns True if connection successful, false otherwise
 */
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const response = await createChatCompletion([
      { role: "user", content: "Hello! Reply with just 'OK' if you can hear me." }
    ]);
    
    return response.choices?.[0]?.message?.content?.includes("OK") ?? false;
  } catch (error) {
    console.error("OpenRouter connection test failed:", error);
    return false;
  }
}
