import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

type Role = "system" | "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

interface OpenRouterSuccess {
  id: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
}

interface OpenRouterError {
  error?: {
    message?: string;
    code?: number;
    metadata?: Record<string, unknown>;
  };
  user_id?: string;
}

const API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
const SITE_NAME = process.env.OPENROUTER_SITE_NAME || "JalRakshak AI";
const MODEL =
  process.env.OPENROUTER_MODEL || "mistralai/mistral-small-3.1";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

function makePayload(size: "tiny" | "medium" | "large"): Message[] {
  const baseSystem =
    "You are JalRakshak AI assistant. Reply briefly with one line confirming the test.";

  if (size === "tiny") {
    return [
      { role: "system", content: baseSystem },
      { role: "user", content: "Ping test. Reply with: tiny-ok" },
    ];
  }

  const mediumContext = "WATER_READING ".repeat(1500); // ~18k chars
  if (size === "medium") {
    return [
      { role: "system", content: `${baseSystem}\nContext:${mediumContext}` },
      { role: "user", content: "Medium context test. Reply with: medium-ok" },
    ];
  }

  const largeContext = "WATER_READING ".repeat(7000); // ~84k chars
  return [
    { role: "system", content: `${baseSystem}\nContext:${largeContext}` },
    { role: "user", content: "Large context test. Reply with: large-ok" },
  ];
}

async function runCase(name: "tiny" | "medium" | "large") {
  const start = Date.now();
  const messages = makePayload(name);

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-OpenRouter-Title": SITE_NAME,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 120,
    }),
  });

  const ms = Date.now() - start;
  const raw = (await response.json()) as OpenRouterSuccess & OpenRouterError;

  if (!response.ok) {
    const code = raw?.error?.code ?? response.status;
    const message = raw?.error?.message ?? "Unknown error";
    console.log(`\n[${name.toUpperCase()}] FAIL (${response.status}) in ${ms}ms`);
    console.log(`Error code: ${code}`);
    console.log(`Message: ${message}`);
    if (raw?.error?.metadata) {
      console.log(`Metadata: ${JSON.stringify(raw.error.metadata)}`);
    }
    return;
  }

  const text = raw?.choices?.[0]?.message?.content?.slice(0, 180) || "(empty)";
  console.log(`\n[${name.toUpperCase()}] OK (${response.status}) in ${ms}ms`);
  console.log(`Model: ${raw.model || MODEL}`);
  console.log(
    `Tokens: prompt=${raw.usage?.prompt_tokens ?? "?"}, completion=${
      raw.usage?.completion_tokens ?? "?"
    }, total=${raw.usage?.total_tokens ?? "?"}`
  );
  console.log(`Reply: ${text}`);
}

async function main() {
  if (!API_KEY) {
    console.error("OPENROUTER_API_KEY is missing in environment.");
    console.error("Add it to .env.local and retry.");
    process.exit(1);
  }

  console.log("OpenRouter connectivity/context test");
  console.log(`Model: ${MODEL}`);

  try {
    await runCase("tiny");
    await runCase("medium");
    await runCase("large");
    console.log("\nDone. Compare tiny vs medium/large results to detect context-limit issues.");
  } catch (err) {
    console.error("Unexpected failure:", err);
    process.exit(1);
  }
}

void main();
