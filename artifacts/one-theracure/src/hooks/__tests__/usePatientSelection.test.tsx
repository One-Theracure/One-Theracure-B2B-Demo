import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { usePatientSelection } from "@/hooks/usePatientSelection";

function wrapperFor(initialEntries: string[]) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
}

describe("usePatientSelection", () => {
  it("reads patientId from the URL on mount", () => {
    const { result } = renderHook(() => usePatientSelection(), {
      wrapper: wrapperFor(["/?patientId=pat-123"]),
    });
    expect(result.current.selectedPatientId).toBe("pat-123");
  });

  it("returns null when patientId is missing or empty", () => {
    const { result: r1 } = renderHook(() => usePatientSelection(), {
      wrapper: wrapperFor(["/"]),
    });
    expect(r1.current.selectedPatientId).toBeNull();

    const { result: r2 } = renderHook(() => usePatientSelection(), {
      wrapper: wrapperFor(["/?patientId="]),
    });
    expect(r2.current.selectedPatientId).toBeNull();
  });

  it("setSelectedPatient writes the param and round-trips back through the URL", () => {
    let location: ReturnType<typeof useLocation> | null = null;
    const { result } = renderHook(
      () => {
        location = useLocation();
        return usePatientSelection();
      },
      { wrapper: wrapperFor(["/?tab=cds"]) },
    );

    act(() => result.current.setSelectedPatient("pat-789"));

    expect(result.current.selectedPatientId).toBe("pat-789");
    // Other params survive the write — `tab=cds` must still be there.
    const params = new URLSearchParams(location!.search);
    expect(params.get("patientId")).toBe("pat-789");
    expect(params.get("tab")).toBe("cds");
  });

  it("setSelectedPatient(null) deletes the param entirely", () => {
    let location: ReturnType<typeof useLocation> | null = null;
    const { result } = renderHook(
      () => {
        location = useLocation();
        return usePatientSelection();
      },
      { wrapper: wrapperFor(["/?patientId=pat-99&tab=cds"]) },
    );
    expect(result.current.selectedPatientId).toBe("pat-99");

    act(() => result.current.setSelectedPatient(null));

    expect(result.current.selectedPatientId).toBeNull();
    const params = new URLSearchParams(location!.search);
    expect(params.has("patientId")).toBe(false);
    expect(params.get("tab")).toBe("cds");
  });
});
