import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PrintRxButton from "@/components/documents/PrintRxButton";
import { RX_PRINT_AREA_ID } from "@/components/documents/PrescriptionLetterhead";
import type { Patient } from "@/types/patient";

const patient: Patient = {
  id: "p-print",
  name: "Mr. Reprint Patient",
  age: 60,
  gender: "Male",
  mrn: "MRN-PRINT",
  phone: "+91 9000000000",
  lastVisit: "2025-02-10",
  totalVisits: 4,
  specialty: "Internal Medicine",
  status: "Active",
  chronicConditions: ["Hypertension"],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("PrintRxButton", () => {
  it("opens a modal with the shared #rx-print-area letterhead", async () => {
    render(<PrintRxButton patient={patient} visit={{ date: "2025-02-10", diagnosis: "BP follow-up", doctor: "Dr. Test" }} />);

    fireEvent.click(screen.getByRole("button", { name: /print rx/i }));

    await waitFor(() =>
      expect(screen.getByText(/Reprint Prescription/i)).toBeInTheDocument(),
    );

    // Patient identity surfaces on the letterhead (header + body both render it)
    expect(screen.getAllByText(/Mr\. Reprint Patient/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MRN-PRINT/).length).toBeGreaterThan(0);
    expect(screen.getByText(/BP follow-up/)).toBeInTheDocument();

    // The printable region uses the shared id so the @media print
    // stylesheet shows only this content
    expect(document.getElementById(RX_PRINT_AREA_ID)).not.toBeNull();
  });

  it("invokes window.print when the user clicks Print / Save as PDF", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(<PrintRxButton patient={patient} />);

    fireEvent.click(screen.getByRole("button", { name: /print rx/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /print \/ save as pdf/i })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /print \/ save as pdf/i }));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
