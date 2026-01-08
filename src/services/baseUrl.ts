import { ConsoleConfig } from "../../schemas/config.schema";

export function resolveBaseUrl(config: ConsoleConfig | null, oas: any): string | null {
  if (config?.api_base_url) return config.api_base_url;
  const serverUrl = oas?.servers?.[0]?.url;
  return serverUrl ?? null;
}
