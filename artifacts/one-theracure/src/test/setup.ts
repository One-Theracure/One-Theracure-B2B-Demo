import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// matchMedia polyfill for shadcn/ui components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// IntersectionObserver polyfill (radix uses it)
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(globalThis as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver = IO;

// ResizeObserver polyfill
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;

// Reset DOM, localStorage, ambient-session cache, and timers between tests
beforeEach(async () => {
  localStorage.clear();
  const mod = await import("@/services/ambientSessionService");
  mod.__resetAmbientSessionCacheForTests();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
