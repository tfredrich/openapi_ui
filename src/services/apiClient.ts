export type RequestOptions = {
  baseUrl: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

export async function apiRequest<T = unknown>(options: RequestOptions): Promise<T> {
  const { baseUrl, path, method = "GET", headers, query, body } = options;
  const url = new URL(path, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
