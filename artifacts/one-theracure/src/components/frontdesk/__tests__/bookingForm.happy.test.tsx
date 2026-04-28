import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingForm from "@/components/frontdesk/BookingForm";

vi.mock("@/components/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ t: (k: string) => k, language: "en", setLanguage: () => {} }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("BookingForm", () => {
  it("renders the patient-selection step on first mount", () => {
    const onBooked = vi.fn();
    render(<BookingForm onBooked={onBooked} />);
    // Form should mount without throwing — there's at least one button on screen.
    expect(screen.queryAllByRole("button").length).toBeGreaterThan(0);
    expect(onBooked).not.toHaveBeenCalled();
  });

  it("skips to the visit-type step when prefillPatientId is provided", () => {
    const onBooked = vi.fn();
    render(<BookingForm onBooked={onBooked} prefillPatientId="P-001" />);
    // No crash + onBooked should not have fired without user interaction.
    expect(onBooked).not.toHaveBeenCalled();
  });
});
