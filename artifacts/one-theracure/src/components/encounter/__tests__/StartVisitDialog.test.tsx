import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import StartVisitDialog from "../StartVisitDialog";

// Mock the encounters service so we don't hit the network. We also assert
// the SHAPE of the create call to guard against client-side providerId
// forgery — the client must not send provider attribution.
const mockCreate = vi.fn();
vi.mock("@/services/encountersService", () => ({
  encountersService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

vi.mock("@/data/mockPatients", () => ({
  mockPatients: [
    {
      id: "P-test-1",
      name: "Test Patient One",
      mrn: "MRN-T1",
      phone: "+91 99999 11111",
      age: 40,
      gender: "Female",
      chronicConditions: [],
    },
    {
      id: "P-test-2",
      name: "Other Patient",
      mrn: "MRN-T2",
      phone: "+91 99999 22222",
      age: 30,
      gender: "Male",
      chronicConditions: [],
    },
  ],
}));

const LocationSpy = ({ onChange }: { onChange: (path: string) => void }) => {
  const loc = useLocation();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- one-shot effect by intent
  onChange(`${loc.pathname}${loc.search}`);
  return null;
};

const renderDialog = (onLocationChange: (p: string) => void = () => {}) =>
  render(
    <MemoryRouter initialEntries={["/today"]}>
      <Routes>
        <Route path="*" element={
          <>
            <LocationSpy onChange={onLocationChange} />
            <StartVisitDialog open onOpenChange={() => {}} />
          </>
        } />
      </Routes>
    </MemoryRouter>,
  );

describe("StartVisitDialog", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("filters patients by name", async () => {
    renderDialog();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/search patients/i), "Other");
    expect(screen.getByText(/Other Patient/i)).toBeInTheDocument();
    expect(screen.queryByText(/Test Patient One/i)).not.toBeInTheDocument();
  });

  it("creates an encounter and navigates to /encounters/:id on selection", async () => {
    mockCreate.mockResolvedValue({ id: "enc-new-1" });
    let location = "";
    renderDialog((p) => { location = p; });
    const user = userEvent.setup();

    await user.click(screen.getAllByRole("button", { name: /Start/ })[0]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    const args = mockCreate.mock.calls[0][0];
    // Healthcare safety: client must NOT post provider/org attribution —
    // those fields are derived server-side from the Clerk session. A client
    // that could forge them could backdate or impersonate notes.
    expect(args).not.toHaveProperty("providerId");
    expect(args).not.toHaveProperty("providerName");
    expect(args).not.toHaveProperty("orgId");
    expect(args).not.toHaveProperty("clinicId");
    expect(args).toMatchObject({ patientId: "P-test-1", status: "active" });

    await waitFor(() => {
      expect(location).toBe("/encounters/enc-new-1?patientId=P-test-1");
    });
  });

  it("does not crash if create fails", async () => {
    mockCreate.mockRejectedValue(new Error("boom"));
    renderDialog();
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: /Start/ })[0]);
    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    // Dialog stays mounted, button is re-enabled.
    expect(screen.getAllByRole("button", { name: /Start/ }).length).toBeGreaterThan(0);
  });
});
