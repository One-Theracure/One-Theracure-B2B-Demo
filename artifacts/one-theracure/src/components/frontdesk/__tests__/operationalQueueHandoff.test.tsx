import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OperationalQueueView from "../OperationalQueueView";

const mockCreate = vi.fn();
vi.mock("@/services/encountersService", () => ({
  encountersService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockEmit = vi.fn();
vi.mock("@/services/eventBus", () => ({
  eventBus: {
    emit: (...args: unknown[]) => mockEmit(...args),
    on: () => () => {},
  },
}));

// Toast hook fully mocked so we don't pull in the toast provider tree.
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("OperationalQueueView — Send to Doctor handoff", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockEmit.mockReset();
  });

  /**
   * The handoff button only appears once a patient is "arrived". To simulate
   * that without depending on randomly-generated mock data, we click the
   * "Mark Arrived" button on the first row first, then assert the Send
   * button shows up and creates an encounter when clicked.
   */
  it("creates an encounter and emits queue.sent-to-doctor when clicked", async () => {
    mockCreate.mockResolvedValue({ id: "enc-handoff-1" });
    render(<OperationalQueueView />);
    const user = userEvent.setup();

    // Find a row that is currently NOT arrived/in-consult/completed by
    // looking for a "Mark Arrived" button. Mark it arrived first.
    const markArrivedButtons = screen.queryAllByTitle(/Mark Arrived/i);
    if (markArrivedButtons.length > 0) {
      await user.click(markArrivedButtons[0]);
    }

    // Now the "Send to Doctor" button should be present.
    const sendButtons = await screen.findAllByTitle(/Send to Doctor/i);
    expect(sendButtons.length).toBeGreaterThan(0);

    await user.click(sendButtons[0]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    const createArgs = mockCreate.mock.calls[0][0];
    // Healthcare safety: provider AND org attribution come from the server
    // session. A front-desk client that could forge them could route a visit
    // to the wrong doctor or even the wrong clinic.
    expect(createArgs).not.toHaveProperty("providerId");
    expect(createArgs).not.toHaveProperty("providerName");
    expect(createArgs).not.toHaveProperty("orgId");
    expect(createArgs).not.toHaveProperty("clinicId");
    expect(createArgs).toMatchObject({ status: "active" });
    expect(createArgs.patientId).toBeTruthy();

    await waitFor(() => {
      expect(mockEmit).toHaveBeenCalledWith(
        "queue.sent-to-doctor",
        expect.objectContaining({ encounterId: "enc-handoff-1" }),
      );
    });
  });
});
