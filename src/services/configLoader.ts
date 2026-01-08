import YAML from "yaml";
import { ConsoleConfigSchema, ConsoleConfig } from "../../schemas/config.schema";

const configCandidates = ["/config.json", "/config.yaml", "/config.yml"];

function looksLikeHtml(text: string) {
  const trimmed = text.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

async function fetchConfig(path: string) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load config from ${path}`);
  }
  const rawText = await response.text();
  if (looksLikeHtml(rawText)) {
    throw new Error(`Config not found at ${path}`);
  }
  return rawText;
}

export async function loadConfig(path = "/config.json"): Promise<ConsoleConfig> {
  const candidates = path === "/config.json" ? configCandidates : [path];
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const rawText = await fetchConfig(candidate);
      const parsed =
        candidate.endsWith(".yaml") || candidate.endsWith(".yml")
          ? YAML.parse(rawText)
          : JSON.parse(rawText);
      return ConsoleConfigSchema.parse(parsed);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Failed to load config");
    }
  }

  throw lastError ?? new Error("Failed to load config");
}
