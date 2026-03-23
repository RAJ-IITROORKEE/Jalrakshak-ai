export const CHAT_MODEL_OPTIONS = [
  {
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    label: "qwen3-next-80b (free)",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "nemotron-3-super-120b (free)",
  },
  {
    id: "openai/gpt-oss-120b:free",
    label: "gpt-oss-120b (free)",
  },
  {
    id: "google/gemma-3-27b-it:free",
    label: "gemma-3-27b-it (free)",
  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    label: "mistral-small-3.1-24b (free)",
  },
] as const;

export const DEFAULT_CHAT_MODEL = CHAT_MODEL_OPTIONS[0].id;

export function isAllowedChatModel(model: string): boolean {
  return CHAT_MODEL_OPTIONS.some((option) => option.id === model);
}
