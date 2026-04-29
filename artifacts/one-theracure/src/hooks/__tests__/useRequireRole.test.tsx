import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { useRequireRole, RequireRole, AccessDenied } from "@/hooks/useRequireRole";

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn(),
  useUser: vi.fn(),
}));

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <SecurityProvider>{children}</SecurityProvider>
);

function setSession(role: string | undefined, signedIn = true) {
  vi.mocked(useClerkAuth).mockReturnValue({
    isSignedIn: signedIn,
    isLoaded: true,
    signOut: vi.fn(),
  } as unknown as ReturnType<typeof useClerkAuth>);
  vi.mocked(useClerkUser).mockReturnValue({
    user: signedIn
      ? ({ publicMetadata: role ? { role } : {} } as unknown as ReturnType<typeof useClerkUser>["user"])
      : null,
    isSignedIn: signedIn,
    isLoaded: true,
  } as unknown as ReturnType<typeof useClerkUser>);
}

describe("useRequireRole", () => {
  beforeEach(() => {
    vi.mocked(useClerkAuth).mockReset();
    vi.mocked(useClerkUser).mockReset();
  });

  it("returns allowed=true when the session role matches", () => {
    setSession("doctor");
    const { result } = renderHook(() => useRequireRole("doctor", "owner"), { wrapper });
    expect(result.current.allowed).toBe(true);
  });

  it("returns allowed=false when the session role does not match", () => {
    setSession("biller");
    const { result } = renderHook(() => useRequireRole("doctor", "owner"), { wrapper });
    expect(result.current.allowed).toBe(false);
  });

  it("returns allowed=false when not signed in", () => {
    setSession(undefined, false);
    const { result } = renderHook(() => useRequireRole("doctor"), { wrapper });
    expect(result.current.allowed).toBe(false);
  });
});

describe("<RequireRole>", () => {
  beforeEach(() => {
    vi.mocked(useClerkAuth).mockReset();
    vi.mocked(useClerkUser).mockReset();
  });

  it("renders children when role is allowed", () => {
    setSession("auditor");
    render(
      <SecurityProvider>
        <RequireRole roles={["auditor", "owner"]}>
          <div>secret-content</div>
        </RequireRole>
      </SecurityProvider>,
    );
    expect(screen.getByText("secret-content")).toBeInTheDocument();
  });

  it("renders <AccessDenied /> when role is not allowed and never leaks the gated children", () => {
    setSession("receptionist");
    render(
      <SecurityProvider>
        <RequireRole roles={["owner"]}>
          <div>secret-content</div>
        </RequireRole>
      </SecurityProvider>,
    );
    expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
    expect(screen.getByText(/don't have access/i)).toBeInTheDocument();
  });

  it("AccessDenied component is non-detailed (no role names leaked)", () => {
    render(<AccessDenied />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/owner|doctor|biller|auditor|receptionist/i);
  });
});
