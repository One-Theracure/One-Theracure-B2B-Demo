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

  it("renders 4-language AVS tabs for seeded patients (P002)", async () => {
    const seeded: Patient = {
      ...patient,
      id: "P002",
      name: "Mr. Raj Kumar",
      gender: "Male",
      chronicConditions: ["Diabetes Type 2"],
    };

    render(
      <DocumentOutputDrawer
        open
        onClose={() => {}}
        patient={seeded}
        encounterId="enc-p002"
        noteContent=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /generate documents/i }));
    await waitFor(
      () => expect(screen.getByRole("tab", { name: /patient avs/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /patient avs/i }));

    // The localized header and language tabs should appear
    expect(await screen.findByText(/Care plan available in 4 languages/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /हिन्दी/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /मराठी/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /தமிழ்/ })).toBeInTheDocument();

    // English content should be visible by default (Raj Kumar's HbA1c finding)
    expect(screen.getByText(/HbA1c is 8\.2%/i)).toBeInTheDocument();

    // Switch to Hindi — translated finding (Hindi-specific phrasing) should appear
    await user.click(screen.getByRole("tab", { name: /हिन्दी/ }));
    await waitFor(() =>
      expect(screen.getByText(/लक्ष्य 7% से थोड़ा अधिक/)).toBeInTheDocument(),
    );

    // Switch to Marathi — Marathi-specific phrasing should appear
    await user.click(screen.getByRole("tab", { name: /मराठी/ }));
    await waitFor(() =>
      expect(screen.getByText(/लक्ष्य 7% पेक्षा थोडासा जास्त/)).toBeInTheDocument(),
    );

    // Switch to Tamil — Tamil-specific phrasing should appear
    await user.click(screen.getByRole("tab", { name: /தமிழ்/ }));
    await waitFor(() =>
      expect(screen.getByText(/இலக்கான 7%-ஐ விட சற்று அதிகம்/)).toBeInTheDocument(),
    );
  });

  it("Download produces a real .pdf file (no print dialog)", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const downloadAttrs: string[] = [];
    const setAttributeOriginal =
      HTMLAnchorElement.prototype.setAttribute;
    Object.defineProperty(HTMLAnchorElement.prototype, "download", {
      configurable: true,
      set(value: string) {
        downloadAttrs.push(value);
        setAttributeOriginal.call(this, "download", value);
      },
      get() {
        return this.getAttribute("download") ?? "";
      },
    });

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

    expect(printSpy).not.toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(downloadAttrs[0]).toMatch(
      /^prescription_MRN-001_\d{4}-\d{2}-\d{2}\.pdf$/,
    );

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    clickSpy.mockRestore();
    delete (HTMLAnchorElement.prototype as unknown as { download?: string })
      .download;
  });

  it("Send to Patient reuses the same PDF artifact (same blob)", async () => {
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => {},
    );

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
      () =>
        expect(
          screen.getByRole("button", { name: /send to patient/i }),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );

    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    fireEvent.click(screen.getByRole("button", { name: /send to patient/i }));

    // Download produces a Blob; Send to Patient does not need to redownload,
    // so only the Download click should have created an object URL.
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);

    createObjectURLSpy.mockRestore();
  });
});
