import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { mockPatients } from "@/data/mockPatients";

// react-router-dom: real MemoryRouter, but spy on useNavigate so we can
// assert the URL transition without mounting the route tree.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCreate = vi.fn();
vi.mock("@/services/encountersService", () => ({
  encountersService: { create: (...a: unknown[]) => mockCreate(...a) },
}));

vi.mock("@/services/eventBus", () => ({
  eventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

vi.mock("@/services/patientGraph", () => ({
  initializeGraphFromPatient: vi.fn(),
}));

// Stub the WorkspaceSidebar so we can fire patient-select with deterministic
// payloads (the real sidebar pulls from mockPatients itself, but this test
// is about handlePatientSelect's behavior, not the sidebar's UI).
vi.mock("../WorkspaceSidebar", () => ({
  WorkspaceSidebar: ({ onPatientSelect }: { onPatientSelect: (p: typeof mockPatients[number]) => void }) => (
    <div data-testid="sidebar-stub">
      <button data-testid="pick-P001" onClick={() => onPatientSelect(mockPatients[0])}>P001</button>
      <button data-testid="pick-P002" onClick={() => onPatientSelect(mockPatients[1])}>P002</button>
    </div>
  ),
}));

// Heavy children that aren't relevant to the handoff path — render-noops.
vi.mock("../PatientWorkspaceHeader", () => ({
  default: () => <div data-testid="pw-header" />,
}));
vi.mock("../ClinicalChat", () => ({ default: () => <div /> }));
vi.mock("../ClinicalDocumentEditor", () => ({ default: () => <div /> }));
vi.mock("../EncounterTimeline", () => ({ EncounterTimeline: () => <div /> }));
vi.mock("../ScribingModal", () => ({ default: () => null }));
vi.mock("../ScribeCompleteModal", () => ({ default: () => null }));
vi.mock("../UploadContextModal", () => ({ default: () => null }));
vi.mock("../ConnectEHRModal", () => ({ default: () => null }));
vi.mock("../ClinicalFormDrawer", () => ({ default: () => null }));
vi.mock("@/components/documents/DocumentOutputDrawer", () => ({ default: () => null }));
vi.mock("@/components/coding/CodingReviewDrawer", () => ({
  CodingReviewDrawer: () => null,
}));
vi.mock("../RightPanelContent", () => ({ RightPanelContent: () => <div /> }));

vi.mock("../useScribeFlow", () => ({
  useScribeFlow: () => ({
    isScribing: false,
    showCompleteModal: false,
    scribeOutputs: [],
    onModeRun: vi.fn(),
    onTranscriptComplete: vi.fn(),
    onConfirmComplete: vi.fn(),
    onCancelComplete: vi.fn(),
    onStartScribing: vi.fn(),
  }),
}));

import EncounterWorkspace from "../EncounterWorkspace";

const renderWorkspace = (initialEncounterId?: string) =>
  render(
    <MemoryRouter>
      <EncounterWorkspace
        initialEncounterId={initialEncounterId}
        initialPatient={initialEncounterId ? mockPatients[0] : null}
      />
    </MemoryRouter>,
  );

describe("EncounterWorkspace.handlePatientSelect — URL-driven mode", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockCreate.mockReset();
  });

  it("creates one encounter and navigates when switching patients in /encounters/:id", async () => {
    mockCreate.mockResolvedValueOnce({ id: "enc-new-2" });
    renderWorkspace("enc-existing-1");

    fireEvent.click(screen.getAllByTestId("pick-P002")[0]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    const args = mockCreate.mock.calls[0][0];
    // Healthcare safety re-assertion: client never claims provider/org.
    expect(args).not.toHaveProperty("providerId");
    expect(args).not.toHaveProperty("orgId");
    expect(args).toMatchObject({ patientId: "P002", status: "active" });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/encounters/enc-new-2/note?patientId=P002");
    });
  });

  it("does NOT create a new encounter when re-selecting the already-loaded patient", async () => {
    renderWorkspace("enc-existing-1");

    // P001 is already pre-selected via initialPatient.
    fireEvent.click(screen.getAllByTestId("pick-P001")[0]);
    fireEvent.click(screen.getAllByTestId("pick-P001")[0]);

    // Give any rogue async work a chance to fire.
    await new Promise((r) => setTimeout(r, 20));

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("dedupes rapid double-clicks on a different patient (in-flight guard)", async () => {
    let resolveCreate: (v: { id: string }) => void = () => {};
    mockCreate.mockImplementationOnce(
      () => new Promise<{ id: string }>((res) => { resolveCreate = res; }),
    );
    renderWorkspace("enc-existing-1");

    fireEvent.click(screen.getAllByTestId("pick-P002")[0]);
    fireEvent.click(screen.getAllByTestId("pick-P002")[0]);
    fireEvent.click(screen.getAllByTestId("pick-P002")[0]);

    // Only the first click should have triggered a create; the rest are
    // suppressed by inFlightCreateForPatientRef.
    expect(mockCreate).toHaveBeenCalledTimes(1);

    resolveCreate({ id: "enc-new-3" });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/encounters/enc-new-3/note?patientId=P002");
    });
  });
});
