/**
 * Thin authenticated API client.
 *
 * Pulls the Clerk session token from `window.Clerk.session` (the same instance
 * `<ClerkProvider>` wires up) and attaches it as `Authorization: Bearer …`.
 * We deliberately do NOT use cookies — the API server's CSRF posture depends
 * on requests being bearer-only (`cors({ credentials: false })`).
 *
 * BASE URL: lives under the artifact's base path (e.g. `/one-theracure/`).
 * `import.meta.env.BASE_URL` already includes the trailing slash, so URLs are
 * built as `${BASE_URL}api/...`. Don't use root-relative `/api/...` — that
 * escapes the artifact prefix and hits the wrong route on Replit.
 */

const API_PREFIX = `${import.meta.env.BASE_URL ?? "/"}api/`.replace(/\/+/g, "/");

interface ClerkLike {
  session?: { getToken: () => Promise<string | null> } | null;
}

declare global {
  interface Window {
    Clerk?: ClerkLike;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
  }
}

async function authHeader(): Promise<HeadersInit> {
  // Demo mode: Clerk is not in the page (no ClerkProvider mounted), so don't
  // even read window.Clerk. Services that hit this path in demo mode are a
  // bug — but we'd rather send an unauthed request than throw.
  if (typeof window === "undefined" || !window.Clerk?.session) return {};
  const token = await window.Clerk.session.getToken().catch(() => null);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type Query = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const cleanPath = path.replace(/^\/+/, "");
  const url = new URL(`${API_PREFIX}${cleanPath}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v == null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options: { body?: unknown; query?: Query } = {},
): Promise<T> {
  const auth = await authHeader();
  const headers: HeadersInit = { ...auth };
  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  const res = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    credentials: "omit",
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, data, `${method} ${path} → ${res.status}`);
  }
  return data as T;
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
