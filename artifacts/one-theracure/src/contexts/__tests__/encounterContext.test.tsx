import { describe, it, expect } from "vitest";
import { render, renderHook, screen, act } from "@testing-library/react";
import {
  EncounterProvider,
  useEncounter,
  useOptionalEncounter,
} from "@/contexts/EncounterContext";
import type { Encounter } from "@/services/encountersService";

function makeEncounter(id: string, patientId = "pat-1"): Encounter {
  return {
    id,
    orgId: "org-1",
    clinicId: "clinic-1",
    patientId,
    providerId: "prov-1",
    providerName: "Dr. Test",
    status: "active",
    visitType: "follow-up",
    chiefComplaint: null,
    scheduledAt: null,
    startedAt: null,
    completedAt: null,
    signedAt: null,
    signedBy: null,
    scribeSessionId: null,
    noteContent: null,
    diagnoses: null,
    procedures: null,
    attachments: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Encounter;
}

describe("EncounterContext", () => {
  it("useEncounter throws outside a provider", () => {
    // renderHook captures errors thrown by the callback in `result.error`.
    expect(() => renderHook(() => useEncounter()).result.current).toThrowError(
      /must be used within an EncounterProvider/,
    );
  });

  it("useOptionalEncounter returns null outside a provider", () => {
    const { result } = renderHook(() => useOptionalEncounter());
    expect(result.current).toBeNull();
  });

  it("setEncounter / patchEncounter / clearEncounter mutate the active encounter", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EncounterProvider initial={makeEncounter("enc-1")}>{children}</EncounterProvider>
    );
    const { result } = renderHook(() => useEncounter(), { wrapper });

    expect(result.current.encounter?.id).toBe("enc-1");

    act(() => result.current.patchEncounter({ chiefComplaint: "Cough" } as Partial<Encounter>));
    expect((result.current.encounter as unknown as { chiefComplaint: string }).chiefComplaint).toBe("Cough");

    act(() => result.current.setEncounter(makeEncounter("enc-2", "pat-2")));
    expect(result.current.encounter?.id).toBe("enc-2");
    expect(result.current.encounter?.patientId).toBe("pat-2");

    act(() => result.current.clearEncounter());
    expect(result.current.encounter).toBeNull();
  });

  it("two providers in sibling subtrees are isolated (per-page scope)", () => {
    function Inner({ label }: { label: string }) {
      const { encounter } = useEncounter();
      return <div data-testid={label}>{encounter?.id ?? "none"}</div>;
    }

    render(
      <div>
        <EncounterProvider initial={makeEncounter("page-A-enc")}>
          <Inner label="A" />
        </EncounterProvider>
        <EncounterProvider initial={makeEncounter("page-B-enc")}>
          <Inner label="B" />
        </EncounterProvider>
      </div>,
    );

    expect(screen.getByTestId("A").textContent).toBe("page-A-enc");
    expect(screen.getByTestId("B").textContent).toBe("page-B-enc");
  });
});
