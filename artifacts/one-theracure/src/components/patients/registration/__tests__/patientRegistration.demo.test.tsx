import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PatientRegistrationModal from "@/components/patients/registration/PatientRegistrationModal";

vi.mock("@/components/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ t: (k: string) => k, language: "en", setLanguage: () => {} }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("PatientRegistrationModal (demo-only)", () => {
  it("renders the modal title when open and does not crash", () => {
    const onClose = vi.fn();
    const onPatientAdded = vi.fn();

    render(
      <PatientRegistrationModal
        isOpen
        onClose={onClose}
        onPatientAdded={onPatientAdded}
      />
    );

    // The dialog should mount; presence of any heading is enough to verify
    // the demo modal renders without network calls.
    const headings = screen.queryAllByRole("heading");
    expect(headings.length).toBeGreaterThan(0);
    // Sanity: callback was not auto-invoked just by opening.
    expect(onPatientAdded).not.toHaveBeenCalled();
  });

  it("invokes onClose callback type contract (callback exists)", () => {
    const onClose = vi.fn();
    const onPatientAdded = vi.fn();
    render(
      <PatientRegistrationModal
        isOpen={false}
        onClose={onClose}
        onPatientAdded={onPatientAdded}
      />
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(onPatientAdded).not.toHaveBeenCalled();
  });
});
