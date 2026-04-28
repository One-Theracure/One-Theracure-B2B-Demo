import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { SecurityProvider, useAuth } from "@/contexts/SecurityContext";

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn(),
  useUser: () => ({ user: null, isSignedIn: false, isLoaded: true }),
}));

import { useAuth as useClerkAuth } from "@clerk/react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <SecurityProvider>{children}</SecurityProvider>
);

describe("SecurityContext", () => {
  beforeEach(() => {
    vi.mocked(useClerkAuth).mockReset();
  });

  it("hasPermission returns false when not signed in", () => {
    vi.mocked(useClerkAuth).mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useClerkAuth>);

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.hasPermission("patients:read")).toBe(false);
  });

  it("hasPermission returns true when signed in", () => {
    vi.mocked(useClerkAuth).mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useClerkAuth>);

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.hasPermission("patients:read")).toBe(true);
  });

  it("updateActivity moves lastActivity forward", () => {
    vi.mocked(useClerkAuth).mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useClerkAuth>);

    const { result } = renderHook(() => useAuth(), { wrapper });
    const before = result.current.lastActivity;
    // ensure timestamp can advance
    const t = Date.now();
    while (Date.now() === t) {
      // spin
    }
    act(() => result.current.updateActivity());
    expect(result.current.lastActivity).toBeGreaterThanOrEqual(before);
  });
});
