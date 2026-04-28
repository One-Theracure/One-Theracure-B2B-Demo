import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EncounterRoute from "../EncounterRoute";

// Stub the encounters service so we control what get() returns without a
// network call.
const mockGet = vi.fn();
vi.mock("@/services/encountersService", () => ({
  encountersService: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

// Patient data is mocked to a single known patient that matches the
// encounter's patientId, so the header renders the expected name.
vi.mock("@/data/mockPatients", () => ({
  mockPatients: [
    {
      id: "P-test-1",
      name: "Test Patient One",
      mrn: "MRN-T1",
      age: 40,
      gender: "Female",
      chronicConditions: [],
      allergies: [],
      recentVisits: [],
    },
  ],
}));

// The CDS / Orders sub-views import a lot of clinical components. We stub
// them to lightweight markers so the test focuses on routing, not on the
// full clinical-document component tree.
vi.mock("@/components/encounter/CdsGroupView", () => ({
  default: () => <div data-testid="cds-group">CDS_GROUP</div>,
}));
vi.mock("@/components/encounter/OrdersGroupView", () => ({
  default: () => <div data-testid="orders-group">ORDERS_GROUP</div>,
}));
vi.mock("@/components/encounter/TimelineGroupView", () => ({
  default: () => <div data-testid="timeline-group">TIMELINE_GROUP</div>,
}));
// The Note surface pulls in the very large EncounterWorkspace. Stub it so
// this test doesn't have to satisfy every dep.
vi.mock("../EncounterNoteSurface", () => ({
  default: () => <div data-testid="note-surface">NOTE_SURFACE</div>,
}));

const baseEncounter = {
  id: "enc-1",
  orgId: "org-1",
  clinicId: "clinic-1",
  patientId: "P-test-1",
  providerId: "prov-1",
  providerName: "Dr. Demo",
  status: "active",
  chiefComplaint: null,
  visitType: "consult",
  scheduledAt: null,
  startedAt: null,
  completedAt: null,
  signedAt: null,
  signedBy: null,
  scribeSessionId: null,
  noteContent: null,
  diagnoses: [],
  procedures: [],
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

const renderAt = async (path: string) => {
  // Lazy-import the children inside the test renderer so the mocks above
  // are applied before the modules evaluate.
  const EncounterNoteSurface = (await import("../EncounterNoteSurface")).default;
  const CdsGroupView = (await import("@/components/encounter/CdsGroupView")).default;
  const OrdersGroupView = (await import("@/components/encounter/OrdersGroupView")).default;
  const TimelineGroupView = (await import("@/components/encounter/TimelineGroupView")).default;
  const { Navigate } = await import("react-router-dom");
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/encounters/:id" element={<EncounterRoute />}>
          <Route index element={<Navigate to="note" replace />} />
          <Route path="note" element={<EncounterNoteSurface />} />
          <Route path="decision-support" element={<CdsGroupView />} />
          <Route path="patient-outputs" element={<OrdersGroupView />} />
          <Route path="timeline" element={<TimelineGroupView />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe("EncounterRoute", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("loads the encounter and renders the patient name in the header", async () => {
    mockGet.mockResolvedValue(baseEncounter);
    await renderAt("/encounters/enc-1");
    await waitFor(() => {
      expect(screen.getByText(/Test Patient One/)).toBeInTheDocument();
    });
    expect(mockGet).toHaveBeenCalledWith("enc-1");
    // The index route is a `<Navigate to="note" replace />`, so the note
    // surface mounts on the next render tick after the encounter loads.
    await waitFor(() => {
      expect(screen.getByTestId("note-surface")).toBeInTheDocument();
    });
  });

  it("redirects bare /encounters/:id to the explicit /note child", async () => {
    mockGet.mockResolvedValue(baseEncounter);
    await renderAt("/encounters/enc-1");
    await waitFor(() => {
      // The Note surface should mount — the index Navigate to="note" does the redirect.
      expect(screen.getByTestId("note-surface")).toBeInTheDocument();
    });
  });

  it("shows a friendly not-found state if the encounter cannot be loaded", async () => {
    mockGet.mockRejectedValue(new Error("404"));
    await renderAt("/encounters/missing");
    await waitFor(() => {
      expect(screen.getByText(/Encounter unavailable/i)).toBeInTheDocument();
    });
  });

  it("navigates between sub-tabs via the sub-nav", async () => {
    mockGet.mockResolvedValue(baseEncounter);
    await renderAt("/encounters/enc-1");
    await waitFor(() => {
      expect(screen.getByTestId("note-surface")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: /Decision Support/i }));
    await waitFor(() => expect(screen.getByTestId("cds-group")).toBeInTheDocument());

    await user.click(screen.getByRole("link", { name: /Orders & Outputs/i }));
    await waitFor(() => expect(screen.getByTestId("orders-group")).toBeInTheDocument());
    // URL should reflect the renamed segment.
    expect(window.location.pathname).not.toBe("/encounters/enc-1/orders");

    await user.click(screen.getByRole("link", { name: /Timeline/i }));
    await waitFor(() => expect(screen.getByTestId("timeline-group")).toBeInTheDocument());
  });
});
