import { describe, it, expect, beforeEach, vi } from "vitest";
import { auditService } from "@/services/auditService";

/**
 * Healthcare-safety contract for the client audit service:
 *   - The client NEVER sends `userId`, `orgId`, or `clinicId` over the wire.
 *   - The body is JSON with the exact whitelist of fields.
 *   - Failures are swallowed (fire-and-forget) so a flaky network never
 *     blocks a clinical action.
 */

type FetchArgs = { url: string; init: RequestInit };
let calls: FetchArgs[] = [];

function mockFetch(response: unknown, opts: { ok?: boolean; status?: number } = {}) {
  const ok = opts.ok ?? true;
  const status = opts.status ?? (ok ? 200 : 500);
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    return {
      ok,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  calls = [];
  // Stub Clerk so apiClient can request a token without crashing.
  (globalThis as unknown as { window: Window }).window = (globalThis as unknown as { window: Window }).window ?? ({} as Window);
  (globalThis as unknown as { window: { Clerk?: { session?: { getToken: () => Promise<string> } } } }).window.Clerk = {
    session: { getToken: async () => "test-token" },
  };
});

describe("auditService.log", () => {
  it("POSTs only whitelisted fields — no userId/orgId/clinicId leak", async () => {
    mockFetch({ id: "evt-1", action: "cds.generate" });

    await auditService.log({
      action: "cds.generate",
      entityType: "cds_output",
      entityId: "out-1",
      patientId: "pat-1",
      encounterId: "enc-1",
      payload: { mode: "soap" },
    });

    expect(calls).toHaveLength(1);
    const body = JSON.parse(String(calls[0].init.body));
    expect(body).toEqual({
      action: "cds.generate",
      entityType: "cds_output",
      entityId: "out-1",
      patientId: "pat-1",
      encounterId: "enc-1",
      payload: { mode: "soap" },
    });
    expect(body).not.toHaveProperty("userId");
    expect(body).not.toHaveProperty("orgId");
    expect(body).not.toHaveProperty("clinicId");
  });

  it("returns null and swallows errors on network failure (fire-and-forget)", async () => {
    mockFetch({ error: "boom" }, { ok: false, status: 500 });
    const result = await auditService.log({ action: "x", entityType: "y" });
    expect(result).toBeNull();
  });

  it("attaches the bearer token from Clerk", async () => {
    mockFetch({ id: "evt-2" });
    await auditService.log({ action: "x", entityType: "y" });
    const headers = new Headers(calls[0].init.headers as HeadersInit);
    expect(headers.get("authorization")).toBe("Bearer test-token");
  });
});

describe("auditService.query", () => {
  it("forwards filters as query-string params", async () => {
    mockFetch([]);
    await auditService.query({ patientId: "pat-1", action: "cds.finalize", limit: 50 });
    const url = new URL(calls[0].url, "http://test");
    expect(url.pathname.endsWith("/audit")).toBe(true);
    expect(url.searchParams.get("patientId")).toBe("pat-1");
    expect(url.searchParams.get("action")).toBe("cds.finalize");
    expect(url.searchParams.get("limit")).toBe("50");
  });
});
