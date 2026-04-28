import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentOutputDrawer from "@/components/documents/DocumentOutputDrawer";
import type { Patient } from "@/types/patient";

const patient: Patient = {
  id: "p1",
  name: "Mrs. Test Patient",
  age: 52,
  gender: "Female",
  mrn: "MRN-001",
  phone: "+91 9000000000",
  lastVisit: "2025-01-01",
  totalVisits: 5,
  specialty: "Internal Medicine",
  status: "active",
  chronicConditions: ["Hypertension", "Type 2 Diabetes"],
  allergies: ["Penicillin"],
};

beforeEach(() => {
  localStorage.clear();
});

describe("DocumentOutputDrawer", () => {
  it("Generate Documents populates both Prescription and AVS tabs", async () => {
    render(
      <DocumentOutputDrawer
        open
        onClose={() => {}}
        patient={patient}
        encounterId="enc-1"
        noteContent=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /generate documents/i }));

    // After ~600ms simulated delay both tabs render
    await waitFor(
      () => {
        expect(screen.getByRole("tab", { name: /prescription/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /patient avs/i })).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Prescription tab content visible by default
    expect(screen.getAllByText(/Metformin/i).length).toBeGreaterThan(0);

    // Switch to AVS tab via radix trigger; wait for it to mark active
    const user = userEvent.setup();
    const avsTab = screen.getByRole("tab", { name: /patient avs/i });
    await user.click(avsTab);
    await waitFor(() => expect(avsTab).toHaveAttribute("data-state", "active"));
    // AVS-specific content
    expect(await screen.findByText(/Your Visit Summary/i)).toBeInTheDocument();
  });

  it("Download triggers window.print", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      <DocumentOutputDrawer
        open
        onClose={() => {}}
        patient={patient}
        encounterId="enc-1"
        noteContent=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /generate documents/i }));
    await waitFor(
      () => expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );

    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
