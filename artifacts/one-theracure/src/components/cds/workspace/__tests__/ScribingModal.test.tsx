import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ScribingModal from "@/components/cds/workspace/ScribingModal";

// Minimal mock of webkitSpeechRecognition that fires onerror immediately on .start()
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;

  start() {
    // Fire onerror in next microtask to mimic permission/sandbox failure
    queueMicrotask(() => {
      this.onerror?.({ error: "not-allowed" });
    });
  }
  stop() {}
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { webkitSpeechRecognition: typeof MockSpeechRecognition }).webkitSpeechRecognition =
    MockSpeechRecognition;
  // Some envs check SpeechRecognition first
  (window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }).SpeechRecognition =
    MockSpeechRecognition;
});

const renderModal = (overrides: Partial<React.ComponentProps<typeof ScribingModal>> = {}) => {
  const onComplete = vi.fn();
  const onOpenChange = vi.fn();
  const utils = render(
    <ScribingModal
      open
      onOpenChange={onOpenChange}
      onComplete={onComplete}
      patientId="p-test"
      encounterId="enc-test"
      {...overrides}
    />,
  );
  return { ...utils, onComplete, onOpenChange };
};

describe("ScribingModal", () => {
  it("demo fallback fires when SpeechRecognition errors — transcript populates with demo text", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /start recording/i }));

    // onerror fires in microtask, then setTranscript renders demo
    await waitFor(() => {
      expect(screen.getByText(/58-year-old male/i)).toBeInTheDocument();
    });
  });

  it("Re-record clears transcript, timer, and structured sections", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
    await waitFor(() => expect(screen.getByText(/58-year-old male/i)).toBeInTheDocument());

    // Stop & Review
    fireEvent.click(screen.getByRole("button", { name: /stop & review/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /re-record/i })).toBeInTheDocument());

    // Re-record
    fireEvent.click(screen.getByRole("button", { name: /re-record/i }));

    await waitFor(() => {
      // Transcript demo string should be gone
      expect(screen.queryByText(/58-year-old male/i)).not.toBeInTheDocument();
      // Back to start state
      expect(screen.getByRole("button", { name: /start recording/i })).toBeInTheDocument();
      // Timer reset to 00:00
      expect(screen.getByText("00:00")).toBeInTheDocument();
    });
  });

  it("Use Transcript calls onComplete with the current transcript", async () => {
    const { onComplete } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
    await waitFor(() => expect(screen.getByText(/58-year-old male/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /stop & review/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /use transcript/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /use transcript/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [transcriptArg] = onComplete.mock.calls[0];
    expect(transcriptArg).toMatch(/58-year-old male/i);
  });
});
